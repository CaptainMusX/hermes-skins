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

const SLIDE_SWITCH_MS = { 1: 60_000, 2: 300_000, 3: 600_000, 4: 1_800_000, 5: 3_600_000 }
const PROP_TYPES = new Set([
  'color', 'bool', 'slider', 'combo', 'text', 'textinput', 'file', 'directory', 'group', 'other'
])
const PROP_LANGS = ['zh-chs', 'zh-cht', 'en-us']

const stripHtml = value => typeof value !== 'string' ? '' : value
  .replace(/<br\s*\/?>/gi, '\n')
  .replace(/<[^>]*>/g, '')
  .replace(/&nbsp;/gi, ' ')
  .replace(/&amp;/gi, '&')
  .replace(/&lt;/gi, '<')
  .replace(/&gt;/gi, '>')
  .replace(/&quot;/gi, '"')
  .replace(/&#0?39;|&apos;/gi, "'")
  .trim()

function propertyText(project, key, fallback) {
  const table = project?.general?.localization
  if (table && typeof table === 'object') {
    for (const language of PROP_LANGS) {
      const entry = Object.entries(table).find(([name]) => name.toLowerCase() === language)?.[1]
      if (entry && typeof entry === 'object' && typeof entry[key] === 'string') {
        const localized = stripHtml(entry[key])
        if (localized) return localized
      }
    }
  }
  return stripHtml(key) || fallback
}

function propertyDefault(type, definition) {
  if (!definition || !('value' in definition)) return null
  const value = definition.value
  if (value === undefined || value === null) return null
  if (type === 'bool') return typeof value === 'boolean' ? value : null
  if (type === 'slider') return Number.isFinite(Number(value)) ? Number(value) : null
  if (type === 'combo') return value
  if (type === 'color') return typeof value === 'string' ? value : null
  return typeof value === 'string' ? value : JSON.stringify(value)
}

export function parseProjectProperties(project) {
  const source = project?.general?.properties
  if (!source || typeof source !== 'object' || Array.isArray(source)) return []
  return Object.entries(source)
    .filter(([, definition]) => definition && typeof definition === 'object' &&
      typeof definition.type === 'string')
    .sort((left, right) => {
      const order = Number(left[1].order || 0) - Number(right[1].order || 0)
      return order || (left[0] < right[0] ? -1 : left[0] > right[0] ? 1 : 0)
    })
    .slice(0, 100)
    .map(([name, definition]) => {
      const rawType = String(definition.type || 'other').toLowerCase()
      const type = PROP_TYPES.has(rawType) ? rawType : 'other'
      const entry = {
        name: name.slice(0, 120),
        type,
        text: propertyText(project, typeof definition.text === 'string' ? definition.text : name, name).slice(0, 240),
        order: Number.isFinite(Number(definition.order)) ? Number(definition.order) : 0,
        value: propertyDefault(type, definition),
        hidden: definition.editable === false
      }
      if (Array.isArray(definition.options)) {
        entry.options = definition.options
          .filter(option => option && typeof option === 'object' && 'value' in option)
          .slice(0, 200)
          .map(option => ({
            label: propertyText(project, typeof option.label === 'string' ? option.label : '',
              String(option.value)).slice(0, 160),
            value: option.value
          }))
      }
      for (const key of ['min', 'max', 'step', 'precision']) {
        if (Number.isFinite(Number(definition[key]))) entry[key] = Number(definition[key])
      }
      if (typeof definition.fileType === 'string') entry.fileType = definition.fileType.slice(0, 20)
      return entry
    })
}

async function listPictures(bridge, dir, depth = 0) {
  if (depth > 3) return []
  const entries = await entriesAt(bridge, dir)
  if (!entries) return []
  const images = []
  const directories = []
  for (const entry of entries) {
    if (entry.name.startsWith('.')) continue
    const path = entry.path || joinLocalPath(dir, entry.name)
    if (entry.isDirectory) directories.push(path)
    else if (IMAGE_EXTENSIONS.test(entry.name)) images.push(path)
    if (images.length >= 200) break
  }
  for (const child of directories) {
    if (images.length >= 200) break
    images.push(...await listPictures(bridge, child, depth + 1))
  }
  return images
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
    .slice(0, 200)
}

async function readPictureSlides(bridge, dir, project) {
  const preset = project?.preset && typeof project.preset === 'object' ? project.preset : null
  if (!preset) return null
  const mode = Number(preset.wallpapermode)
  const custom = typeof preset.customdirectory === 'string' ? preset.customdirectory.trim() : ''
  const single = typeof preset.image === 'string' ? preset.image.trim() : ''
  let slides = []
  if (custom && (mode === 1 || mode === 2)) {
    const base = safeProjectPath(dir, custom)
    if (base) slides = await listPictures(bridge, base)
  } else if (single && IMAGE_EXTENSIONS.test(single)) {
    const path = safeProjectPath(dir, single)
    if (path && await existsAt(bridge, path)) slides = [path]
  }
  if (!slides.length) return null
  const interval = Number(preset.imageswitchtimes)
  return { slides, slideIntervalMs: SLIDE_SWITCH_MS[interval] || null }
}

export async function readWallpaperProject(bridge, dir, source = 'manual', knownEntries = null) {
  const entries = knownEntries || await entriesAt(bridge, dir)
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
  const filenames = new Set(entries.map(entry => entry.name.toLowerCase()))
  const exists = async (path, relative) => {
    if (!path) return false
    // Most projects keep media beside project.json; its directory has already
    // been read. Only nested paths require another native bridge round-trip.
    if (!/[\\/]/.test(relative)) return filenames.has(relative.toLowerCase())
    return existsAt(bridge, path)
  }
  const [mainExists, previewExists] = await Promise.all([
    exists(mainPath, project.file), exists(previewPath, project.preview)
  ])
  const canPlayVideo = kind === 'video' && mainExists && VIDEO_EXTENSIONS.test(mainPath)
  const canShowImage = kind === 'image' && mainExists && IMAGE_EXTENSIONS.test(mainPath)
  const canShowWeb = kind === 'web' && mainExists && /\.html?$/i.test(mainPath)
  const picture = !canPlayVideo && !canShowWeb ? await readPictureSlides(bridge, dir, project) : null
  const mediaType = canPlayVideo ? 'video' : canShowWeb ? 'web' : 'image'
  const mediaPath = canPlayVideo || canShowImage || canShowWeb
    ? mainPath : (picture?.slides?.[0] || (previewExists ? previewPath : null))
  if (!mediaPath) return null
  const title = typeof project.title === 'string' && project.title.trim()
    ? project.title.trim().slice(0, 120) : dir.split(/[\\/]/).at(-1)
  return {
    id: dir.toLowerCase(),
    title,
    kind: picture ? 'image' : kind,
    source,
    contentrating: typeof project.contentrating === 'string' ? project.contentrating : null,
    dir,
    mediaPath,
    mediaType,
    slides: picture?.slides || (canShowImage ? [mainPath] : []),
    slideIntervalMs: picture?.slideIntervalMs || null,
    previewPath: previewExists ? previewPath : mediaPath,
    staticFallback: !canPlayVideo && !canShowImage && !canShowWeb && !picture,
    workshopId: typeof project.workshopid === 'string' ? project.workshopid : null,
    properties: parseProjectProperties(project)
  }
}

async function scanContainer(bridge, root, source) {
  const entries = await entriesAt(bridge, root)
  if (!entries) return []
  if (entries.some(entry => entry.name.toLowerCase() === 'project.json')) {
    const project = await readWallpaperProject(bridge, root, source, entries)
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
