import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const parent = path.resolve(os.tmpdir(), 'hermes-skins-install-tests')
function sandbox() {
  fs.mkdirSync(parent, { recursive: true })
  return fs.mkdtempSync(path.join(parent, 'case-'))
}
function cleanup(dir) {
  const resolved = path.resolve(dir)
  if (!resolved.startsWith(parent + path.sep) || fs.lstatSync(resolved).isSymbolicLink()) throw new Error('Invalid cleanup path')
  fs.rmSync(resolved, { recursive: true, force: true })
}
function run(home, args = [], script = path.join(root, 'scripts/install-local.js')) {
  return spawnSync(process.execPath, [script, ...args], {
    encoding: 'utf8', timeout: 15000, windowsHide: true,
    env: { ...process.env, HERMES_HOME: home }
  })
}

test('complete installation preserves existing payloads and leaves activation state untouched with no-enable', () => {
  const dir = sandbox()
  try {
    const home = path.join(dir, 'new-hermes-home')
    const front = path.join(home, 'desktop-plugins/hermes-skins')
    const backend = path.join(home, 'plugins/hermes-skins/dashboard')
    fs.mkdirSync(front, { recursive: true }); fs.mkdirSync(backend, { recursive: true })
    fs.writeFileSync(path.join(front, 'plugin.js'), 'old frontend')
    fs.writeFileSync(path.join(backend, 'plugin_api.py'), 'old backend')
    const config = 'plugins:\n  enabled:\n    - existing-plugin\n'
    fs.writeFileSync(path.join(home, 'config.yaml'), config)
    const result = run(home, ['--no-enable'])
    assert.equal(result.status, 0, result.stderr)
    assert.deepEqual(fs.readFileSync(path.join(front, 'plugin.js')), fs.readFileSync(path.join(root, 'plugin.js')))
    assert.deepEqual(fs.readFileSync(path.join(backend, 'scene-helper.mjs')), fs.readFileSync(path.join(root, 'backend/scene-helper.mjs')))
    assert.equal(fs.readFileSync(path.join(home, 'config.yaml'), 'utf8'), config)
    const oldFront = fs.readdirSync(front).find(name => name.startsWith('plugin.js.bak-'))
    const oldBackend = fs.readdirSync(backend).find(name => name.startsWith('plugin_api.py.bak-'))
    assert.equal(fs.readFileSync(path.join(front, oldFront), 'utf8'), 'old frontend')
    assert.equal(fs.readFileSync(path.join(backend, oldBackend), 'utf8'), 'old backend')
    assert.ok(fs.existsSync(path.join(front, 'LICENSE.jpeg-js')))
    assert.ok(fs.existsSync(path.join(home, 'plugins/hermes-skins/plugin.yaml')))
  } finally { cleanup(dir) }
})

test('frontend-only creates an explicitly selected new home without installing a backend', () => {
  const dir = sandbox()
  try {
    const home = path.join(dir, 'custom-home')
    const result = run(home, ['--frontend-only'])
    assert.equal(result.status, 0, result.stderr)
    assert.ok(fs.existsSync(path.join(home, 'desktop-plugins/hermes-skins/plugin.js')))
    assert.ok(fs.existsSync(path.join(home, 'desktop-plugins/hermes-skins/NOTICE.dsh-skins.md')))
    assert.equal(fs.existsSync(path.join(home, 'plugins')), false)
  } finally { cleanup(dir) }
})

test('incomplete packages fail before writing to the target installation', () => {
  const dir = sandbox()
  try {
    const pkg = path.join(dir, 'package')
    fs.mkdirSync(path.join(pkg, 'scripts'), { recursive: true })
    fs.copyFileSync(path.join(root, 'scripts/install-local.js'), path.join(pkg, 'scripts/install-local.mjs'))
    fs.copyFileSync(path.join(root, 'scripts/license-files.js'), path.join(pkg, 'scripts/license-files.js'))
    fs.writeFileSync(path.join(pkg, 'package.json'), '{"type":"module"}')
    fs.copyFileSync(path.join(root, 'plugin.js'), path.join(pkg, 'plugin.js'))
    const home = path.join(dir, 'untouched-home')
    const result = run(home, ['--no-enable'], path.join(pkg, 'scripts/install-local.mjs'))
    assert.notEqual(result.status, 0)
    assert.match(result.stderr, /Incomplete installation package/)
    assert.equal(fs.existsSync(home), false)
  } finally { cleanup(dir) }
})
