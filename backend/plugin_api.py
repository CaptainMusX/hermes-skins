"""Local Wallpaper Engine scene extraction for the Hermes wallpaper plugin.

Scene packages are parsed by the vendored dsh-skins helper. The API only accepts
an existing Wallpaper Engine project directory and writes derived assets into
Hermes' own cache. Steam files are never modified.
"""

from __future__ import annotations

import asyncio
import hashlib
import importlib.util
import json
import os
import shutil
import subprocess
import re
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

try:
    import winreg
except ImportError:  # pragma: no cover - non-Windows hosts return an empty list
    winreg = None

from fastapi import APIRouter
from hermes_constants import get_hermes_home

router = APIRouter()
_lock = asyncio.Lock()
_MAX_PKG_BYTES = 512 * 1024 * 1024
# Scene manifest parser version. Bump when pkg-extract.ts gains manifest fields
# so prepared caches are rebuilt: v2 adds per-layer cursor flags (cursorHide
# for hide-near-cursor scripts), v3 adds the WE xray effect (xrayBlendUrl/
# Size/Multiply for cursor reveal layers such as the butterfly wallpaper).
# v6 drops the experimental cursor-driven water-ripple effect for lightweight
# resource efficiency while keeping the butterfly cursor/xray and shake
# features. The player also ignores legacy ripple fields in saved caches.
_PARSER_VERSION = 6
_font_cache = None
_MAX_UPLOAD_BYTES = 512 * 1024 * 1024
_URL_TIMEOUT_SECONDS = 30
_MEDIA_EXTENSIONS = {
    ".mp4": "video", ".webm": "video", ".mov": "video", ".mkv": "video",
    ".png": "image", ".jpg": "image", ".jpeg": "image", ".webp": "image",
    ".gif": "image", ".bmp": "image"
}

# The signed media service lives in its own module: scene packages are
# hundreds of MiB and need Range streaming, which is unrelated to extraction.
_media_spec = importlib.util.spec_from_file_location(
    "hermes_skins_scene_media", Path(__file__).with_name("scene_media.py")
)
if _media_spec is None or _media_spec.loader is None:
    raise RuntimeError("Hermes Skins media service is missing")
_media = importlib.util.module_from_spec(_media_spec)
_media_spec.loader.exec_module(_media)
router.include_router(_media.router)


def _node_path() -> str | None:
    home = get_hermes_home()
    bundled = home / "node" / ("node.exe" if os.name == "nt" else "node")
    if bundled.is_file():
        return str(bundled)
    return shutil.which("node")


def _project_files(raw_dir: str) -> tuple[Path, Path] | None:
    if not isinstance(raw_dir, str) or len(raw_dir) > 1024:
        return None
    directory = Path(raw_dir)
    if not directory.is_dir() or directory.is_symlink():
        return None
    project = directory / "project.json"
    package = directory / "scene.pkg"
    if not project.is_file() or not package.is_file() or project.is_symlink() or package.is_symlink():
        return None
    try:
        data = json.loads(project.read_text(encoding="utf-8-sig"))
        if str(data.get("type", "")).lower() != "scene":
            return None
        if package.stat().st_size > _MAX_PKG_BYTES:
            return None
    except (OSError, ValueError, TypeError):
        return None
    return project.resolve(), package.resolve()


def _cache_dir(package: Path) -> Path:
    stat = package.stat()
    key = hashlib.sha256(f"{package}:{stat.st_size}:{stat.st_mtime_ns}:v{_PARSER_VERSION}".encode()).hexdigest()[:24]
    return get_hermes_home() / "skin-center" / "scene-cache" / key


def _data_root() -> Path:
    root = get_hermes_home() / "hermes-skins"
    root.mkdir(parents=True, exist_ok=True)
    return root


def _uploads_dir() -> Path:
    directory = _data_root() / "uploads"
    directory.mkdir(parents=True, exist_ok=True)
    return directory


def _safe_name(value: str, fallback: str = "wallpaper") -> str:
    name = re.sub(r"[^A-Za-z0-9._ -]+", "-", str(value or "")).strip(" .-")
    return (name or fallback)[:120]


def _media_kind(path: Path) -> str | None:
    return _MEDIA_EXTENSIONS.get(path.suffix.lower())


def _unique_destination(directory: Path, name: str, suffix: str = "") -> Path:
    stem = _safe_name(Path(name).stem)
    extension = suffix or Path(name).suffix.lower()
    candidate = directory / f"{stem}{extension}"
    index = 2
    while candidate.exists():
        candidate = directory / f"{stem} ({index}){extension}"
        index += 1
    return candidate


