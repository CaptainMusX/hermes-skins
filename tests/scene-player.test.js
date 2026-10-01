import test from 'node:test'
import assert from 'node:assert/strict'
import { loadSceneManifest } from '../src/engine/scene-player.js'

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
