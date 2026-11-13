import test from 'node:test'
import assert from 'node:assert/strict'
import { normalizeConfig, DEFAULT_CONFIG } from '../src/engine/config.js'

test('legacy bubble defaults migrate once and new wallpaper fields stay bounded', () => {
  const migrated = normalizeConfig({ schemaVersion: 3, bubbleOpacity: 100 })
  assert.equal(migrated.bubbleOpacity, 55)
  assert.equal(migrated.schemaVersion, 7)

  // A 100 stored on the new schema is a deliberate user choice and stays.
  assert.equal(normalizeConfig({ schemaVersion: 4, bubbleOpacity: 100 }).bubbleOpacity, 100)
  // Missing field takes the new default; endpoints stay honest.
  assert.equal(normalizeConfig({}).bubbleOpacity, DEFAULT_CONFIG.bubbleOpacity)
  assert.equal(DEFAULT_CONFIG.bubbleOpacity, 55)
  assert.equal(normalizeConfig({ bubbleOpacity: 0 }).bubbleOpacity, 0)
  assert.equal(normalizeConfig({ sceneLiveFps: 60 }).sceneLiveFps, 60)
  assert.equal(normalizeConfig({ sceneLiveFps: 144 }).sceneLiveFps, DEFAULT_CONFIG.sceneLiveFps)
  assert.equal(normalizeConfig({ wallpaperTransition: 'zoom' }).wallpaperTransition, 'zoom')
  assert.equal(normalizeConfig({ glassSaturation: 900 }).glassSaturation, 200)
  assert.equal(normalizeConfig({ glassBorder: -20 }).glassBorder, 0)
})