def _upload_item(path: Path, source: str = "upload") -> dict:
    kind = _media_kind(path) or "image"
    return {
        "id": f"upload:{path.resolve()}".lower(),
        "title": path.stem[:120],
        "kind": kind,
        "mediaType": kind,
        "source": source,
        "mediaPath": str(path),
        "previewPath": str(path) if kind == "image" else None,
        "dir": str(path.parent),
        "workshopId": None,
    }


def _download(url: str, destination: Path) -> None:
    request = urllib.request.Request(url, headers={"User-Agent": "Hermes-Wallpaper-Engine/2.0"})
    with urllib.request.urlopen(request, timeout=_URL_TIMEOUT_SECONDS) as response:
        if response.status < 200 or response.status >= 300:
            raise ValueError(f"download returned HTTP {response.status}")
        declared = response.headers.get("Content-Length")
        if declared and int(declared) > _MAX_UPLOAD_BYTES:
            raise ValueError("download is larger than 512 MiB")
        written = 0
        with destination.open("wb") as handle:
            while True:
                chunk = response.read(1024 * 1024)
                if not chunk:
                    break
                written += len(chunk)
                if written > _MAX_UPLOAD_BYTES:
                    raise ValueError("download is larger than 512 MiB")
                handle.write(chunk)
        if not written:
            raise ValueError("download returned an empty file")


def _prepare_scene(project: Path, package: Path) -> dict:
    node = _node_path()
    helper = Path(__file__).with_name("scene-helper.mjs")
    if not node or not helper.is_file():
        return {"ok": False, "error": "scene helper or Node.js runtime unavailable"}
    cache = _cache_dir(package)
    manifest_path = cache / "manifest.json"
    if manifest_path.is_file():
        try:
            cached = json.loads(manifest_path.read_text(encoding="utf-8"))
            if cached.get("parserVersion", 0) < _PARSER_VERSION:
                raise ValueError("scene cache uses an obsolete parser")
            return {"ok": True, "cached": True, "manifestPath": str(manifest_path),
                    "framePath": cached.get("framePath"), "videoPath": cached.get("videoPath"),
                    "manifest": bool(cached.get("manifest")), "scripted": bool(cached.get("scripted")),
                    "resourceCount": len(cached.get("resources") or {}),
                    "missingCount": len(cached.get("missing") or [])}
        except (OSError, ValueError):
            pass
    cache.mkdir(parents=True, exist_ok=True)
    flags = subprocess.CREATE_NO_WINDOW if os.name == "nt" else 0
    try:
        result = subprocess.run(
            [node, str(helper), "prepare", str(package), str(project), str(cache)],
            capture_output=True, text=True, timeout=180, creationflags=flags, check=False,
        )
    except (OSError, subprocess.TimeoutExpired) as exc:
        return {"ok": False, "error": f"scene extraction failed: {exc}"}
    if result.returncode != 0:
        return {"ok": False, "error": result.stderr[-2000:] or "scene extraction failed"}
    try:
        payload = json.loads(result.stdout)
    except ValueError:
        return {"ok": False, "error": "scene helper returned invalid output"}
    return {"ok": True, "cached": False, **payload}


@router.get("/scene/health")
async def scene_health():
    engine = Path(__file__).with_name("webwallgl") / "engine" / "webwallgl.global.min.js"
    renderer = Path(__file__).with_name("webwallgl") / "renderer.js"
    return {
        "ok": bool(_node_path() and Path(__file__).with_name("scene-helper.mjs").is_file()),
        "webwallgl": engine.is_file() and renderer.is_file(),
        "renderer": str(renderer) if renderer.is_file() else None,
    }


@router.get("/fonts")
async def installed_fonts():
    """Family names installed for the current Windows user/machine."""
    global _font_cache
    if _font_cache is not None:
        return {"ok": True, "fonts": _font_cache}
    if os.name != "nt" or winreg is None:
        _font_cache = []
        return {"ok": True, "fonts": []}
    names = set()
    try:
        for root in (winreg.HKEY_LOCAL_MACHINE, winreg.HKEY_CURRENT_USER):
            key = winreg.OpenKey(root, r"SOFTWARE\Microsoft\Windows NT\CurrentVersion\Fonts")
            try:
                for index in range(winreg.QueryInfoKey(key)[1]):
                    name = winreg.EnumValue(key, index)[0]
                    name = re.sub(r"\s*\((?:TrueType|OpenType|All res|PostScript).*?\)\s*$", "", name).strip()
                    if name:
                        names.add(name)
            finally:
                key.Close()
    except OSError:
        pass
    _font_cache = sorted(names, key=lambda value: value.casefold())
    return {"ok": True, "fonts": _font_cache}


