import test from 'node:test'
import assert from 'node:assert/strict'
import { WallpaperRotation } from '../src/engine/rotation-controller.js'

const item = (id, kind = 'image') => ({
  id, title: id, kind, dir: `C:\\wallpapers\\${id}`,
  mediaPath: `C:\\wallpapers\\${id}\\preview.png`,
  mediaType: kind === 'video' ? 'video' : 'image',
  previewPath: `C:\\wallpapers\\${id}\\preview.png`,
  staticFallback: false
})

test('rotation advances to the next non-hidden wallpaper after the interval', async () => {
  let config = {
    rotationEnabled: true, rotationMinutes: 1, hiddenWallpaperIds: ['b'],
    weSelection: { id: 'a' }
  }
  const store = {
    $config: { get: () => config },
    $weItems: { get: () => [item('a'), item('b'), item('c')] }
  }
  const patches = []
  const controller = { changeConfig: patch => { patches.push(patch); config = { ...config, ...patch } } }
  const rotation = new WallpaperRotation(store, async () => ({ ok: true }), controller)
  rotation.lastEnabled = true
  rotation.lastId = 'a'
  rotation.lastSwitch = Date.now() - 61_000
  await rotation.tick()
  assert.equal(patches.length, 1)
  assert.equal(patches[0].weSelection.id, 'c')
  assert.equal(patches[0].wallpaperEnabled, true)
  rotation.destroy()
})

test('rotation is inert when disabled or the pool has fewer than two visible items', async () => {
  let config = { rotationEnabled: false, rotationMinutes: 1, hiddenWallpaperIds: [], weSelection: { id: 'a' } }
  const store = { $config: { get: () => config }, $weItems: { get: () => [item('a'), item('b')] } }
  const patches = []
  const rotation = new WallpaperRotation(store, async () => ({ ok: true }), {
    changeConfig: patch => patches.push(patch)
  })
  rotation.lastSwitch = Date.now() - 61_000
  await rotation.tick()
  assert.equal(patches.length, 0)
  config = { ...config, rotationEnabled: true, hiddenWallpaperIds: ['b'] }
  rotation.lastEnabled = true
  rotation.lastSwitch = Date.now() - 61_000
  await rotation.tick()
  assert.equal(patches.length, 0)
  rotation.destroy()
})
