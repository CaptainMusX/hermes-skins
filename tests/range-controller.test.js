import test from 'node:test'
import assert from 'node:assert/strict'
import { RangeController, rangeProgress } from '../src/engine/range-controller.js'

function fixture() {
  const inputs = []
  const listeners = new Map()
  const observers = []
  const styles = []
  const original = { document: globalThis.document, MutationObserver: globalThis.MutationObserver }
  const makeInput = (value = 50, min = '', max = '') => {
    const properties = new Map()
    const input = {
      value, min, max, type: 'range', isConnected: true,
      get valueAsNumber() { return Number(this.value) },
      matches() { return this.type === 'range' },
      querySelectorAll() { return [] },
      style: {
        getPropertyValue: key => properties.get(key)?.value || '',
        getPropertyPriority: key => properties.get(key)?.priority || '',
        setProperty: (key, value, priority = '') => properties.set(key, { value, priority }),
        removeProperty: key => properties.delete(key)
      }
    }
    inputs.push(input)
    return input
  }
  const document = {
    documentElement: {},
    head: { appendChild: style => styles.push(style) },
    createElement: () => ({ dataset: {}, remove() { this.removed = true } }),
    querySelectorAll: () => inputs.filter(input => input.isConnected && input.type === 'range'),
    addEventListener: (name, fn, capture) => {
      assert.equal(capture, true)
      listeners.set(name, fn)
    },
    removeEventListener: (name, fn) => { if (listeners.get(name) === fn) listeners.delete(name) }
  }
  globalThis.document = document
  globalThis.MutationObserver = class {
    constructor(callback) { this.callback = callback; observers.push(this) }
    observe(target, options) { this.options = options }
    disconnect() { this.disconnected = true }
  }
  return {
    makeInput, inputs, listeners, observers, styles,
    restore() { Object.assign(globalThis, original) }
  }
}

test('progress supports endpoints, pixel fields, nonzero and negative origins', () => {
  const input = (value, min = '', max = '') => ({ valueAsNumber: value, min, max })
  assert.equal(rangeProgress(input(0)), 0)
  assert.equal(rangeProgress(input(50)), 50)
  assert.equal(rangeProgress(input(100)), 100)
  assert.equal(rangeProgress(input(10, '0', '20')), 50)
  assert.equal(rangeProgress(input(1.25, '0.5', '2')), 50)
  assert.equal(rangeProgress(input(0, '-10', '10')), 50)
  assert.equal(rangeProgress(input(-5)), 0)
  assert.equal(rangeProgress(input(120)), 100)
  assert.equal(rangeProgress(input(10, '10', '10')), 0)
  assert.equal(rangeProgress(input(NaN)), 0)
})

test('start paints existing inputs without wallpaper and input events read live values', () => {
  const f = fixture()
  try {
    const input = f.makeInput(25)
    const controller = new RangeController()
    controller.start()
    controller.start()
    assert.equal(f.styles.length, 1, 'start is idempotent')
    assert.equal(f.listeners.size, 3)
    assert.equal(input.style.getPropertyValue('--hermes-range-progress'), '25%')
    input.value = 80
    f.listeners.get('input')({ target: input })
    assert.equal(input.style.getPropertyValue('--hermes-range-progress'), '80%')
    assert.equal(input.value, 80, 'painting never rewrites the host value')
    input.value = 0
    f.listeners.get('change')({ target: input })
    assert.equal(input.style.getPropertyValue('--hermes-range-progress'), '0%')
    controller.destroy()
    assert.equal(f.listeners.size, 0)
    assert.equal(f.styles[0].removed, true)
    assert.equal(input.style.getPropertyValue('--hermes-range-progress'), '')
    assert.equal(f.observers[0].disconnected, true)
  } finally { f.restore() }
})

test('dynamic mount and React value/bounds updates coalesce without observing style writes', async () => {
  const f = fixture()
  try {
    const controller = new RangeController()
    controller.start()
    const input = f.makeInput(10, '0', '20')
    const container = { isConnected: true, querySelectorAll: () => [input] }
    const observer = f.observers[0]
    observer.callback([{ type: 'childList', addedNodes: [container], removedNodes: [] }])
    await Promise.resolve()
    assert.equal(input.style.getPropertyValue('--hermes-range-progress'), '50%')
    input.value = 15
    input.min = '10'
    input.max = '30'
    observer.callback(['value', 'min', 'max'].map(attributeName => ({ type: 'attributes', attributeName, target: input })))
    await Promise.resolve()
    assert.equal(input.style.getPropertyValue('--hermes-range-progress'), '25%')
    assert.equal(observer.options.attributeFilter.includes('style'), false, 'no observer feedback loop')
    controller.destroy()
  } finally { f.restore() }
})

test('removal, type changes and teardown restore original property priorities', async () => {
  const f = fixture()
  try {
    const input = f.makeInput(50)
    input.style.setProperty('--hermes-range-progress', '37%', 'important')
    const controller = new RangeController()
    controller.start()
    input.type = 'number'
    f.observers[0].callback([{ type: 'attributes', target: input }])
    await Promise.resolve()
    assert.equal(input.style.getPropertyValue('--hermes-range-progress'), '37%')
    assert.equal(input.style.getPropertyPriority('--hermes-range-progress'), 'important')
    input.type = 'range'
    f.observers[0].callback([{ type: 'attributes', target: input }])
    await Promise.resolve()
    input.isConnected = false
    f.observers[0].callback([{ type: 'childList', addedNodes: [], removedNodes: [input] }])
    await Promise.resolve()
    assert.equal(controller.inputs.size, 0, 'detached controls are released')
    assert.equal(input.style.getPropertyValue('--hermes-range-progress'), '37%')
    input.isConnected = true
    f.observers[0].callback([{ type: 'childList', addedNodes: [input], removedNodes: [] }])
    controller.destroy()
    await Promise.resolve()
    assert.equal(input.style.getPropertyValue('--hermes-range-progress'), '37%', 'queued work cannot repaint after disposal')
    assert.equal(input.style.getPropertyPriority('--hermes-range-progress'), 'important')
  } finally { f.restore() }
})
