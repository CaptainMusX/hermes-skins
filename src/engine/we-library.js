/** Wallpaper Engine library discovery through Hermes Desktop's local file bridge. */
const STEAM_APP_ID = '431960'
const VIDEO_EXTENSIONS = /\.(mp4|webm|mov|mkv|avi)$/i
const IMAGE_EXTENSIONS = /\.(png|jpe?g|webp|gif|bmp)$/i

export const joinLocalPath = (base, ...parts) =>
  [String(base).replace(/[\\/]+$/, ''), ...parts.map(part => String(part).replace(/^[\\/]+|[\\/]+$/g, ''))].join('\\')

export function safeProjectPath(dir, relative) {
  if (typeof relative !== 'string' || !relative.trim()) return null
  const parts = relative.replace(/\\/g, '/').split('/')
  if (parts.some(part => !part || part === '.' || part === '..' || part.includes(':'))) return null
  return joinLocalPath(dir, ...parts)
}

export function wallpaperMediaUrl(path, type) {
  if (type === 'video') return `hermes-media://stream/${encodeURIComponent(path)}`
  return path
}

async function entriesAt(bridge, path) {
  try {
    const result = await bridge.readDir(path)
    return !result?.error && Array.isArray(result?.entries) ? result.entries : null
  } catch {
    return null
  }
}

async function textAt(bridge, path) {
  try {
    const result = await bridge.readFileText(path)
    return result?.truncated ? null : result?.text || null
  } catch {
    return null
  }
}

async function existsAt(bridge, path) {
  const normalized = String(path).replace(/\//g, '\\')
  const index = normalized.lastIndexOf('\\')
  if (index < 0) return false
  const parent = await entriesAt(bridge, normalized.slice(0, index))
  return Boolean(parent?.some(entry => entry.name.toLowerCase() === normalized.slice(index + 1).toLowerCase()))
}

async function mapLimit(items, limit, fn) {
  let cursor = 0
  const results = new Array(items.length)
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (cursor < items.length) {
      const index = cursor++
      results[index] = await fn(items[index])
    }
  }))
  return results
}

export async function readWallpaperProject(bridge, dir, source = 'manual') {
  const entries = await entriesAt(bridge, dir)
  if (!entries?.some(entry => entry.name.toLowerCase() === 'project.json')) return null
  const text = await textAt(bridge, joinLocalPath(dir, 'project.json'))
  if (!text) return null
  let project
  try { project = JSON.parse(text.replace(/^\uFEFF/, '')) } catch { return null }
  if (!project || typeof project !== 'object') return null

  const kind = String(project.type || '').toLowerCase()
  const mainPath = safeProjectPath(dir, project.file)
  const candidatePreview = safeProjectPath(dir, project.preview)
  const previewPath = candidatePreview && IMAGE_EXTENSIONS.test(candidatePreview) ? candidatePreview : null
  const [mainExists, previewExists] = await Promise.all([
    mainPath ? existsAt(bridge, mainPath) : false,
    previewPath ? existsAt(bridge, previewPath) : false
  ])
  const canPlayVideo = kind === 'video' && mainExists && VIDEO_EXTENSIONS.test(mainPath)
  const canShowImage = kind === 'image' && mainExists && IMAGE_EXTENSIONS.test(mainPath)
  const canShowWeb = kind === 'web' && mainExists && /\.html?$/i.test(mainPath)
  const mediaType = canPlayVideo ? 'video' : canShowWeb ? 'web' : 'image'
  const mediaPath = canPlayVideo || canShowImage || canShowWeb ? mainPath : (previewExists ? previewPath : null)
  if (!mediaPath) return null
  const title = typeof project.title === 'string' && project.title.trim()
    ? project.title.trim().slice(0, 120) : dir.split(/[\\/]/).at(-1)
  return {
    id: dir.toLowerCase(),
    title,
    kind,
    source,
    dir,
    mediaPath,
    mediaType,
    previewPath: previewExists ? previewPath : mediaPath,
    staticFallback: !canPlayVideo && !canShowImage && !canShowWeb,
    workshopId: typeof project.workshopid === 'string' ? project.workshopid : null
  }
}

