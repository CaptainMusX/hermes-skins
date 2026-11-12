import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import { loadSceneManifest, sceneResourceFileUrl } from '../src/engine/scene-player.js'

const PIXEL = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/aXcAAAAASUVORK5CYII='

test('scene manifest resource paths become local Blob URLs for sandboxed WebGL', async () => {
  const resource = '/api/skin-center/we/scene-resource/local/materials/test.tex'
  const bridge = {
    async readFileText() { return { text: JSON.stringify({
      manifest: { width: 1920, height: 1080, layers: [{ texUrl: resource }] },
      resources: { [resource]: 'C:\\cache\\texture.png' }, framePath: 'C:\\cache\\frame.png'
    }), truncated: false } },
    async readFileDataUrl() { return PIXEL }
  }
  const scene = await loadSceneManifest(bridge, 'C:\\cache\\manifest.json')
  try {
    assert.match(scene.manifest.layers[0].texUrl, /^blob:/)
    assert.equal(scene.resourceCount, 1)
    assert.equal(scene.framePath, 'C:\\cache\\frame.png')
  } finally {
    scene.objectUrls.forEach(url => URL.revokeObjectURL(url))
  }
})

test('scene loader refreshes an old saved cache before loading its textures', async () => {
  const oldPath = 'C:\\cache\\old\\manifest.json'
  const newPath = 'C:\\cache\\v3\\manifest.json'
  const dir = 'D:\\Steam\\workshop\\431960\\2355830494'
  const resource = '/api/skin-center/we/scene-resource/local/materials/base.tex'
  const blend = '/api/skin-center/we/scene-resource/local/materials/reveal.tex'
  const reads = [], preparations = []
  const bridge = {
    async readFileText(path) {
      reads.push(path)
      return { text: JSON.stringify(path === oldPath ? {
        scenePath: `${dir}\\scene.pkg`, manifest: { layers: [{ texUrl: resource }] },
        resources: { [resource]: 'old.png' }
      } : {
        parserVersion: 6, manifest: { layers: [{ texUrl: resource, xrayBlendUrl: blend }] },
        resources: { [resource]: 'base.png', [blend]: 'reveal.png' }
      }) }
    },
    async readFileDataUrl() { return PIXEL }
  }
  const scene = await loadSceneManifest(bridge, oldPath, async path => {
    preparations.push(path)
    return { ok: true, manifest: true, manifestPath: newPath }
  })
  try {
    assert.deepEqual(preparations, [dir])
    assert.deepEqual(reads, [oldPath, newPath])
    assert.match(scene.manifest.layers[0].xrayBlendUrl, /^blob:/)
    assert.equal(scene.resourceCount, 2)
  } finally { scene.objectUrls.forEach(url => URL.revokeObjectURL(url)) }
})

test('scene player restores cursor-driven wallpaper behavior', () => {
  const player = fs.readFileSync(new URL('../third_party/dsh-skins/we-player-source.ts', import.meta.url), 'utf8')
  // The host mirrors the pointer (the backdrop never receives input).
  assert.match(player, /dsh-set-cursor/)
  // Hide-near-cursor layers fade under the pointer and return after it leaves.
  assert.match(player, /cursorHide/)
  assert.match(player, /_cursorHideK/)
  // Parallax keeps following the mirrored pointer.
  assert.match(player, /mouseX = cursorX/)
})

test('scene extractor flags cursor-driven layers', () => {
  const extract = fs.readFileSync(new URL('../third_party/dsh-skins/pkg-extract.ts', import.meta.url), 'utf8')
  assert.match(extract, /cursorLayerFlags/)
  assert.match(extract, /cursorHide\?: boolean/)
  assert.match(extract, /cursor\(enter\|leave\|move\|down\|up\|click\)/)
})

test('scene extractor resolves the xray reveal blend texture', () => {
  const extract = fs.readFileSync(new URL('../third_party/dsh-skins/pkg-extract.ts', import.meta.url), 'utf8')
  assert.match(extract, /xrayBlendUrl\?: string/)
  assert.match(extract, /xraySize\?: number/)
  assert.match(extract, /xrayMultiply\?: number/)
  assert.match(extract, /includes\('xray'\)/)
})

