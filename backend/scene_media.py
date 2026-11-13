"""Signed local media service for Wallpaper Engine scene/web wallpapers.

The browser-side WebWallGL renderer fetches `project.json`, `scene.pkg` and
all loose resources through this router. Tokens are HMAC-signed absolute
project directories, so the renderer never receives a raw filesystem path and
cannot ask the backend for an unrelated file. Scene packages routinely exceed
300 MiB, therefore every response supports HTTP Range requests and is streamed
in bounded chunks instead of being buffered.
"""

from __future__ import annotations

import base64
import hashlib
import hmac
import json
import mimetypes
import os
import socket
import threading
from pathlib import Path
from urllib.parse import unquote

from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import Response, StreamingResponse
from hermes_constants import get_hermes_home

router = APIRouter()
media_router = APIRouter()

_ROOT = Path(__file__).resolve().parent / "webwallgl"
_CHUNK = 1024 * 1024
_MAX_DIAG_BYTES = 4 * 1024 * 1024
_secret_lock = threading.Lock()
_secret_cache: bytes | None = None
_media_lock = threading.Lock()
_media_origin: str | None = None

_MIME = {
    ".html": "text/html; charset=utf-8",
    ".htm": "text/html; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".mjs": "text/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".pkg": "application/octet-stream",
    ".tex": "application/octet-stream",
    ".mdl": "application/octet-stream",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif": "image/gif",
    ".webp": "image/webp",
    ".svg": "image/svg+xml",
    ".mp4": "video/mp4",
    ".webm": "video/webm",
    ".mov": "video/quicktime",
    ".mp3": "audio/mpeg",
    ".ogg": "audio/ogg",
    ".wav": "audio/wav",
    ".woff": "font/woff",
    ".woff2": "font/woff2",
    ".ttf": "font/ttf",
    ".otf": "font/otf",
}


def _secret() -> bytes:
    global _secret_cache
    if _secret_cache is not None:
        return _secret_cache
    with _secret_lock:
        if _secret_cache is not None:
            return _secret_cache
        key_file = get_hermes_home() / "skin-center" / "we-media.key"
        try:
            if key_file.is_file():
                _secret_cache = bytes.fromhex(key_file.read_text(encoding="ascii").strip())
        except (OSError, ValueError):
            _secret_cache = None
        if not _secret_cache:
            key_file.parent.mkdir(parents=True, exist_ok=True)
            value = os.urandom(32)
            key_file.write_text(value.hex(), encoding="ascii")
            _secret_cache = value
        return _secret_cache


def _b64encode(value: bytes) -> str:
    return base64.urlsafe_b64encode(value).decode("ascii").rstrip("=")


def _b64decode(value: str) -> bytes:
    return base64.urlsafe_b64decode(value + "=" * (-len(value) % 4))


def _sign(payload: str) -> str:
    digest = hmac.new(_secret(), payload.encode("ascii"), hashlib.sha256).digest()[:18]
    return _b64encode(digest)


def _token_for(directory: Path) -> str:
    payload = _b64encode(str(directory).encode("utf-8"))
    return f"{payload}.{_sign(payload)}"


def ensure_media_server() -> str:
    """Start the token-only loopback media origin once and return its base URL.

    Hermes' dashboard routes are capability-gated; the scene iframe is a
    separate document and cannot present the Electron native ticket. A second
    uvicorn instance on an ephemeral loopback port serves only signed-token
    file routes, so the renderer gets Range streaming without weakening the
    authenticated dashboard API.
    """
    global _media_origin
    if _media_origin:
        return _media_origin
    with _media_lock:
        if _media_origin:
            return _media_origin
        import uvicorn
        from fastapi import FastAPI

        app = FastAPI()
        app.include_router(media_router, prefix="/api/plugins/hermes-skins")
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        sock.bind(("127.0.0.1", 0))
        sock.listen(128)
        port = sock.getsockname()[1]
        config = uvicorn.Config(app, log_level="error", access_log=False, lifespan="off")
        server = uvicorn.Server(config)
        thread = threading.Thread(target=server.run, kwargs={"sockets": [sock]},
                                  name="hermes-skins-media", daemon=True)
        thread.start()
        for _ in range(100):
            if server.started:
                break
            threading.Event().wait(0.02)
        if not server.started:
            sock.close()
            raise RuntimeError("scene media origin did not start")
        _media_origin = f"http://127.0.0.1:{port}"
        return _media_origin


