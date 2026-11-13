import test from 'node:test'
import assert from 'node:assert/strict'
import { GlassController, findXtermTerminal, parseSerializedColor } from '../src/engine/glass-controller.js'

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
    querySelectorAll: () => [],
    createElement: tag => { const el = makeElement(tag); created.push(el); return el }
  }
  const windowMock = {
    listeners: new Map(),
    addEventListener(name, fn) { this.listeners.set(name, fn) },
    removeEventListener(name, fn) { if (this.listeners.get(name) === fn) this.listeners.delete(name) },
    dispatchEvent(event) { this.listeners.get(event.type)?.(event); return true }
  }
  const mutationObservers = []
  globalThis.MutationObserver = class {
    constructor(callback) { this.callback = callback; mutationObservers.push(this) }
    observe(target, options) { this.target = target; this.options = options }
    disconnect() { this.disconnected = true }
  }
  const previous = {
    document: globalThis.document,
    window: globalThis.window,
    getComputedStyle: globalThis.getComputedStyle,
    MutationObserver: globalThis.MutationObserver
  }
  globalThis.document = documentMock
  globalThis.window = windowMock
  globalThis.getComputedStyle = () => ({
    backgroundColor: resolvedColor,
    getPropertyValue: name => name === '--hermes-skins-terminal-canvas-blend' ? 'screen' : ''
  })
  return {
    root, head, created, windowMock, mutationObservers,
    restore: () => {
      globalThis.document = previous.document
      globalThis.window = previous.window
      globalThis.getComputedStyle = previous.getComputedStyle
      globalThis.MutationObserver = previous.MutationObserver
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

test('material drags preserve the parsed sheet and reuse the resolved terminal theme color', () => {
  const f = fixture({ terminalAlpha: true })
  try {
    const controller = new GlassController()
    controller.update({ enabled: true, glassTransparency: 10 })
    const sheetText = controller.styleEl.textContent
    const properties = new Map()
    controller.materialRule = {
      getPropertyValue: key => properties.get(key) || '',
      setProperty: (key, value, priority) => { properties.set(key, value); if (key === '--user-bubble-keep') assert.equal(priority, 'important') }
    }
    for (let value = 0; value <= 100; value++) controller.update({ enabled: true, glassTransparency: value, bubbleOpacity: value, composerFrost: 0, surfaceFrost: 0 })
    assert.equal(controller.styleEl.textContent, sheetText, 'the selector sheet is never reparsed during a drag')
    assert.equal(f.created.filter(el => el.tagName === 'span').length, 1, 'there is no per-sample forced style probe')
    assert.equal(properties.get('--hermes-skins-keep'), '0%')
    assert.equal(properties.get('--user-bubble-keep'), '100%')
    assert.equal(properties.get('--hermes-skins-frost'), 'none')
    assert.equal(properties.get('--ui-terminal-surface-background'), 'rgba(128, 153, 179, 0)')
    controller.destroy()
  } finally { f.restore() }
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

test('unpatched hosts receive a runtime-alpha terminal with one glass fill', () => {
  const f = fixture({ terminalAlpha: false })
  try {
    const glass = new GlassController()
    glass.update({ enabled: true })
    assert.ok(glass.styleEl.textContent.includes('--ui-terminal-surface-background: rgba(128, 153, 179, 0.9)'))
    assert.ok(glass.styleEl.textContent.includes('--hermes-skins-terminal-tint: rgba(128, 153, 179, 0.9)'))
    assert.ok(glass.styleEl.textContent.includes('background-color: transparent !important'))
    assert.ok(glass.styleEl.textContent.includes('background-color: var(--hermes-skins-terminal-tint'))
    assert.ok(glass.styleEl.textContent.includes('[data-persistent-terminal] [data-terminal]'))
    assert.ok(glass.styleEl.textContent.includes('::selection'))
    assert.ok(glass.styleEl.textContent.includes('#c8dcff'))
    assert.ok(glass.styleEl.textContent.includes('.composer-human-message'))
    assert.ok(glass.styleEl.textContent.includes('--dt-user-bubble: transparent'))
    assert.ok(glass.styleEl.textContent.includes('box-shadow: none !important'))
    assert.ok(glass.styleEl.textContent.includes('contain: size layout !important'))
    assert.ok(glass.styleEl.textContent.includes('mix-blend-mode: var(--hermes-skins-terminal-canvas-blend, normal) !important'))
    assert.ok(glass.styleEl.textContent.includes('--hermes-skins-terminal-canvas-blend:'))
    assert.equal(f.created.filter(el => el.tagName === 'span').length, 1, 'one probe resolves the theme chrome')
  } finally {
    f.restore()
  }
})

test('terminal refs are discovered through the owning React fiber without component-name coupling', () => {
  const fakeTerminal = {
    options: { theme: {}, allowTransparency: false },
    _core: { optionsService: { onSpecificOptionChange: () => () => {} } },
    refresh() {},
    rows: 24
  }
  const fakeAddon = { _terminal: fakeTerminal, _renderer: {}, dispose() {} }
  const componentFiber = {
    memoizedState: {
      memoizedState: { current: null },
      next: {
        memoizedState: { current: fakeTerminal },
        next: { memoizedState: { current: fakeAddon }, next: null }
      }
    },
    return: null,
    alternate: null
  }
  const hostFiber = { memoizedState: null, return: componentFiber, alternate: null }
  const host = { __reactFiber$test: hostFiber }
  assert.deepEqual(findXtermTerminal(host), { terminal: fakeTerminal, addon: fakeAddon })
  assert.equal(findXtermTerminal({}), null)
})

test('transparent terminals keep native foreground contrast and use one soft selection tint', () => {
  const fakeColors = {}
  const fakeTerminal = {
    options: {
      theme: { foreground: '#1f2328', selectionBackground: '#old' },
      allowTransparency: false,
      minimumContrastRatio: 4.5
    },
    _core: {
      optionsService: { onSpecificOptionChange: () => () => {} },
      _renderService: { _renderer: { value: { _themeService: { _colors: fakeColors } } } }
    },
    refresh() {},
    rows: 24
  }
  const fakeAddon = { _terminal: fakeTerminal, _renderer: {}, dispose() {}, clearTextureAtlas() {} }
  const componentFiber = {
    memoizedState: {
      memoizedState: { current: fakeTerminal },
      next: { memoizedState: { current: fakeAddon }, next: null }
    },
    return: null,
    alternate: null
  }
  const host = {
    __reactFiber$test: { memoizedState: null, return: componentFiber, alternate: null },
    dataset: {},
    style: {
      properties: new Map(),
      setProperty(name, value, priority) { this.properties.set(name, [value, priority]) },
      removeProperty(name) { this.properties.delete(name) },
      getPropertyValue(name) { return this.properties.get(name)?.[0] || '' },
      getPropertyPriority(name) { return this.properties.get(name)?.[1] || '' }
    },
    matches: () => true,
    querySelectorAll: () => []
  }
  const glass = new GlassController()
  glass.terminalRecords.clear()
  glass.ensureTerminalTransparency(host)
  assert.equal(fakeTerminal.options.minimumContrastRatio, 1)
  assert.equal(fakeTerminal.options.theme.foreground, '#1f2328')
  assert.equal(fakeTerminal.options.theme.selectionBackground, '#4f8cff59')
  assert.equal(fakeTerminal.options.theme.selectionInactiveBackground, '#4f8cff59')
  assert.equal(fakeTerminal.options.theme.selectionForeground, undefined)
  glass.restoreTerminalTransparency()
  assert.equal(fakeTerminal.options.minimumContrastRatio, 4.5)
  assert.equal(fakeTerminal.options.allowTransparency, false)
})

test('endpoint levers stay honest in the generated stylesheet', () => {
  const f = fixture({ terminalAlpha: true })
  try {
    const glass = new GlassController()
    glass.update({
      enabled: true, glassTransparency: 100, surfaceFrost: 0, settingsWindowBlur: 0,
      composerFrost: 0, bubbleOpacity: 0
    })
    const css = glass.styleEl.textContent
    assert.ok(css.includes('--hermes-skins-keep: 0%'))
    assert.ok(css.includes('--hermes-skins-frost: none'))
    assert.ok(css.includes('--hermes-skins-overlay-frost: none'))
    assert.ok(css.includes('--hermes-skins-overlay-scrim-frost: none'))
    assert.equal(/backdrop-filter: blur\((12|20)px\)/.test(css), false)
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

    globalThis.window.addEventListener('resize', listener)
    observers[0].callback()
    glass.destroy()
    await new Promise(resolve => setTimeout(resolve, 180))
    globalThis.window.removeEventListener('resize', listener)
    assert.equal(nudges, 1, 'teardown cancels a queued resize callback')
    assert.equal(observers[0].disconnected, true, 'teardown releases the refit watcher')
  } finally {
    globalThis.ResizeObserver = previousObserver
    f.restore()
  }
})

test('terminal xterm descendants receive glass surface styles dynamically', () => {
  const f = fixture()
  try {
    const glass = new GlassController()
    glass.update({ enabled: true })
    assert.equal(f.mutationObservers.length, 1)
    f.root.setAttribute('data-hermes-skins-active', 'true')
    f.root.getAttribute = name => f.root.attributes[name]
    const host = { ...f.root }
    host.style = { ...f.root.style }
    host.dataset = { ...f.root.dataset }
    host.matches = selector => selector.includes('[data-terminal]')
    host.style.properties = new Map()
    host.style.setProperty = (name, value, priority) => host.style.properties.set(name, [value, priority])
    host.style.removeProperty = name => host.style.properties.delete(name)
    const screen = {
      style: {
        properties: new Map(),
        setProperty(name, value, priority) { this.properties.set(name, [value, priority]) },
        removeProperty(name) { this.properties.delete(name) }
      }
    }
    const canvas = {
      classList: { contains: () => false },
      style: {
        properties: new Map(),
        setProperty(name, value, priority) { this.properties.set(name, [value, priority]) },
        removeProperty(name) { this.properties.delete(name) }
      }
    }
    host.querySelectorAll = selector => selector.includes('canvas') ? [canvas] : [screen]
    glass.applyTerminalSurface(host)
    assert.deepEqual(screen.style.properties.get('background-color'), ['transparent', 'important'])
    assert.deepEqual(canvas.style.properties.get('mix-blend-mode'), ['screen', 'important'])
    glass.destroy()
    assert.equal(f.mutationObservers[0].disconnected, true)
  } finally {
    f.restore()
  }
})
