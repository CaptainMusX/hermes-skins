import test from 'node:test'
import assert from 'node:assert/strict'
import { joinLocalPath, parseSteamLibraryFolders, readWallpaperProject, safeProjectPath,
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
    type: 'scene', title: 'Packed scene', file: 'scene.json', preview: 'preview.jpg'
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
  const url = wallpaperMediaUrl(playable.mediaPath, playable.mediaType)
  assert.equal(normalizeMediaSource(url, 'video'), url)
})

test('auto-discovers an installed Steam library', async () => {
  const { bridge } = libraryFixture()
  const result = await scanWallpaperEngine(bridge)
  assert.equal(result.items.length, 2)
  assert.equal(result.items.filter(item => item.kind === 'video').length, 1)
  assert.equal(result.items.filter(item => item.kind === 'scene').length, 1)
})
