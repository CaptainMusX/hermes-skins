import test from 'node:test'
import assert from 'node:assert/strict'
import { joinLocalPath, parseProjectProperties, parseSteamLibraryFolders, readWallpaperProject, safeProjectPath,
  scanWallpaperEngine, wallpaperMediaUrl } from '../src/engine/we-library.js'
import { normalizeMediaSource } from '../src/engine/backdrop-manager.js'

function libraryFixture() {
  const dirs = new Map()
  const files = new Map()
  const root = 'D:\\Program Files (x86)\\Steam'
  const workshop = joinLocalPath(root, 'steamapps', 'workshop', 'content', '431960')
  const video = joinLocalPath(workshop, '1001')
  const scene = joinLocalPath(workshop, '1002')
  const setDir = (path, entries) => dirs.set(path.toLowerCase(), entries.map(entry => ({
    name: entry, path: joinLocalPath(path, entry), isDirectory: !entry.includes('.')
  })))
  setDir(joinLocalPath(root, 'steamapps'), ['workshop', 'libraryfolders.vdf'])
  setDir(workshop, ['1001', '1002'])
  setDir(video, ['project.json', 'film.mp4', 'preview.gif'])
  setDir(scene, ['project.json', 'scene.pkg', 'preview.jpg'])
  files.set(joinLocalPath(video, 'project.json').toLowerCase(), JSON.stringify({
    type: 'video', title: 'Working video', file: 'film.mp4', preview: 'preview.gif'
  }))
  files.set(joinLocalPath(scene, 'project.json').toLowerCase(), JSON.stringify({
    type: 'scene', title: 'Packed scene', file: 'scene.json', preview: 'preview.jpg',
    general: {
      properties: {
        speed: { order: 2.5, text: 'speed_label', type: 'slider', value: 0.5, min: 0, max: 1, step: 0.05 },
        scheme: { order: 1, text: 'scheme_label', type: 'color', value: '0.1 0.2 0.3' },
        internal: { order: 3, type: 'bool', value: true, editable: false }
      },
      localization: {
        'zh-CHS': { speed_label: '速度', scheme_label: '配色' }
      }
    }
  }))
  files.set(joinLocalPath(root, 'steamapps', 'libraryfolders.vdf').toLowerCase(), '"path" "D:\\\\Program Files (x86)\\\\Steam"')
  const bridge = {
    async readDir(path) {
      const entries = dirs.get(path.toLowerCase())
      if (!entries) return { entries: [], error: 'ENOENT' }
      return { entries }
    },
    async readFileText(path) {
      const text = files.get(path.toLowerCase())
      if (!text) throw new Error('not found')
      return { text, truncated: false }
    }
  }
  return { bridge, root, video, scene }
}

test('rejects project path traversal and parses Steam libraries', () => {
  assert.equal(safeProjectPath('D:\\project', '..\\outside.mp4'), null)
  assert.equal(safeProjectPath('D:\\project', 'C:\\outside.mp4'), null)
  assert.deepEqual(parseSteamLibraryFolders('"path" "D:\\\\Steam"'), ['D:\\Steam'])
})

test('finds video playback and a static scene preview when scene.json is absent', async () => {
  const { bridge, video, scene } = libraryFixture()
  const playable = await readWallpaperProject(bridge, video, 'workshop')
  const fallback = await readWallpaperProject(bridge, scene, 'workshop')
  assert.equal(playable.mediaType, 'video')
  assert.equal(playable.staticFallback, false)
  assert.equal(fallback.mediaType, 'image')
  assert.equal(fallback.staticFallback, true)
  assert.equal(fallback.mediaPath, joinLocalPath(scene, 'preview.jpg'))
  assert.deepEqual(fallback.properties.map(property => property.name), ['scheme', 'speed', 'internal'])
  assert.equal(fallback.properties[1].text, '速度')
  assert.equal(fallback.properties[2].hidden, true)
  const url = wallpaperMediaUrl(playable.mediaPath, playable.mediaType)
  assert.equal(normalizeMediaSource(url, 'video'), url)
})

test('parses project.json wallpaper properties with localisation and type defaults', () => {
  const properties = parseProjectProperties({
    general: {
      properties: {
        b: { order: 2, type: 'combo', value: 2, options: [{ label: 'two', value: 2 }] },
        a: { order: 1, type: 'unknown', value: 'x' }
      }
    }
  })
  assert.deepEqual(properties.map(property => property.name), ['a', 'b'])
  assert.equal(properties[0].type, 'other')
  assert.equal(properties[1].type, 'combo')
  assert.equal(properties[1].options[0].value, 2)
})

test('auto-discovers an installed Steam library', async () => {
  const { bridge } = libraryFixture()
  const result = await scanWallpaperEngine(bridge)
  assert.equal(result.items.length, 2)
  assert.equal(result.items.filter(item => item.kind === 'video').length, 1)
  assert.equal(result.items.filter(item => item.kind === 'scene').length, 1)
})

test('ordinary projects reuse their inventory instead of rereading media directories', async () => {
  const { bridge, video } = libraryFixture()
  const originalRead = bridge.readDir
  let directories = 0
  bridge.readDir = async path => { directories++; return originalRead(path) }
  const project = await readWallpaperProject(bridge, video)
  assert.equal(project.mediaType, 'video')
  assert.equal(directories, 1, 'project, video and preview share one inventory')
})

test('reads Wallpaper Engine picture projects as a naturally sorted slideshow', async () => {
  const dir = 'D:\\wallpapers\\picture-project'
  const slides = joinLocalPath(dir, 'slides')
  const dirs = new Map([
    [dir.toLowerCase(), [
      { name: 'project.json', path: joinLocalPath(dir, 'project.json'), isDirectory: false },
      { name: 'slides', path: slides, isDirectory: true }
    ]],
    [slides.toLowerCase(), ['10.jpg', '2.jpg', '1.jpg'].map(name => ({
      name, path: joinLocalPath(slides, name), isDirectory: false
    }))]
  ])
  const project = {
    type: 'preset',
    title: 'Picture slides',
    preview: 'slides/1.jpg',
    preset: { wallpapermode: 2, customdirectory: 'slides', imageswitchtimes: 2 }
  }
  const bridge = {
    async readDir(path) {
      const entries = dirs.get(path.toLowerCase())
      return entries ? { entries } : { entries: [], error: 'ENOENT' }
    },
    async readFileText(path) {
      if (path.toLowerCase() === joinLocalPath(dir, 'project.json').toLowerCase()) {
        return { text: JSON.stringify(project), truncated: false }
      }
      throw new Error('not found')
    }
  }
  const item = await readWallpaperProject(bridge, dir)
  assert.equal(item.kind, 'image')
  assert.equal(item.mediaType, 'image')
  assert.deepEqual(item.slides, [1, 2, 10].map(n => joinLocalPath(slides, `${n}.jpg`)))
  assert.equal(item.mediaPath, joinLocalPath(slides, '1.jpg'))
  assert.equal(item.slideIntervalMs, 300000)
  assert.equal(item.staticFallback, false)
})