@router.get("/uploads")
async def uploaded_wallpapers():
    items = []
    for path in sorted(_uploads_dir().iterdir(), key=lambda item: item.name.casefold()):
        if path.is_file() and not path.is_symlink() and _media_kind(path):
            items.append(_upload_item(path))
    return {"ok": True, "items": items}


@router.post("/uploads/import")
async def import_uploaded_wallpapers(body: dict):
    paths = body.get("paths") if isinstance(body, dict) else None
    if not isinstance(paths, list):
        return {"ok": False, "error": "paths must be an array"}
    imported = []
    rejected = []
    destination_dir = _uploads_dir()
    for raw in paths[:50]:
        if not isinstance(raw, str) or len(raw) > 2048:
            rejected.append({"path": str(raw)[:200], "error": "invalid path"})
            continue
        source = Path(raw)
        try:
            if not source.is_file() or source.is_symlink():
                raise ValueError("file not found")
            kind = _media_kind(source)
            if not kind:
                raise ValueError("unsupported media type")
            if source.stat().st_size > _MAX_UPLOAD_BYTES:
                raise ValueError("file is larger than 512 MiB")
            destination = _unique_destination(destination_dir, source.name)
            await asyncio.to_thread(shutil.copy2, source, destination)
            imported.append(_upload_item(destination))
        except (OSError, ValueError) as exc:
            rejected.append({"path": raw[:200], "error": str(exc)})
    return {"ok": True, "items": imported, "rejected": rejected}


@router.post("/uploads/url")
async def import_url_wallpaper(body: dict):
    if not isinstance(body, dict):
        return {"ok": False, "error": "JSON body required"}
    raw_url = body.get("url")
    if not isinstance(raw_url, str) or len(raw_url) > 2048:
        return {"ok": False, "error": "invalid URL"}
    parsed = urllib.parse.urlparse(raw_url)
    if parsed.scheme not in ("http", "https") or not parsed.hostname:
        return {"ok": False, "error": "only http(s) URLs are supported"}
    suffix = Path(parsed.path).suffix.lower()
    if suffix not in _MEDIA_EXTENSIONS:
        return {"ok": False, "error": "URL must end in a supported image or video extension"}
    destination = _unique_destination(_uploads_dir(), Path(parsed.path).name, suffix)
    try:
        await asyncio.to_thread(_download, raw_url, destination)
    except (OSError, ValueError, urllib.error.URLError) as exc:
        destination.unlink(missing_ok=True)
        return {"ok": False, "error": f"download failed: {exc}"}
    return {"ok": True, "item": _upload_item(destination, "url")}


@router.post("/uploads/bing")
async def import_bing_wallpaper(body: dict | None = None):
    index = 0
    if isinstance(body, dict):
        try:
            index = max(0, min(7, int(body.get("index", 0))))
        except (TypeError, ValueError):
            index = 0
    try:
        request = urllib.request.Request(
            f"https://www.bing.com/HPImageArchive.aspx?format=js&idx={index}&n=1&mkt=zh-CN",
            headers={"User-Agent": "Hermes-Wallpaper-Engine/2.0"},
        )
        with urllib.request.urlopen(request, timeout=_URL_TIMEOUT_SECONDS) as response:
            payload = json.loads(response.read().decode("utf-8"))
        image = payload["images"][0]
        relative = image["url"]
        title = _safe_name(str(image.get("title") or "Bing wallpaper"))
        destination = _unique_destination(_uploads_dir(), title, ".jpg")
        await asyncio.to_thread(_download, "https://www.bing.com" + relative, destination)
        item = _upload_item(destination, "bing")
        item["title"] = title
        item["copyright"] = image.get("copyright")
        return {"ok": True, "item": item}
    except (OSError, ValueError, KeyError, IndexError, TypeError, urllib.error.URLError) as exc:
        return {"ok": False, "error": f"Bing download failed: {exc}"}


def _directory_size(path: Path) -> int:
    total = 0
    if not path.is_dir():
        return total
    for item in path.rglob("*"):
        try:
            if item.is_file() and not item.is_symlink():
                total += item.stat().st_size
        except OSError:
            continue
    return total


def _tail(path: Path, limit: int = 120) -> list[str]:
    if not path.is_file():
        return []
    try:
        with path.open("r", encoding="utf-8", errors="replace") as handle:
            return [line.rstrip() for line in handle.readlines()[-limit:]]
    except OSError:
        return []


