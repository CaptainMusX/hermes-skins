import test from 'node:test'
import assert from 'node:assert/strict'
import { watchRootTheme } from '../src/engine/theme-watcher.js'

function fixture({ previewing = false } = {}) {
  const syncs = []
  const store = { $tryOnSkin: { get: () => (previewing ? { id: 'skin-preview' } : null) } }
  const controller = { sync: (...args) => syncs.push(args) }
  const observers = []
  const root = { dataset: { hermesTheme: 'nous-alt', hermesMode: 'dark' } }
  const previousDocument = globalThis.document
  const previousObserver = globalThis.MutationObserver

  globalThis.MutationObserver = class {
    constructor(callback) { this.callback = callback; observers.push(this) }
    observe() { this.observing = true }
    disconnect() { this.disconnected = true }
    /** Simulate the host repainting one root attribute. */
    mutate() { this.callback([], this) }
  }
  globalThis.document = { documentElement: root }

  const dispose = watchRootTheme(store, controller)
  return {
    syncs, observers, root, dispose,
    restore: () => { globalThis.document = previousDocument; globalThis.MutationObserver = previousObserver }
  }
}

const flush = () => new Promise(resolve => queueMicrotask(() => queueMicrotask(resolve)))

test('committed theme repaints sync with the painted name and mode', async () => {
  const f = fixture()
  try {
    f.root.dataset.hermesTheme = 'solarized'
    f.root.dataset.hermesMode = 'light'
    f.observers[0].mutate()
    await flush()
    assert.deepEqual(f.syncs, [['solarized', 'light']])
  } finally {
    f.restore()
  }
})

test('a try-on preview is not cancelled by its own repaint', async () => {
  const f = fixture({ previewing: true })
  try {
    // applyTheme stamps the PREVIEWED skin name on the root during try-on.
    f.root.dataset.hermesTheme = 'skin-preview'
    f.observers[0].mutate()
    await flush()
    assert.equal(f.syncs.length, 0, 'painted-name flap during try-on must not re-sync')

    // A mode change during try-on refreshes the veil without touching the name.
    f.root.dataset.hermesMode = 'light'
    f.observers[0].mutate()
    await flush()
    assert.equal(f.syncs.length, 1)
    assert.equal(f.syncs[0][0], undefined, 'committed name stays whatever sync last recorded')
    assert.equal(f.syncs[0][1], 'light')
  } finally {
    f.restore()
  }
})

test('bursts coalesce and identical repaints dedupe', async () => {
  const f = fixture()
  try {
    f.root.dataset.hermesMode = 'light'
    f.observers[0].mutate()
    f.observers[0].mutate()
    f.observers[0].mutate()
    await flush()
    assert.equal(f.syncs.length, 1)
    // Repainting the same state again is a no-op.
    f.observers[0].mutate()
    await flush()
    assert.equal(f.syncs.length, 1)
  } finally {
    f.restore()
  }
})

test('terminal alpha capability repaints the material after the renderer loads', async () => {
  const f = fixture()
  try {
    f.root.dataset.hermesTerminalAlpha = 'true'
    f.observers[0].mutate()
    await flush()
    assert.deepEqual(f.syncs, [['nous-alt', 'dark']])
  } finally {
    f.restore()
  }
})

test('dispose disconnects the observer completely', async () => {
  const f = fixture()
  try {
    f.dispose()
    assert.equal(f.observers[0].disconnected, true)
    f.root.dataset.hermesMode = 'light'
    f.observers[0].mutate()
    await flush()
    assert.equal(f.syncs.length, 0)
  } finally {
    f.restore()
  }
})
