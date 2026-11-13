/**
 * Thin client for the signed WebWallGL media service.
 *
 * The backend returns a tokenised project base; this module only builds the
 * renderer URL and caches `open` results so a slider drag never re-signs the
 * same project directory. No filesystem path reaches the iframe.
 */
const OPEN_TTL_MS = 10 * 60 * 1000
const opened = new Map()
let backendOriginCache = null

const encodePath = value => String(value || 'index.html').replace(/\\/g, '/')
  .split('/').filter(Boolean).map(encodeURIComponent).join('/')

export async function resolveBackendOrigin() {
  if (backendOriginCache) return backendOriginCache
  try {
    const connection = await window.hermesDesktop?.getConnection?.()
    if (connection?.baseUrl) {
      backendOriginCache = String(connection.baseUrl).replace(/\/+$/, '')
      return backendOriginCache
    }
  } catch { /* Plain browser / older host. */ }
  backendOriginCache = typeof location !== 'undefined' && location.protocol !== 'file:'
    ? location.origin : ''
  return backendOriginCache
}

export async function openLiveProject(openScene, { dir = null, manifestPath = null } = {}) {
  if (typeof openScene !== 'function') throw new Error('Scene backend is unavailable')
  const key = `${dir || ''}|${manifestPath || ''}`
  const cached = opened.get(key)
  if (cached && Date.now() - cached.at < OPEN_TTL_MS) return cached.value
  const value = await openScene({ dir, manifestPath })
  if (!value?.ok || !value.base || !value.token) {
    throw new Error(value?.error || 'Scene backend refused this wallpaper')
  }
  opened.set(key, { at: Date.now(), value })
  while (opened.size > 24) opened.delete(opened.keys().next().value)
  return value
}

export function liveSceneUrl(project, options = {}) {
  if (!project?.token) throw new Error('Scene project has no media token')
  const origin = project.mediaOrigin || options.origin ||
    (typeof location !== 'undefined' && location.protocol !== 'file:' ? location.origin : '')
  if (!origin) throw new Error('Hermes backend origin is unavailable')
  const params = new URLSearchParams({
    type: 'scene',
    fit: options.fit || 'cover',
    sceneFps: String(options.fps || 30),
    muted: options.muted ? 'true' : 'false',
    src: project.token,
    mediaBase: `${origin}/api/plugins/hermes-skins/scene/files`
  })
  if (options.autoQuality === false) params.set('autoq', '0')
  if (Number(options.renderDpr) > 0) params.set('renderDpr', String(options.renderDpr))
  if (Number(options.videoTexScale) > 0) params.set('vidscale', String(options.videoTexScale))
  return `${origin}/api/plugins/hermes-skins/scene/live/index.html?${params.toString()}`
}

export function liveWebUrl(project, file, options = {}) {
  if (!project?.base) throw new Error('Web project has no media base')
  const origin = project.mediaOrigin || options.origin ||
    (typeof location !== 'undefined' && location.protocol !== 'file:' ? location.origin : '')
  if (!origin) throw new Error('Hermes backend origin is unavailable')
  const base = /^https?:\/\//i.test(project.base) ? project.base : `${origin}${project.base}`
  const entry = `${base}/${encodePath(file)}`
  const params = new URLSearchParams({
    type: 'web',
    fit: options.fit || 'cover',
    sceneFps: String(options.fps || 30),
    muted: options.muted ? 'true' : 'false',
    src: entry,
    mediaBase: `${origin}/api/plugins/hermes-skins/scene/files`
  })
  if (options.autoQuality === false) params.set('autoq', '0')
  return `${origin}/api/plugins/hermes-skins/scene/live/index.html?${params.toString()}`
}

export function clearLiveProjectCache() {
  opened.clear()
}
