import test from 'node:test'
import assert from 'node:assert/strict'
import { DEFAULT_CONFIG, normalizeConfig } from '../src/engine/config.js'
import { BackdropManager, normalizeMediaSource } from '../src/engine/backdrop-manager.js'
import { GlassController } from '../src/engine/glass-controller.js'
import { AppearanceController } from '../src/engine/appearance-controller.js'

test('fresh config stays inert and legacy transparency is bounded', () => {
  assert.equal(normalizeConfig(null).wallpaperEnabled, false)
  assert.equal(normalizeConfig({ maskOcclusion: 500 }).maskOcclusion, 100)
  assert.equal(normalizeConfig({ wallpaperBlur: -5 }).wallpaperBlur, 0)
  assert.equal(normalizeConfig({ wallpaperBlur: 61 }).wallpaperBlur, 60)
})

test('percent parameters honor the full range and survive a reload', () => {
  for (const key of ['maskOcclusion', 'wallpaperOpacity', 'panelGlass', 'bubbleOpacity', 'wallpaperVolume']) {
    for (const value of [0, 50, 100]) {
      const stored = normalizeConfig({ schemaVersion: 6, [key]: value })
      assert.equal(stored[key], value)
      assert.equal(normalizeConfig(JSON.parse(JSON.stringify(stored)))[key], value)
    }
  }
})

test('media sources accept web/local paths and reject unsafe schemes', () => {
  assert.equal(normalizeMediaSource('https://example.com/a.png'), 'https://example.com/a.png')
  assert.equal(normalizeMediaSource('C:\\Pictures\\a b.png'), 'file:///C:/Pictures/a%20b.png')
  assert.equal(normalizeMediaSource('javascript:alert(1)'), null)
  assert.equal(normalizeMediaSource('data:text/html,<script>x</script>'), null)
  assert.equal(normalizeMediaSource('data:image/png;base64,AAAA', 'video'), null)
})

test('the controller drives backdrop and glass from wallpaper config alone', () => {
  let config = {
    ...DEFAULT_CONFIG,
    wallpaperEnabled: true,
    wallpaperType: 'video',
    wallpaperSource: 'hermes-media://stream/D%3A%5CWallpapers%5Cfilm.mp4'
  }
  const calls = []
  const store = {
    $config: { get: () => config },
    saveConfig(change) {
      config = normalizeConfig(typeof change === 'function' ? change(config) : { ...config, ...change })
      return config
    },
    flushPersistence() {}
  }
  const backdrop = {
    update: options => { calls.push(['backdrop', options]); return Boolean(options.enabled) },
    destroy: () => calls.push(['backdrop.destroy'])
  }
  const glass = {
    update: options => calls.push(['glass', options]),
    destroy: () => calls.push(['glass.destroy'])
  }
  const controller = new AppearanceController(store, backdrop, glass)
  controller.sync()
  assert.equal(calls.findLast(call => call[0] === 'backdrop')[1].enabled, true)
  assert.equal(calls.findLast(call => call[0] === 'glass')[1].enabled, true)

  controller.changeConfig({ wallpaperEnabled: false })
  assert.equal(calls.findLast(call => call[0] === 'backdrop')[1].enabled, false)
  assert.equal(calls.findLast(call => call[0] === 'glass')[1].enabled, false)

  controller.destroy()
  assert.ok(calls.some(call => call[0] === 'backdrop.destroy'))
  assert.ok(calls.some(call => call[0] === 'glass.destroy'))
})

