import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'

const read = relative => fs.readFileSync(new URL(`../${relative}`, import.meta.url))

test('native package carries both matching surfaces and no build-dependency sidecar', () => {
  assert.deepEqual(read('plugin/desktop/plugin.js'), read('plugin.js'), 'desktop copy must be adoptable without changing the installed entry')
  assert.deepEqual(read('plugin/dashboard/scene-helper.mjs'), read('backend/scene-helper.mjs'))
  assert.deepEqual(read('plugin/dashboard/plugin_api.py'), read('backend/plugin_api.py'))
  assert.equal(fs.existsSync(new URL('../plugin/package.json', import.meta.url)), false, 'native install must not ask to install compiler dependencies')
  assert.equal(JSON.parse(read('plugin/dashboard/manifest.json')).name, 'hermes-skins')
  const version = JSON.parse(read('package.json')).version
  assert.ok(read('plugin/plugin.yaml').toString().includes(`version: "${version}"`))
  assert.ok(read('plugin/desktop/LICENSE.dsh-skins').length > 0)
  assert.ok(read('plugin/dashboard/LICENSE.jpeg-js').length > 0)
})