def _directory_for(token: str) -> Path:
    if not isinstance(token, str) or len(token) > 4096 or token.count(".") != 1:
        raise HTTPException(status_code=400, detail="invalid media token")
    payload, signature = token.split(".", 1)
    if not hmac.compare_digest(signature, _sign(payload)):
        raise HTTPException(status_code=403, detail="invalid media token")
    try:
        directory = Path(_b64decode(payload).decode("utf-8")).resolve()
    except (ValueError, OSError, UnicodeDecodeError):
        raise HTTPException(status_code=400, detail="invalid media token") from None
    if not directory.is_dir():
        raise HTTPException(status_code=404, detail="project directory missing")
    return directory


def _project(directory: Path) -> dict:
    project_file = directory / "project.json"
    if not project_file.is_file() or project_file.is_symlink():
        raise HTTPException(status_code=404, detail="project.json missing")
    try:
        data = json.loads(project_file.read_text(encoding="utf-8-sig"))
    except (OSError, ValueError):
        raise HTTPException(status_code=422, detail="project.json is invalid") from None
    if not isinstance(data, dict):
        raise HTTPException(status_code=422, detail="project.json is invalid")
    kind = str(data.get("type", "")).strip().lower()
    if kind not in {"scene", "web", "video", "image"}:
        raise HTTPException(status_code=415, detail=f"unsupported wallpaper type: {kind or 'unknown'}")
    if kind == "scene" and not (directory / "scene.pkg").is_file():
        # Loose scene projects are valid too; the renderer reads scene.json.
        if not (directory / "scene.json").is_file():
            raise HTTPException(status_code=404, detail="scene.pkg or scene.json missing")
    return data


def _project_token(raw: str | None) -> tuple[Path, dict]:
    if not isinstance(raw, str) or len(raw) > 4096:
        raise HTTPException(status_code=400, detail="project directory required")
    try:
        directory = Path(raw).expanduser().resolve()
    except (OSError, ValueError):
        raise HTTPException(status_code=400, detail="invalid project directory") from None
    if not directory.is_dir() or directory.is_symlink():
        raise HTTPException(status_code=404, detail="project directory missing")
    return directory, _project(directory)


def _directory_from_manifest(manifest_path: str | None) -> Path | None:
    if not isinstance(manifest_path, str) or not manifest_path.lower().endswith(".json"):
        return None
    try:
        manifest = Path(manifest_path).resolve()
        if not manifest.is_file() or manifest.is_symlink():
            return None
        payload = json.loads(manifest.read_text(encoding="utf-8"))
        scene_path = payload.get("scenePath")
        if not isinstance(scene_path, str) or not scene_path:
            return None
        directory = Path(scene_path).resolve().parent
        return directory if directory.is_dir() else None
    except (OSError, ValueError, TypeError):
        return None


def _safe_child(root: Path, relative: str) -> Path:
    relative = unquote(relative or "project.json").replace("\\", "/").lstrip("/")
    if not relative or "\x00" in relative:
        relative = "project.json"
    parts = [part for part in relative.split("/") if part not in ("", ".")]
    if any(part == ".." or ":" in part for part in parts):
        raise HTTPException(status_code=403, detail="path traversal refused")
    candidate = (root / Path(*parts)).resolve()
    try:
        candidate.relative_to(root)
    except ValueError:
        raise HTTPException(status_code=403, detail="path traversal refused") from None
    if not candidate.is_file() or candidate.is_symlink():
        raise HTTPException(status_code=404, detail="file missing")
    return candidate


def _content_type(path: Path) -> str:
    return _MIME.get(path.suffix.lower()) or mimetypes.guess_type(path.name)[0] or "application/octet-stream"


