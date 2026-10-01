import test from 'node:test'
import assert from 'node:assert/strict'
import { normalizeConfig, DEFAULT_CONFIG } from '../src/engine/config.js'

test('schema 3 shipped the stock bubble fill as the untouched default; v4 migrates it once', () => {
  const migrated = normalizeConfig({ schemaVersion: 3, bubbleOpacity: 100 })
  assert.equal(migrated.bubbleOpacity, 55)
  assert.equal(migrated.schemaVersion, 4)

  // A 100 stored on the new schema is a deliberate user choice and stays.
  assert.equal(normalizeConfig({ schemaVersion: 4, bubbleOpacity: 100 }).bubbleOpacity, 100)
  // Missing field takes the new default; endpoints stay honest.
  assert.equal(normalizeConfig({}).bubbleOpacity, DEFAULT_CONFIG.bubbleOpacity)
  assert.equal(DEFAULT_CONFIG.bubbleOpacity, 55)
  assert.equal(normalizeConfig({ bubbleOpacity: 0 }).bubbleOpacity, 0)
})
