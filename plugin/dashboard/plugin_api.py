"""Local Wallpaper Engine scene extraction for the Hermes Skins desktop plugin.

Scene packages are parsed by the vendored dsh-skins helper. The API only accepts
an existing Wallpaper Engine project directory and writes derived assets into
Hermes' own cache. Steam files are never modified.
"""

from __future__ import annotations

import asyncio
import hashlib
import json
import os
import shutil
import subprocess
from pathlib import Path

from fastapi import APIRouter
from hermes_constants import get_hermes_home

router = APIRouter()
_lock = asyncio.Lock()
_MAX_PKG_BYTES = 512 * 1024 * 1024


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
    key = hashlib.sha256(f"{package}:{stat.st_size}:{stat.st_mtime_ns}".encode()).hexdigest()[:24]
    return get_hermes_home() / "skin-center" / "scene-cache" / key


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
    return {"ok": bool(_node_path() and Path(__file__).with_name("scene-helper.mjs").is_file())}


@router.post("/scene/prepare")
async def scene_prepare(body: dict):
    files = _project_files((body or {}).get("dir"))
    if not files:
        return {"ok": False, "error": "valid Wallpaper Engine scene project not found"}
    project, package = files
    async with _lock:
        return await asyncio.to_thread(_prepare_scene, project, package)