async function scanContainer(bridge, root, source) {
  const entries = await entriesAt(bridge, root)
  if (!entries) return []
  if (entries.some(entry => entry.name.toLowerCase() === 'project.json')) {
    const project = await readWallpaperProject(bridge, root, source)
    return project ? [project] : []
  }
  const dirs = entries.filter(entry => entry.isDirectory).slice(0, 1000)
  return (await mapLimit(dirs, 8, entry => readWallpaperProject(bridge, entry.path || joinLocalPath(root, entry.name), source)))
    .filter(Boolean)
}

export function parseSteamLibraryFolders(text) {
  if (typeof text !== 'string') return []
  const paths = []
  const pattern = /"path"\s*"((?:\\.|[^"\\])*)"/g
  for (const match of text.matchAll(pattern)) {
    const path = match[1].replace(/\\\\/g, '\\').replace(/\//g, '\\')
    if (/^[A-Za-z]:\\/.test(path)) paths.push(path)
  }
  return [...new Set(paths)]
}

export async function scanWallpaperEngine(bridge, manualRoots = []) {
  if (!bridge?.readDir || !bridge?.readFileText) {
    return { items: [], libraries: [], error: 'Hermes Desktop local file bridge unavailable' }
  }
  const probes = []
  for (const drive of ['C', 'D', 'E', 'F', 'G', 'H']) {
    for (const suffix of ['Program Files (x86)\\Steam', 'Program Files\\Steam', 'Steam', 'SteamLibrary']) {
      probes.push(`${drive}:\\${suffix}`)
    }
  }
  const validManual = manualRoots.filter(root => typeof root === 'string' && /^[A-Za-z]:[\\/]/.test(root))
  const candidates = [...new Set([...validManual, ...probes])]
  const found = await mapLimit(candidates, 8, async root => {
    const steamapps = joinLocalPath(root, 'steamapps')
    return (await entriesAt(bridge, steamapps)) ? root : null
  })
  const libraries = new Set(found.filter(Boolean))
  for (const root of [...libraries]) {
    const vdf = await textAt(bridge, joinLocalPath(root, 'steamapps', 'libraryfolders.vdf'))
    for (const library of parseSteamLibraryFolders(vdf)) libraries.add(library)
  }
  const containers = []
  for (const root of libraries) {
    containers.push([joinLocalPath(root, 'steamapps', 'workshop', 'content', STEAM_APP_ID), 'workshop'])
    const projects = joinLocalPath(root, 'steamapps', 'common', 'wallpaper_engine', 'projects')
    containers.push([joinLocalPath(projects, 'myprojects'), 'local'])
    containers.push([joinLocalPath(projects, 'defaultprojects'), 'built-in'])
  }
  for (const root of validManual) {
    containers.push([root, 'manual'])
    containers.push([joinLocalPath(root, STEAM_APP_ID), 'manual'])
    containers.push([joinLocalPath(root, 'myprojects'), 'manual'])
    containers.push([joinLocalPath(root, 'defaultprojects'), 'manual'])
    containers.push([joinLocalPath(root, 'projects', 'myprojects'), 'manual'])
    containers.push([joinLocalPath(root, 'projects', 'defaultprojects'), 'manual'])
    containers.push([joinLocalPath(root, 'workshop', 'content', STEAM_APP_ID), 'manual'])
    containers.push([joinLocalPath(root, 'common', 'wallpaper_engine', 'projects', 'myprojects'), 'manual'])
    containers.push([joinLocalPath(root, 'common', 'wallpaper_engine', 'projects', 'defaultprojects'), 'manual'])
  }
  const uniqueContainers = [...new Map(containers.map(([path, source]) => [path.toLowerCase(), [path, source]])).values()]
  const scanned = await mapLimit(uniqueContainers, 4, ([path, source]) => scanContainer(bridge, path, source))
  const items = [...new Map(scanned.flat().map(item => [item.id, item])).values()]
    .sort((a, b) => a.title.localeCompare(b.title, 'zh'))
  return { items, libraries: [...libraries], error: null }
}
