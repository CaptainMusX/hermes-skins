import { wallpaperMediaUrl } from './we-library.js'

/** Turn one scanned Wallpaper Engine item into the config patch the controller applies. */
export async function resolveWallpaperSelection(item, openScene) {
  if (!item || typeof item !== 'object') throw new Error('Invalid wallpaper item')
  let source = wallpaperMediaUrl(item.mediaPath, item.mediaType)
  let type = item.mediaType
  let framePath = null
  let staticFallback = Boolean(item.staticFallback)

  if (item.kind === 'scene' || item.kind === 'web') {
    if (typeof openScene !== 'function') throw new Error('Scene backend is unavailable')
    const opened = await openScene({ dir: item.dir })
    if (!opened?.ok) throw new Error(opened?.error || 'Scene backend refused this wallpaper')
    source = item.dir
    type = item.kind
    framePath = item.kind === 'scene' ? (item.previewPath || null) : null
    staticFallback = false
  }

  return {
    wallpaperEnabled: true,
    wallpaperType: type,
    wallpaperSource: source,
    weSelection: {
      id: item.id,
      title: item.title,
      kind: item.kind,
      source: item.source || '',
      staticFallback,
      dir: item.dir,
      manifestPath: null,
      framePath,
      previewPath: item.previewPath || null,
      slides: Array.isArray(item.slides) ? item.slides : [],
      slideIntervalMs: Number.isFinite(Number(item.slideIntervalMs)) ? Number(item.slideIntervalMs) : null,
      properties: Array.isArray(item.properties) ? item.properties : []
    }
  }
}

export function activeRotationGroup(config) {
  const groups = Array.isArray(config?.rotationGroups) ? config.rotationGroups : []
  return groups.find(group => group.id === config?.rotationGroupId) || null
}

export function groupWallpapers(items, group, hiddenIds = []) {
  const byId = new Map((Array.isArray(items) ? items : []).map(item => [item.id, item]))
  const hidden = new Set(hiddenIds)
  return (group?.wallpaperIds || [])
    .map(id => byId.get(id))
    .filter(item => item && item.id && item.dir && item.mediaPath && !hidden.has(item.id))
}

export function rotationCandidates(items, hiddenIds = [], group = null) {
  const hidden = new Set(hiddenIds)
  const pool = group ? groupWallpapers(items, group, hiddenIds) : (Array.isArray(items) ? items : [])
  return pool.filter(item =>
    item && typeof item.id === 'string' && item.dir && item.mediaPath && !hidden.has(item.id))
}