test('scene player renders the xray cursor reveal', () => {
  const player = fs.readFileSync(new URL('../third_party/dsh-skins/we-player-source.ts', import.meta.url), 'utf8')
  assert.match(player, /progXray/)
  assert.match(player, /u_cursorUV/)
  assert.match(player, /xrayBlendUrl/)
  assert.match(player, /u_pointerScale/)
})

test('backdrop mirrors the pointer into live wallpapers', () => {
  const backdrop = fs.readFileSync(new URL('../src/engine/backdrop-manager.js', import.meta.url), 'utf8')
  assert.match(backdrop, /forwardCursor/)
  assert.match(backdrop, /dsh-set-cursor/)
  assert.match(backdrop, /hermes-we-cursor/)
  assert.match(backdrop, /this\.webIframe = frame/)
})

test('cancelling an obsolete scene stops reading resources and releases allocated Blob URLs', async () => {
  const controller = new AbortController()
  let resourceReads = 0
  const bridge = {
    async readFileText() { return { text: JSON.stringify({ manifest: { layers: [] }, resources: { a: 'a.png', b: 'b.png' } }) } },
    async readFileDataUrl() { resourceReads++; controller.abort(); return PIXEL }
  }
  await assert.rejects(loadSceneManifest(bridge, 'manifest.json', null, controller.signal), { name: 'AbortError' })
  assert.equal(resourceReads, 1, 'a switched-away wallpaper must not continue reading large resources')
})

test('native file-origin scenes avoid whole-file bridge reads and Blob copies', async () => {
  const previous = { window: globalThis.window, fetch: globalThis.fetch }
  let bridgeReads = 0
  const heads = []
  const bridge = {
    async readFileText() { return { text: JSON.stringify({ parserVersion: 6,
      manifest: { layers: [{ videoUrl: 'video', texUrl: 'image' }] },
      resources: { video: 'C:\\cache\\large movie.mp4', image: 'C:\\cache\\图像.png', alias: 'C:\\cache\\large movie.mp4' } }) } },
    async readFileDataUrl() { bridgeReads++; throw new Error('large assets must stay outside JS heap') }
  }
  globalThis.window = { location: { protocol: 'file:' }, hermesDesktop: bridge }
  globalThis.fetch = async (url, options) => { assert.equal(options.method, 'HEAD'); heads.push(url); return { ok: true } }
  try {
    const scene = await loadSceneManifest(bridge, 'C:\\cache\\manifest.json')
    assert.equal(bridgeReads, 0)
    assert.equal(heads.length, 2, 'aliased paths share the same access check')
    assert.deepEqual(scene.objectUrls, [])
    assert.equal(scene.manifest.layers[0].videoUrl, 'file:///C:/cache/large%20movie.mp4')
    assert.equal(scene.manifest.layers[0].texUrl, 'file:///C:/cache/%E5%9B%BE%E5%83%8F.png')
    assert.equal(sceneResourceFileUrl('javascript:evil.mp4'), null)
    assert.equal(sceneResourceFileUrl('C:\\cache\\run.html'), null)
  } finally { Object.assign(globalThis, previous) }
})

test('restricted file-origin hosts fall back to the bridge', async () => {
  const previous = { window: globalThis.window, fetch: globalThis.fetch }
  const originalFetch = globalThis.fetch
  let reads = 0
  const bridge = {
    async readFileText() { return { text: JSON.stringify({ manifest: { layers: [{ texUrl: 'image' }] }, resources: { image: 'C:\\cache\\image.png' } }) } },
    async readFileDataUrl() { reads++; return PIXEL }
  }
  globalThis.window = { location: { protocol: 'file:' }, hermesDesktop: bridge }
  globalThis.fetch = (url, options) => options?.method === 'HEAD' ? Promise.reject(new Error('blocked')) : originalFetch(url, options)
  try {
    const scene = await loadSceneManifest(bridge, 'manifest.json')
    assert.equal(reads, 1)
    assert.match(scene.manifest.layers[0].texUrl, /^blob:/)
    scene.objectUrls.forEach(url => URL.revokeObjectURL(url))
  } finally { Object.assign(globalThis, previous) }
})