def _iter_file(path: Path, start: int, end: int):
    remaining = end - start + 1
    with path.open("rb") as handle:
        handle.seek(start)
        while remaining > 0:
            chunk = handle.read(min(_CHUNK, remaining))
            if not chunk:
                break
            remaining -= len(chunk)
            yield chunk


def _range_for(header: str | None, size: int) -> tuple[int, int] | None:
    if not header or not header.lower().startswith("bytes="):
        return None
    value = header[6:].strip()
    if "," in value:
        value = value.split(",", 1)[0].strip()
    try:
        start_raw, end_raw = value.split("-", 1)
        if start_raw == "":
            suffix = int(end_raw)
            if suffix <= 0:
                return None
            return max(0, size - suffix), size - 1
        start = int(start_raw)
        end = size - 1 if end_raw == "" else int(end_raw)
    except ValueError:
        return None
    if start < 0 or start >= size or end < start:
        return None
    return start, min(end, size - 1)


def _serve(request: Request, path: Path, *, cache: str = "no-store") -> Response:
    stat = path.stat()
    size = stat.st_size
    content_type = _content_type(path)
    headers = {
        "Accept-Ranges": "bytes",
        "Access-Control-Allow-Origin": "*",
        "Cross-Origin-Resource-Policy": "cross-origin",
        "Cache-Control": cache,
        "X-Content-Type-Options": "nosniff",
    }
    requested = _range_for(request.headers.get("range"), size)
    if requested is None:
        headers["Content-Length"] = str(size)
        if request.method == "HEAD":
            return Response(status_code=200, headers=headers, media_type=content_type)
        return StreamingResponse(_iter_file(path, 0, size - 1), status_code=200,
                                 headers=headers, media_type=content_type)
    start, end = requested
    headers["Content-Range"] = f"bytes {start}-{end}/{size}"
    headers["Content-Length"] = str(end - start + 1)
    if request.method == "HEAD":
        return Response(status_code=206, headers=headers, media_type=content_type)
    return StreamingResponse(_iter_file(path, start, end), status_code=206,
                             headers=headers, media_type=content_type)


@router.post("/scene/open")
async def scene_open(body: dict):
    body = body or {}
    directory = _directory_from_manifest(body.get("manifestPath"))
    if directory is None:
        directory, project = _project_token(body.get("dir"))
    else:
        project = _project(directory)
    token = _token_for(directory)
    origin = ensure_media_server()
    preview = project.get("preview")
    return {
        "ok": True,
        "token": token,
        "mediaOrigin": origin,
        "base": f"{origin}/api/plugins/hermes-skins/scene/files/{token}",
        "type": str(project.get("type", "")).lower(),
        "title": str(project.get("title", "") or directory.name)[:200],
        "file": str(project.get("file", "") or "")[:1024],
        "preview": str(preview)[:1024] if isinstance(preview, str) else None,
        "dir": str(directory),
    }


@media_router.api_route("/scene/files/{token}/{path:path}", methods=["GET", "HEAD"])
async def scene_file(request: Request, token: str, path: str = "project.json"):
    directory = _directory_for(token)
    target = _safe_child(directory, path)
    return _serve(request, target)


@media_router.api_route("/scene/live/{path:path}", methods=["GET", "HEAD"])
async def scene_live(request: Request, path: str = "index.html"):
    target = _safe_child(_ROOT, path or "index.html")
    cache = "public, max-age=31536000, immutable" if target.suffix.lower() in {".js", ".mjs"} else "no-store"
    return _serve(request, target, cache=cache)


@media_router.get("/scene/diag")
async def scene_diag(msg: str = "", lvl: str = "info"):
    message = str(msg or "")[:500]
    level = lvl if lvl in {"error", "warn"} else "info"
    try:
        log = get_hermes_home() / "skin-center" / "scene-diag.jsonl"
        log.parent.mkdir(parents=True, exist_ok=True)
        if log.is_file() and log.stat().st_size > _MAX_DIAG_BYTES:
            log.replace(log.with_suffix(".jsonl.old"))
        with log.open("a", encoding="utf-8") as handle:
            handle.write(json.dumps({"level": level, "message": message}, ensure_ascii=False) + "\n")
    except OSError:
        pass
    return {"ok": True}


router.include_router(media_router)
