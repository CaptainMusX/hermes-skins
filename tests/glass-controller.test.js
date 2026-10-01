import test from 'node:test'
import assert from 'node:assert/strict'
import { GlassController, parseSerializedColor } from '../src/engine/glass-controller.js'

/** Minimal DOM fixture covering the surfaces GlassController touches. */
function fixture({ terminalAlpha = false, resolvedColor = 'color(srgb 0.5 0.6 0.7)' } = {}) {
  const created = []
  function makeElement(tag) {
    const el = {
      tagName: tag, dataset: {}, attributes: {}, children: [],
      isConnected: false, parentNode: null, style: { cssText: '' },
      setAttribute(name, value) { el.attributes[name] = value },
      removeAttribute(name) { delete el.attributes[name] },
      appendChild(child) { child.parentNode = this; this.children.push(child); child.isConnected = true },
      remove() {
        if (this.parentNode) this.parentNode.children = this.parentNode.children.filter(c => c !== this)
        this.parentNode = null
        this.isConnected = false
      }
    }
    return el
  }
  const root = makeElement('html')
  if (terminalAlpha) root.dataset.hermesTerminalAlpha = 'true'
  const head = makeElement('head')
  head.contains = el => head.children.includes(el)
  const body = makeElement('body')
  const documentMock = {
    documentElement: root, head, body,
    getElementById: () => null,
    createElement: tag => { const el = makeElement(tag); created.push(el); return el }
  }
  const windowMock = {
    listeners: new Map(),
    addEventListener(name, fn) { this.listeners.set(name, fn) },
    removeEventListener(name, fn) { if (this.listeners.get(name) === fn) this.listeners.delete(name) },
    dispatchEvent(event) { this.listeners.get(event.type)?.(event); return true }
  }
  const previous = {
    document: globalThis.document,
    window: globalThis.window,
    getComputedStyle: globalThis.getComputedStyle
  }
  globalThis.document = documentMock
  globalThis.window = windowMock
  globalThis.getComputedStyle = () => ({ backgroundColor: resolvedColor })
  return {
    root, head, created, windowMock,
    restore: () => {
      globalThis.document = previous.document
      globalThis.window = previous.window
      globalThis.getComputedStyle = previous.getComputedStyle
    }
  }
}

test('parseSerializedColor reads every serialization the browser can emit', () => {
  assert.deepEqual(parseSerializedColor('color(srgb 0.5 0.6 0.7 / 0.45)'), { r: 128, g: 153, b: 179, a: 0.45 })
  assert.deepEqual(parseSerializedColor('color(srgb 0 0 0)'), { r: 0, g: 0, b: 0, a: 1 })
  assert.deepEqual(parseSerializedColor('rgba(255, 255, 255, 0.3)'), { r: 255, g: 255, b: 255, a: 0.3 })
  assert.deepEqual(parseSerializedColor('rgb(12, 34, 56)'), { r: 12, g: 34, b: 56, a: 1 })
  assert.deepEqual(parseSerializedColor('#aabbcc'), { r: 170, g: 187, b: 204, a: 1 })
  assert.equal(parseSerializedColor('var(--unresolved)'), null)
  assert.equal(parseSerializedColor(undefined), null)
})

test('patched hosts get a comma-form rgba terminal literal wired to keep', () => {
  const f = fixture({ terminalAlpha: true, resolvedColor: 'color(srgb 0.5 0.6 0.7)' })
  try {
    const glass = new GlassController()
    glass.update({ enabled: true, glassTransparency: 55, composerFrost: 10, surfaceFrost: 8 })
    const css = glass.styleEl.textContent
    // color(srgb 0.5 0.6 0.7) at keep 45 must serialize exactly like this —
    // anything xterm's css.toColor rejects ends up as an opaque #000000 canvas.
    assert.ok(css.includes('--ui-terminal-surface-background: rgba(128, 153, 179, 0.45)'))
    // Composer: frost on the surface itself, fill joined to the structural keep.
    assert.ok(css.includes('[data-slot="composer-surface"]'))
    assert.ok(css.includes('backdrop-filter: var(--hermes-skins-composer-frost)'))
    assert.ok(css.includes('--composer-fill: color-mix(in srgb, var(--ui-bg-chrome) var(--hermes-skins-keep), transparent)'))
    // Cards (--dt-card consumers) join the material through --ui-bg-editor.
    assert.ok(css.includes('--ui-bg-editor: var(--hermes-skins-editor-tint)'))
    // Pane tab strip double fill is neutralized.
    assert.ok(css.includes('--pane-tab-strip-bg: transparent'))
    // The old fixed overlay frost layer must never come back.
    assert.equal(css.includes('hermes-skins-composer-frost"'), false)
    const probes = f.created.filter(el => el.tagName === 'span')
    assert.equal(probes.length, 1)
    assert.equal(probes[0].parentNode, null, 'color probe is removed after use')
  } finally {
    f.restore()
  }
})

