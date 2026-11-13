import test from 'node:test'
import assert from 'node:assert/strict'
import { WallpaperRotation } from '../src/engine/rotation-controller.js'
import { groupWallpapers, rotationCandidates } from '../src/engine/wallpaper-apply.js'

const item = (id, kind = 'image') => ({
  id, title: id, kind, dir: `C:\\wallpapers\\${id}`,
  mediaPath: `C:\\wallpapers\\${id}\\preview.png`,
  mediaType: kind === 'video' ? 'video' : 'image',
  previewPath: `C:\\wallpapers\\${id}\\preview.png`,
  staticFallback: false
})

const group = (patch = {}) => ({
  id: 'grp-a', name: 'Test', interval: 1, order: 'sequence',
  trigger: 'interval', wallpaperIds: ['a', 'b', 'c'], ...patch
})

test('group membership excludes hidden ids and preserves list order', () => {
  const items = [item('a'), item('b'), item('c'), item('d')]
  const selected = group({ wallpaperIds: ['c', 'a', 'd'] })
  assert.deepEqual(groupWallpapers(items, selected, ['d']).map(row => row.id), ['c', 'a'])
  assert.deepEqual(rotationCandidates(items, ['a'], selected).map(row => row.id), ['c', 'd'])
})

test('interval rotation advances within the active group and respects its order', async () => {
  let config = {
    rotationEnabled: true, rotationMinutes: 30, hiddenWallpaperIds: [],
    rotationGroupId: 'grp-a',
    rotationGroups: [group({ wallpaperIds: ['c', 'a', 'b'] })],
    weSelection: { id: 'a' }
  }
  const store = {
    $config: { get: () => config },
    $weItems: { get: () => [item('a'), item('b'), item('c'), item('d')] }
  }
  const patches = []
  const controller = { changeConfig: patch => { patches.push(patch); config = { ...config, ...patch } } }
  const rotation = new WallpaperRotation(store, async () => ({ ok: true }), controller)
  rotation.lastEnabled = true
  rotation.lastId = 'a'
  rotation.lastGroupId = 'grp-a'
  rotation.lastSwitch = Date.now() - 61_000
  await rotation.tick()
  assert.equal(patches.length, 1)
  assert.equal(patches[0].weSelection.id, 'b')
  rotation.destroy()
})

test('video-end groups never advance on the timer but do advance on the media event', async () => {
  let config = {
    rotationEnabled: true, hiddenWallpaperIds: [],
    rotationGroupId: 'grp-a',
    rotationGroups: [group({ trigger: 'videoEnd' })],
    weSelection: { id: 'a' }
  }
  const store = {
    $config: { get: () => config },
    $weItems: { get: () => [item('a', 'video'), item('b', 'video'), item('c', 'video')] }
  }
  const patches = []
  const backdrop = { onMediaEnd: null }
  const controller = { changeConfig: patch => { patches.push(patch); config = { ...config, ...patch } } }
  const rotation = new WallpaperRotation(store, async () => ({ ok: true }), controller, backdrop)
  rotation.lastEnabled = true
  rotation.lastId = 'a'
  rotation.lastGroupId = 'grp-a'
  rotation.lastSwitch = Date.now() - 120_000
  await rotation.tick()
  assert.equal(patches.length, 0)
  assert.equal(typeof backdrop.onMediaEnd, 'function')
  await backdrop.onMediaEnd()
  await new Promise(resolve => setImmediate(resolve))
  assert.equal(patches.length, 1)
  assert.equal(patches[0].weSelection.id, 'b')
  rotation.destroy()
  assert.equal(backdrop.onMediaEnd, null)
})
