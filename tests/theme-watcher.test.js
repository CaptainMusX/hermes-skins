import test from 'node:test'
import assert from 'node:assert/strict'
import { watchRootTheme } from '../src/engine/theme-watcher.js'

function fixture() {
  const syncs = []
  const controller = { sync: (...args) => syncs.push(args) }
  const observers = []
  const root = { dataset: { hermesMode: 'dark' } }
  const previousDocument = globalThis.document
  const previousObserver = globalThis.MutationObserver
  globalThis.MutationObserver = class {
    constructor(callback) { this.callback = callback; observers.push(this) }
    observe() { this.observing = true }
    disconnect() { this.disconnected = true }
    mutate() { this.callback([], this) }
  }
  globalThis.document = { documentElement: root }
  const dispose = watchRootTheme(controller)
  return {
    syncs, observers, root, dispose,
    restore: () => { globalThis.document = previousDocument; globalThis.MutationObserver = previousObserver }
  }
}

const flush = () => new Promise(resolve => queueMicrotask(() => queueMicrotask(resolve)))

test('theme/mode repaints trigger one controller sync', async () => {
  const f = fixture()
  try {
    f.root.dataset.hermesMode = 'light'
    f.root.dataset.hermesTerminalAlpha = 'true'
    f.observers[0].mutate()
    await flush()
    assert.deepEqual(f.syncs, [[]])
  } finally { f.restore() }
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
    f.observers[0].mutate()
    await flush()
    assert.equal(f.syncs.length, 1)
  } finally { f.restore() }
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
  } finally { f.restore() }
})
