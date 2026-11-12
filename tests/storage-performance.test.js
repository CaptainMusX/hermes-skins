import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import { normalizeConfig } from '../src/engine/config.js'

const source = fs.readFileSync(new URL('../src/engine/storage-manager.js', import.meta.url), 'utf8')
  .replace(/^import .*$/gm, '').replace(/^export /gm, '')
const atom = initial => ({ value: initial, get() { return this.value }, set(value) { this.value = value } })
const { createSkinStore } = new Function('atom', 'normalizeConfig', 'ensurePaletteContrast', source + '\nreturn { createSkinStore }')(atom, normalizeConfig, colors => colors)

function fixture() {
  const writes = []
  const store = createSkinStore({ storage: { get: (_, fallback) => fallback, set: (_, value) => writes.push(value) } })
  return { store, writes }
}

test('cosmetic drag updates state immediately and coalesces persistent writes', async () => {
  const { store, writes } = fixture()
  try {
    for (let panelGlass = 0; panelGlass < 100; panelGlass++) store.saveConfig({ panelGlass }, { deferPersistence: true })
    assert.equal(store.$config.get().panelGlass, 99)
    assert.equal(writes.length, 0)
    await new Promise(resolve => setTimeout(resolve, 240))
    assert.equal(writes.length, 1)
    assert.equal(writes[0].panelGlass, 99)
    store.saveConfig({ panelGlass: 99 })
    assert.equal(writes.length, 1, 'unchanged values do not rewrite or publish config')
  } finally { store.destroy() }
})

test('an immediate setting or teardown flushes the last cosmetic value', () => {
  const { store, writes } = fixture()
  store.saveConfig({ panelGlass: 0 }, { deferPersistence: true })
  store.saveConfig({ wallpaperEnabled: true })
  assert.equal(writes.length, 1)
  assert.equal(writes[0].panelGlass, 0)
  assert.equal(writes[0].wallpaperEnabled, true)
  store.saveConfig({ panelGlass: 100 }, { deferPersistence: true })
  store.destroy()
  assert.equal(writes.length, 2)
  assert.equal(writes[1].panelGlass, 100)
})