test('slider bursts apply once and teardown commits the final sample', () => {
  const original = { requestAnimationFrame: globalThis.requestAnimationFrame, cancelAnimationFrame: globalThis.cancelAnimationFrame }
  const frames = new Map()
  let id = 0
  globalThis.requestAnimationFrame = callback => { frames.set(++id, callback); return id }
  globalThis.cancelAnimationFrame = frame => frames.delete(frame)
  try {
    let config = { ...DEFAULT_CONFIG, wallpaperEnabled: true, wallpaperSource: 'https://example.com/a.png' }
    const store = {
      $config: { get: () => config },
      saveConfig(change) { config = normalizeConfig({ ...config, ...change }); return config },
      flushPersistence() {}
    }
    const calls = []
    const controller = new AppearanceController(store,
      { update: options => { calls.push(options); return Boolean(options.enabled) }, destroy() {} },
      { update() {}, destroy() {} })
    for (let value = 0; value < 100; value++) controller.scheduleConfig({ panelGlass: value })
    assert.equal(frames.size, 1)
    assert.equal(calls.length, 0)
    const callback = [...frames.values()][0]
    frames.clear()
    callback()
    assert.equal(config.panelGlass, 99)
    assert.equal(calls.length, 1, 'one backdrop sync after the burst')
    controller.scheduleConfig({ panelGlass: 0 })
    controller.destroy()
    assert.equal(frames.size, 0)
    assert.equal(config.panelGlass, 0)
  } finally {
    Object.assign(globalThis, original)
  }
})

function backdropFixture() {
  const elements = []
  const make = () => {
    const el = {
      style: {}, dataset: {}, isConnected: false,
      setAttribute() {}, appendChild(child) { elements.push(child) },
      querySelector: () => null,
      replaceChildren() {}, remove() {}, prepend() {}
    }
    elements.push(el)
    return el
  }
  const previousDocument = globalThis.document
  globalThis.document = {
    documentElement: { dataset: {} },
    body: { prepend() {} },
    getElementById: () => null,
    createElement: make,
    addEventListener() {},
    removeEventListener() {}
  }
  return { manager: new BackdropManager(), elements, restore: () => { globalThis.document = previousDocument } }
}

test('backdrop endpoints are honest: mask, opacity and blur', () => {
  const { manager, restore } = backdropFixture()
  try {
    assert.equal(manager.update({ enabled: true, src: 'https://example.com/a.png', occlusion: 100, blur: 60, opacity: 0 }), true)
    assert.equal(manager.scrim.style.backgroundColor, 'rgba(0,0,0,1)')
    assert.equal(manager.layer._media.style.opacity, '0')
    assert.equal(manager.layer._surface.style.filter, 'blur(60px)')
    assert.equal(manager.layer._surface.style.inset, '-68px')
    assert.equal(manager.update({ enabled: true, src: 'https://example.com/a.png', blur: 0, occlusion: 0 }), true)
    assert.equal(manager.layer._surface.style.filter, 'none')
    assert.equal(manager.scrim.style.backgroundColor, 'rgba(0,0,0,0)')
    assert.equal(manager.update({ enabled: true, src: 'https://example.com/a.png', occlusion: 35, isDark: false }), true)
    assert.equal(manager.scrim.style.backgroundColor, 'rgba(255,255,255,0.35)')
  } finally {
    restore()
  }
})

test('glass CSS paints one unified material and removes itself when disabled', () => {
  const previousDocument = globalThis.document
  let style = null
  const attrs = new Map()
  const headChildren = []
  globalThis.document = {
    documentElement: { setAttribute: (key, value) => attrs.set(key, value), removeAttribute: key => attrs.delete(key), dataset: {} },
    head: {
      children: headChildren,
      contains: el => headChildren.includes(el),
      appendChild: el => { headChildren.push(el); el.isConnected = true; style = el }
    },
    getElementById: () => headChildren[0] ?? null,
    querySelector: () => null,
    addEventListener() {},
    removeEventListener() {},
    createElement: () => ({
      dataset: {}, isConnected: false, style: {},
      remove() { const index = headChildren.indexOf(this); if (index >= 0) headChildren.splice(index, 1); this.isConnected = false }
    })
  }
  try {
    const glass = new GlassController()
    glass.update({ enabled: true, glassTransparency: 80, surfaceFrost: 8 })
    assert.match(style.textContent, /--hermes-skins-keep: 20%/)
    assert.match(style.textContent, /--ui-chat-surface-background: var\(--hermes-skins-chrome-tint\)/)
    assert.match(style.textContent, /--hermes-skins-frost: saturate\(150%\) blur\(8px\)/)
    glass.destroy()
    assert.equal(headChildren.includes(style), false)
    assert.equal(glass.styleEl, null)
    assert.equal(attrs.has('data-hermes-skins-active'), false)
  } finally {
    globalThis.document = previousDocument
  }
})