@router.get("/system/diagnostics")
async def system_diagnostics():
    home = get_hermes_home()
    scene_cache = home / "skin-center" / "scene-cache"
    uploads = _uploads_dir()
    logs = home / "logs"
    log_files = []
    if logs.is_dir():
        for path in sorted(logs.glob("*.log"), key=lambda item: item.stat().st_mtime, reverse=True)[:3]:
            log_files.append({
                "name": path.name,
                "size": path.stat().st_size,
                "modified": path.stat().st_mtime,
                "tail": _tail(path),
            })
    engine = Path(__file__).with_name("webwallgl") / "engine" / "webwallgl.global.min.js"
    renderer = Path(__file__).with_name("webwallgl") / "renderer.js"
    return {
        "ok": True,
        "version": _plugin_version(),
        "node": _node_path(),
        "webwallgl": engine.is_file() and renderer.is_file(),
        "fonts": len(_font_cache or []),
        "paths": {
            "data": str(_data_root()),
            "uploads": str(uploads),
            "sceneCache": str(scene_cache),
        },
        "sizes": {
            "uploads": _directory_size(uploads),
            "sceneCache": _directory_size(scene_cache),
        },
        "logs": log_files,
    }


def _plugin_version() -> str:
    for candidate in (Path(__file__).parent.parent / "plugin.yaml", Path(__file__).with_name("plugin.yaml")):
        try:
            text = candidate.read_text(encoding="utf-8")
            match = re.search(r"^version:\s*[\"']?([^\"'\s]+)", text, re.MULTILINE)
            if match:
                return match.group(1)
        except OSError:
            continue
    return "2.0.0"


@router.post("/system/cache/clear")
async def clear_scene_cache(body: dict | None = None):
    scope = (body or {}).get("scope", "scene") if isinstance(body or {}, dict) else "scene"
    home = get_hermes_home().resolve()
    targets = []
    if scope in ("scene", "all"):
        targets.append((home / "skin-center" / "scene-cache").resolve())
    if scope == "uploads":
        targets.append(_uploads_dir().resolve())
    removed = []
    for target in targets:
        if home not in target.parents and target != home:
            continue
        if target.exists():
            await asyncio.to_thread(shutil.rmtree, target, True)
            removed.append(str(target))
        if target.name == "uploads":
            target.mkdir(parents=True, exist_ok=True)
    return {"ok": True, "removed": removed, "time": time.time()}


@router.get("/now-playing")
async def now_playing():
    if os.name != "nt":
        return {"ok": False, "error": "system media integration is Windows-only"}
    script = r"""
$ErrorActionPreference = 'Stop'
[void][Windows.Media.Control.GlobalSystemMediaTransportControlsSessionManager, Windows.Media.Control, ContentType=WindowsRuntime]
$manager = [Windows.Media.Control.GlobalSystemMediaTransportControlsSessionManager]::RequestAsync().GetAwaiter().GetResult()
$session = $manager.GetCurrentSession()
if ($null -eq $session) { '{"ok":false}'; exit 0 }
$props = $session.TryGetMediaPropertiesAsync().GetAwaiter().GetResult()
$info = $session.GetPlaybackInfo()
$timeline = $session.GetTimelineProperties()
[pscustomobject]@{
  ok = $true
  title = $props.Title
  artist = $props.Artist
  album = $props.AlbumTitle
  playing = [string]$info.PlaybackStatus
  position = [double]$timeline.Position.TotalSeconds
  duration = [double]$timeline.EndTime.TotalSeconds
} | ConvertTo-Json -Compress
"""
    try:
        flags = subprocess.CREATE_NO_WINDOW if os.name == "nt" else 0
        result = await asyncio.to_thread(
            subprocess.run,
            ["powershell.exe", "-NoProfile", "-NonInteractive", "-Command", script],
            capture_output=True, text=True, timeout=8, creationflags=flags, check=False,
        )
        if result.returncode != 0 or not result.stdout.strip():
            return {"ok": False, "error": (result.stderr or "no media session").strip()[-500:]}
        payload = json.loads(result.stdout.strip().splitlines()[-1])
        return payload if isinstance(payload, dict) else {"ok": False}
    except (OSError, ValueError, subprocess.TimeoutExpired) as exc:
        return {"ok": False, "error": str(exc)}


@router.post("/scene/prepare")
async def scene_prepare(body: dict):
    files = _project_files((body or {}).get("dir"))
    if not files:
        return {"ok": False, "error": "valid Wallpaper Engine scene project not found"}
    project, package = files
    async with _lock:
        return await asyncio.to_thread(_prepare_scene, project, package)