test('unpatched hosts keep the opaque terminal var', () => {
  const f = fixture({ terminalAlpha: false })
  try {
    const glass = new GlassController()
    glass.update({ enabled: true })
    assert.ok(glass.styleEl.textContent.includes('--ui-terminal-surface-background: var(--ui-bg-chrome)'))
    assert.equal(f.created.filter(el => el.tagName === 'span').length, 0, 'no probe runs without the host patch')
  } finally {
    f.restore()
  }
})

test('endpoint levers stay honest in the generated stylesheet', () => {
  const f = fixture({ terminalAlpha: true })
  try {
    const glass = new GlassController()
    glass.update({ enabled: true, glassTransparency: 100, surfaceFrost: 0, composerFrost: 0, bubbleOpacity: 0 })
    const css = glass.styleEl.textContent
    assert.ok(css.includes('--hermes-skins-keep: 0%'))
    assert.ok(css.includes('--hermes-skins-frost: none'))
    assert.ok(css.includes('--hermes-skins-composer-frost: none'))
    assert.ok(css.includes('--user-bubble-keep: 0% !important'))
    assert.ok(css.includes('rgba(128, 153, 179, 0)'))
    assert.ok(css.includes('[data-glass-raised]'))
    assert.ok(css.includes('[data-overlay-surface]'))
    glass.update({ enabled: true, glassTransparency: 0, surfaceFrost: 20 })
    assert.ok(glass.styleEl.textContent.includes('--hermes-skins-keep: 100%'))
    assert.ok(glass.styleEl.textContent.includes('[data-glass-raised]'))
  } finally {
    f.restore()
  }
})

test('disabling removes the runtime stylesheet and the active attribute', () => {
  const f = fixture({ terminalAlpha: true })
  try {
    const glass = new GlassController()
    glass.update({ enabled: true })
    assert.ok(f.head.children.includes(glass.styleEl))
    glass.destroy()
    assert.equal(f.head.children.includes(glass.styleEl), false)
    assert.equal(f.root.attributes['data-hermes-skins-active'], undefined)
    assert.equal(glass.styleEl, null)
  } finally {
    f.restore()
  }
})

test('terminal boxes are observed and a real teardown releases the watcher', async () => {
  const f = fixture({ terminalAlpha: true })
  const previousObserver = globalThis.ResizeObserver
  const observers = []
  globalThis.ResizeObserver = class {
    constructor(callback) { observers.push(this); this.callback = callback; this.observed = new Set() }
    observe(el) { this.observed.add(el) }
    unobserve(el) { this.observed.delete(el) }
    disconnect() { this.observed.clear(); this.disconnected = true }
  }
  try {
    const glass = new GlassController()
    globalThis.document.querySelectorAll = () => [f.root]
    glass.update({ enabled: true })
    assert.equal(observers.length, 1)
    assert.ok(observers[0].observed.has(f.root), 'terminal containers are observed while enabled')

    let nudges = 0
    const listener = () => { nudges += 1 }
    globalThis.window.addEventListener('resize', listener)
    observers[0].callback()
    await new Promise(resolve => setTimeout(resolve, 220))
    globalThis.window.removeEventListener('resize', listener)
    assert.equal(nudges, 1, 'one debounced resize nudge per burst')

    glass.destroy()
    assert.equal(observers[0].disconnected, true, 'teardown releases the refit watcher')
  } finally {
    globalThis.ResizeObserver = previousObserver
    f.restore()
  }
})
