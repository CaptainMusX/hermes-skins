import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import { enableSceneBackend, isSceneBackendMissing } from '../src/engine/scene-backend.js'

const source = fs.readFileSync(new URL('../src/ui/WallpaperEnginePanel.js', import.meta.url), 'utf8')
  .replace(/^import .*$/gm, '').replace(/^export /gm, '')
const names = ['Button','Input','usePluginI18n','useValue','useEffect','useRef','useState','jsx','jsxs',
  'scanWallpaperEngine','wallpaperMediaUrl','normalizeMediaSource','enableSceneBackend','isSceneBackendMissing']
const walk = (node, found = []) => {
  if (Array.isArray(node)) node.forEach(child => walk(child, found))
  else if (node && typeof node === 'object' && 'type' in node) { found.push(node); walk(node.props?.children, found) }
  return found
}
const settle = () => new Promise(resolve => setImmediate(resolve))

function fixture({ needsRestart = false } = {}) {
  const previousWindow = globalThis.window
  let enabled = false, cursor = 0
  const hooks = [], effects = [], preparations = [], commits = [], apiCalls = []
  const items = ['first','second'].map(id => ({ id, title: id, kind: 'scene', dir: `C:\\library\\${id}`,
    mediaPath: `C:\\library\\${id}\\preview.png`, mediaType: 'image', previewPath: `${id}.png` }))
  const bridge = { api: async request => {
    apiCalls.push(request)
    if (request.method === 'POST') { enabled = true; return { ok: true, gateway_reloaded: true, restart_required: false } }
    if (needsRestart) throw new Error('404: Headless backend')
    return { ok: true }
  } }
  globalThis.window = { hermesDesktop: bridge }
  const Button = 'button', jsx = (type, props) => ({ type, props })
  const values = {
    Button, Input: 'input', usePluginI18n: () => key => key, useValue: atom => atom.get(),
    useState(initial) { const i = cursor++; hooks[i] ??= { value: initial }; return [hooks[i].value, value => { hooks[i].value = typeof value === 'function' ? value(hooks[i].value) : value }] },
    useRef(initial) { const i = cursor++; hooks[i] ??= { current: initial }; return hooks[i] },
    useEffect(callback, deps) { const i = cursor++; if (!hooks[i] || deps.some((v,j) => !Object.is(v,hooks[i].deps[j]))) { hooks[i]?.cleanup?.(); hooks[i] = { deps }; effects.push(() => { hooks[i].cleanup = callback() }) } },
    jsx, jsxs: jsx, scanWallpaperEngine: async () => ({ items, libraries: [] }), wallpaperMediaUrl: path => path,
    normalizeMediaSource: path => path, enableSceneBackend, isSceneBackendMissing
  }
  const Component = new Function(...names, source + '\nreturn WallpaperEnginePanel')(...names.map(n => values[n]))
  let config = { weRoots: [], wallpaperType: 'video', wallpaperSource: 'original.mp4', weSelection: null }
  const props = { store: { $config: { get: () => config } }, controller: { changeConfig(change) { commits.push(change); config = { ...config, ...change } } },
    prepareScene: async dir => { preparations.push(dir); if (!enabled) throw new Error('404: Plugin not found'); return { ok: true, manifest: true, manifestPath: `${dir}\\manifest.json`, framePath: `${dir}\\frame.png` } } }
  const render = () => { cursor = 0; const tree = Component(props); effects.splice(0).forEach(effect => effect()); return tree }
  const clickWallpaper = (tree, index = 0) => walk(tree).filter(n => n.type === Button && n.props.children === 'weUse')[index].props.onClick()
  return { render, clickWallpaper, commits, preparations, apiCalls, config: () => config,
    close() { hooks.forEach(h => h?.cleanup?.()); globalThis.window = previousWindow } }
}

test('failed new-scene selection preserves wallpaper; explicit recovery retries and permits another switch', async () => {
  const f = fixture()
  try {
    f.render(); await settle()
    f.clickWallpaper(f.render()); await settle()
    assert.equal(f.commits.length, 0)
    assert.equal(f.config().wallpaperSource, 'original.mp4')
    let tree = f.render()
    const recovery = walk(tree).find(n => n.type === 'button' && n.props.children === 'weSceneBackendEnable')
    assert.ok(recovery)
    recovery.props.onClick(); await settle()
    assert.equal(f.commits.length, 1)
    assert.equal(f.config().weSelection.id, 'first')
    tree = f.render()
    f.clickWallpaper(tree); await settle()
    assert.equal(f.config().weSelection.id, 'second')
    assert.deepEqual(f.preparations, ['C:\\library\\first','C:\\library\\first','C:\\library\\second'])
    assert.equal(f.apiCalls.length, 2, 'activation plus real health check')
  } finally { f.close() }
})

test('unmounted scene API after activation requests restart and keeps the current wallpaper', async () => {
  const f = fixture({ needsRestart: true })
  try {
    f.render(); await settle()
    f.clickWallpaper(f.render()); await settle()
    walk(f.render()).find(n => n.type === 'button' && n.props.children === 'weSceneBackendEnable').props.onClick()
    await settle()
    assert.equal(f.commits.length, 0)
    assert.equal(f.config().wallpaperSource, 'original.mp4')
    assert.ok(walk(f.render()).some(n => n.props.children === 'weSceneBackendRestartRequired'))
    assert.equal(f.preparations.length, 1, 'no blind retry against an unmounted route')
  } finally { f.close() }
})
