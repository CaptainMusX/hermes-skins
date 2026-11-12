import test from 'node:test'
import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildSync } from 'esbuild'

const require = createRequire(import.meta.url)
const bundled = buildSync({
  entryPoints: [fileURLToPath(new URL('../third_party/dsh-skins/pkg-extract.ts', import.meta.url))],
  bundle: true,
  platform: 'node',
  format: 'cjs',
  write: false,
}).outputFiles[0].text
const module = { exports: {} }
new Function('require', 'module', 'exports', bundled)(require, module, module.exports)
const extractor = module.exports

test('DXT5 alpha interpolation with a0 <= a1 computes correct 5-step interpolated alpha', () => {
  // Construct a minimal 4x4 DXT5 block
  // 16 bytes:
  // a0 = 10, a1 = 60 (a0 <= a1)
  // 6 bytes alpha indices: 3 bits per pixel
  // 8 bytes color block (e.g. all black)
  const block = new Uint8Array(16)
  block[0] = 10
  block[1] = 60
  // Put index 2 in pixel 0, index 3 in pixel 1, index 4 in pixel 2, index 5 in pixel 3, index 6 in pixel 4, index 7 in pixel 5
  // indices: [2, 3, 4, 5, 6, 7, 0, 1]
  // 3 bits each:
  // p0: 2 (010)
  // p1: 3 (011) -> 011010 = 0x1A
  // p2: 4 (100) -> 00 100 011 010 -> byte0: 0b00011010 = 0x1A, byte1: ...
  let bits = 0n
  const indices = [2, 3, 4, 5, 6, 7, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0]
  for (let i = 0; i < 16; i++) {
    bits |= BigInt(indices[i]) << BigInt(i * 3)
  }
  for (let b = 0; b < 6; b++) {
    block[2 + b] = Number((bits >> BigInt(b * 8)) & 0xFFn)
  }
  // Color block: 8 bytes (white color)
  block[8] = 0xFF; block[9] = 0xFF; // c0 = white
  block[10] = 0xFF; block[11] = 0xFF; // c1 = white
  block[12] = 0; block[13] = 0; block[14] = 0; block[15] = 0; // indices 0

  // Pack into a minimal TEX container (TEXV0005 + TEXI0001 + TEXB0003)
  const header = Buffer.alloc(128)
  let p = 0
  header.write('TEXV0005\0', p, 'utf8'); p += 9
  header.write('TEXI0001\0', p, 'utf8'); p += 9
  header.writeInt32LE(4, p); p += 4 // format DXT5
  header.writeInt32LE(0, p); p += 4 // flags
  header.writeInt32LE(4, p); p += 4 // texture width
  header.writeInt32LE(4, p); p += 4 // texture height
  header.writeInt32LE(4, p); p += 4 // image width
  header.writeInt32LE(4, p); p += 4 // image height
  header.writeUInt32LE(0, p); p += 4 // unknown
  header.write('TEXB0003\0', p, 'utf8'); p += 9
  header.writeInt32LE(1, p); p += 4 // image count
  header.writeInt32LE(0, p); p += 4 // free image format
  header.writeInt32LE(1, p); p += 4 // mipmap count
  // mipmap
  header.writeInt32LE(4, p); p += 4 // width
  header.writeInt32LE(4, p); p += 4 // height
  header.writeInt32LE(0, p); p += 4 // is lz4
  header.writeInt32LE(16, p); p += 4 // decompressed count
  header.writeInt32LE(16, p); p += 4 // stored bytes
  const texData = Buffer.concat([header.subarray(0, p), block])

  const decoded = extractor.decodeTex(new Uint8Array(texData))
  assert.equal(decoded.width, 4)
  assert.equal(decoded.height, 4)

  // Expected alphas for a0=10, a1=60:
  // k=2: Math.floor((4*10 + 1*60)/5) = 20
  // k=3: Math.floor((3*10 + 2*60)/5) = 30
  // k=4: Math.floor((2*10 + 3*60)/5) = 40
  // k=5: Math.floor((1*10 + 4*60)/5) = 50
  // k=6: 0
  // k=7: 255
  assert.equal(decoded.rgba[0 * 4 + 3], 20, 'pixel 0 alpha (index 2)')
  assert.equal(decoded.rgba[1 * 4 + 3], 30, 'pixel 1 alpha (index 3)')
  assert.equal(decoded.rgba[2 * 4 + 3], 40, 'pixel 2 alpha (index 4)')
  assert.equal(decoded.rgba[3 * 4 + 3], 50, 'pixel 3 alpha (index 5)')
  assert.equal(decoded.rgba[4 * 4 + 3], 0, 'pixel 4 alpha (index 6)')
  assert.equal(decoded.rgba[5 * 4 + 3], 255, 'pixel 5 alpha (index 7)')
})

test('extractShakeEffect parses author parameters, masks, friction, bounds, and direction', () => {
  const author = {
    effects: [{
      file: 'effects/shake/effect.json',
      visible: true,
      passes: [{
        combos: { DIRECTION: 1 },
        constantshadervalues: {
          bounds: '0.977 0.997',
          friction: '1 1.2',
          speed: 1.0,
          strength: 0.5,
        },
        textures: [null, 'masks/shake_dir', null, 'masks/shake_op'],
      }],
    }],
  }
  const resolve = (ref) => `res://${ref}`
  const effect = extractor.extractShakeEffect(author, resolve)
  assert.ok(effect)
  assert.equal(effect.direction, 1)
  assert.equal(effect.speed, 1.0)
  assert.equal(effect.strength, 0.5)
  assert.deepEqual(effect.friction, [1, 1.2])
  assert.deepEqual(effect.bounds, [0.977, 0.997])
  assert.equal(effect.flowMaskUrl, 'res://masks/shake_dir')
  assert.equal(effect.opacityMaskUrl, 'res://masks/shake_op')
})

const localPackage = process.env.WE_CURSOR_RIPPLE_PACKAGE
test('local 2872509253 extracts shakeEffect on Eye_Back and Eye_Front', { skip: !localPackage }, () => {
  const pkg = readFileSync(localPackage)
  const project = JSON.parse(readFileSync(join(dirname(localPackage), 'project.json'), 'utf8'))
  const manifest = extractor.buildSceneManifest(pkg, 'local-shake-test', project)
  const eyeBack = manifest.layers.find((l) => l.name === 'Eye_Back')
  const eyeFront = manifest.layers.find((l) => l.name === 'Eye_Front')
  assert.ok(eyeBack && eyeBack.shakeEffect, 'Eye_Back must have shakeEffect')
  assert.ok(eyeFront && eyeFront.shakeEffect, 'Eye_Front must have shakeEffect')
  assert.equal(eyeBack.shakeEffect.direction, 1)
  assert.equal(eyeBack.shakeEffect.speed, 1)
  assert.equal(eyeBack.shakeEffect.strength, 0.5)
  assert.ok(eyeBack.shakeEffect.flowMaskUrl.includes('shake_mask_d2ec7515'))
  assert.ok(eyeBack.shakeEffect.opacityMaskUrl.includes('shake_mask_759ca3f4'))
  assert.equal(eyeFront.shakeEffect.strength, 0.53500003)
  assert.ok(eyeFront.shakeEffect.flowMaskUrl.includes('shake_mask_1cb9e0bc'))
  assert.ok(eyeFront.shakeEffect.opacityMaskUrl.includes('shake_mask_7deab34c'))
})
