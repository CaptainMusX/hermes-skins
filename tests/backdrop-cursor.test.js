import test from 'node:test'
import assert from 'node:assert/strict'
import { BackdropManager } from '../src/engine/backdrop-manager.js'

function fixture() {
  const oldWindow = globalThis.window, oldDocument = globalThis.document
  const frames = new Map()
  let id = 0
  const window = Object.assign(new EventTarget(), {
    innerWidth: 1000, innerHeight: 600,
    requestAnimationFrame: fn => { frames.set(++id, fn); return id },
    cancelAnimationFrame: number => frames.delete(number)
  })
  globalThis.window = window
  globalThis.document = new EventTarget()
  const messages = []
  const manager = new BackdropManager()
  manager.sceneIframe = {
    getBoundingClientRect: () => ({ left: -8, top: -8, right: 1008, bottom: 608, width: 1016, height: 616 }),
    contentWindow: { postMessage: message => messages.push(message) }
  }
  manager.ensureCursorForwarding()
  const move = (x, y) => {
    const event = new Event('pointermove')
    Object.assign(event, { clientX: x, clientY: y, buttons: 0 })
    window.dispatchEvent(event)
  }
  return {
    manager, messages, frames, move,
    flush: () => { const pending = [...frames.values()]; frames.clear(); pending.forEach(fn => fn()) },
    restore: () => { globalThis.window = oldWindow; globalThis.document = oldDocument }
  }
}

test('cursor forwarding preserves the latest position and uses the overscanned iframe rectangle', () => {
  const f = fixture()
  try {
    f.move(200, 100); f.move(400, 200); f.move(700, 400)
    assert.equal(f.frames.size, 1, 'one delivery per compositor frame instead of dropping the last move')
    f.flush()
    assert.equal(f.messages.length, 1)
    assert.equal(f.messages[0].type, 'pointer')
    assert.ok(Math.abs(f.messages[0].u - 708 / 1016) < 1e-9)
    assert.ok(Math.abs(f.messages[0].v - 408 / 616) < 1e-9)
  } finally { f.manager.destroy(); f.restore() }
})

test('disposing a wallpaper cancels queued mouse delivery and releases host listeners', () => {
  const f = fixture()
  try {
    f.move(700, 400)
    f.manager.destroy()
    assert.equal(f.manager.cursorForwardInit, false, 'dispose releases the pointer listener registration')
    assert.equal(f.frames.size, 0)
    f.move(900, 500)
    assert.equal(f.frames.size, 0, 'hot reload must not accumulate pointer listeners')
  } finally { f.restore() }
})

test('releasing a live layer destroys its iframe and video decoder', () => {
  const f = fixture()
  try {
    const messages = []
    const video = {
      src: 'old.mp4',
      pause() { this.paused = true },
      removeAttribute() { this.src = '' },
      load() { this.loaded = true }
    }
    const frame = { contentWindow: { postMessage: message => messages.push(message) } }
    const layer = {
      _media: { querySelector: selector => selector === 'iframe' ? frame : selector === 'video' ? video : null },
      remove() { this.removed = true }
    }
    f.manager.layers = { children: [layer] }
    f.move(400, 200)
    f.manager.releaseMedia()
    assert.equal(video.paused, true)
    assert.equal(video.src, '')
    assert.equal(video.loaded, true)
    assert.equal(layer.removed, true)
    assert.equal(messages[0].command, 'destroy')
    assert.equal(f.frames.size, 0)
  } finally { f.manager.destroy(); f.restore() }
})

test('a renderer error falls back to the poster instead of rebuilding in a loop', () => {
  const f = fixture()
  try {
    let state = null
    f.manager.onLiveState = value => { state = value }
    f.manager.liveReady = true
    f.manager.handleSceneMessage({
      source: f.manager.sceneIframe.contentWindow,
      data: { source: 'hermes-skins-scene', type: 'error', message: 'context lost' }
    })
    assert.equal(f.manager.liveFailed, true)
    assert.equal(f.manager.liveReady, true)
    assert.equal(state.ready, false)
    assert.match(state.error, /context lost/)
  } finally { f.manager.destroy(); f.restore() }
})
