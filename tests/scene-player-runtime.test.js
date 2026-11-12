import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import vm from 'node:vm'
import { fileURLToPath } from 'node:url'
import { buildSync } from 'esbuild'

// Execute the actual embedded JS, rather than merely searching for shader names.
// GL is a call recorder; this verifies runtime work and scheduler ownership.
const compiled = buildSync({ entryPoints: [fileURLToPath(new URL('../third_party/dsh-skins/we-player-source.ts', import.meta.url))],
  bundle: true, platform: 'node', format: 'cjs', write: false }).outputFiles[0].text
const module = { exports: {} }
vm.runInNewContext(compiled, { module, exports: module.exports })
const script = module.exports.WE_SCENE_PLAYER_HTML.match(/<script>([\s\S]*?)<\/script>/)[1]

async function startPlayer(manifest, fit = 'cover', playerScript = script, nativeVideoFrames = false) {
  const errors = [], draws = [], uniforms = [], frames = new Map(), timers = new Map(), shaderSources = [], listeners = new Map(), videos = [], messages = []
  let clock = 0, nextId = 0, uploads = 0, reallocations = 0, fbos = 0, loseCalls = 0, uniformLookups = 0
  let program = null, framebuffer = null
  let drawFailure = false
  const gl = new Proxy({
    createShader: () => ({}),
    shaderSource: (shader, src) => { shader.source = src; shaderSources.push(src) },
    attachShader: (prog, shader) => prog.sources.push(shader.source),
    bindFramebuffer: (_, value) => { framebuffer = value },
    getParameter: () => framebuffer,
    uniform1f: (name, value) => uniforms.push({ name, values: [value] }),
    uniform4f: (name, ...values) => uniforms.push({ name, values }),
    uniformMatrix3fv: (name, _, values) => uniforms.push({ name, values: Array.from(values) }),
    uniform4fv: (name, values) => uniforms.push({ name, values: Array.from(values) }),
    createProgram: () => ({ sources: [] }),
    getShaderParameter: () => true,
    getProgramParameter: () => true,
    getAttribLocation: () => 0,
    getUniformLocation: (_, name) => { uniformLookups++; return name },
    useProgram: p => { program = p },
    uniform2f: (name, ...values) => uniforms.push({ name, values }),
    drawArrays: () => { if (drawFailure) throw new Error('simulated draw failure'); draws.push(program) },
    createFramebuffer: () => { fbos++; return {} },
    texImage2D: (...args) => { if (videos.includes(args.at(-1))) { uploads++; reallocations++ } },
    texSubImage2D: (...args) => { if (videos.includes(args.at(-1))) uploads++ },
    getExtension: () => ({ loseContext: () => loseCalls++ }),
    isContextLost: () => false
  }, { get: (target, key) => key in target ? target[key] : /^[A-Z_]+$/.test(key) ? 1 : () => ({}) })
  const canvasListeners = new Map()
  const canvas = { getContext: () => gl, addEventListener: (type, fn) => canvasListeners.set(type, fn), width: 0, height: 0 }
  const parent = { postMessage: msg => messages.push(msg) }
  const window = { innerWidth: 1000, innerHeight: 600, devicePixelRatio: 1, parent,
    location: { pathname: '/scene/test' },
    addEventListener: (type, listener) => {
      if (!listeners.has(type)) listeners.set(type, [])
      listeners.get(type).push(listener)
    } }
  class Image {
    width = 1000
    height = 600
    set src(_) { this.onload?.() }
  }
  const document = { getElementById: () => canvas, createElement: type => {
    assert.equal(type, 'video')
    const video = { readyState: 2, currentTime: 0, plays: 0, pauses: 0,
      addEventListener: (_, fn) => fn(), play() { this.plays++; return Promise.resolve() },
      pause() { this.pauses++ }, removeAttribute() { this.src = '' }, load() {} }
    if (nativeVideoFrames) {
      video.videoCallbacks = new Map()
      video.requestVideoFrameCallback = callback => { video.videoCallbacks.set(++nextId, callback); return nextId }
      video.cancelVideoFrameCallback = id => video.videoCallbacks.delete(id)
    }
    videos.push(video)
    return video
  } }
  vm.runInNewContext(playerScript, { window, document, Image,
    console: { error: (...args) => errors.push(args.join(' ')) },
    performance: { now: () => clock },
    requestAnimationFrame: cb => { frames.set(++nextId, cb); return nextId }, cancelAnimationFrame: id => frames.delete(id),
    setTimeout: (cb, delay) => { timers.set(++nextId, { cb, due: clock + delay }); return nextId }, clearTimeout: id => timers.delete(id),
    fetch: async () => ({ json: async () => ({ ok: true, manifest }) }) })
  await new Promise(resolve => setImmediate(resolve))
  const message = data => listeners.get('message').forEach(fn => fn({ source: parent, data }))
  message({ type: 'dsh-set-fit', fit })
  const tick = now => {
    clock = now
    for (const [id, timer] of [...timers]) if (timer.due <= clock) { timers.delete(id); timer.cb() }
    const callbacks = [...frames.values()]; frames.clear(); callbacks.forEach(cb => cb(now))
    return callbacks.length
  }
  return { errors, draws, uniforms, shaderSources, message, tick, canvas, window, videos, messages,
    failDraw: () => { drawFailure = true },
    stats: () => ({ uploads, reallocations, fbos, loseCalls, uniformLookups }),
    event: type => canvasListeners.get(type)?.({ preventDefault() {} }),
    pending: () => frames.size + timers.size,
    frame: now => assert.ok(tick(now), 'player schedules the next frame') }
}

const layer = { x: 500, y: 300, w: 1000, h: 600, texUrl: 'base.png',
  xrayBlendUrl: 'reveal.png', xraySize: 0.56, xrayMultiply: 1 }

test('embedded scene renderer draws the xray layer without a runtime exception', async () => {
  const player = await startPlayer({ width: 1000, height: 600, layers: [{ ...layer }] })
  player.message({ type: 'dsh-set-cursor', x: 0.25, y: 0.2, active: true })
  player.frame(100)
  player.frame(200)
  assert.deepEqual(player.errors, [])
  assert.equal(player.draws.length, 2, 'one screen pass per frame when no reflection is present')
  const cursor = player.uniforms.find(u => u.name === 'u_cursorUV')
  assert.ok(cursor, 'xray render branch uploads the pointer')
  assert.ok(Math.abs(cursor.values[0] - 0.25) < 1e-6)
  assert.ok(Math.abs(cursor.values[1] - 0.2) < 1e-6)
})

test('reflection shader contains no accidental patch markers', async () => {
  const player = await startPlayer({ width: 1000, height: 600, layers: [{ ...layer, isReflection: true }] })
  player.frame(0)
  const reflection = player.shaderSources.find(src => src.includes('u_reflectRange'))
  assert.ok(reflection)
  assert.doesNotMatch(reflection, /^\s*\+/m, 'patch markers must not reach the GLSL compiler')
})

test('scene player pause message sets isPaused and halts rendering loop', async () => {
  const player = await startPlayer({ width: 1000, height: 600, layers: [{ ...layer }] })
  player.message({ type: 'dsh-set-pause', paused: true })
  assert.deepEqual(player.errors, [])
})

test('fill mode does not mirror the xray cursor vertically', async () => {
  const player = await startPlayer({ width: 1000, height: 600, layers: [{ ...layer }] }, 'fill')
  player.message({ type: 'dsh-set-cursor', x: 0.25, y: 0.2, active: true })
  player.frame(100)
  assert.deepEqual(player.errors, [])
  const cursor = player.uniforms.find(u => u.name === 'u_cursorUV')
  assert.ok(Math.abs(cursor.values[1] - 0.2) < 1e-6, 'top-down pointer must remain top-down in texture UVs')
})

test('render loop keeps a single pending rAF callback (no exponential rescheduling)', async () => {
  // renderFrame must not request the next frame itself: render() owns the
  // loop. With duplicate scheduling the queue doubles every frame (2^n),
  // saturating the GPU within half a second.
  const player = await startPlayer({ width: 1000, height: 600, layers: [{ ...layer }] })
  for (let i = 0; i < 8; i++) player.frame(1000 + i * 40)
  assert.equal(player.pending(), 1, 'each executed callback schedules exactly one next frame')
  assert.deepEqual(player.errors, [])
})

test('144 Hz host produces at most 30 wallpaper draws per second', async () => {
  const player = await startPlayer({ width: 1000, height: 600, layers: [{ ...layer }] })
  for (let i = 0; i < 144; i++) {
    player.tick(i * 1000 / 144)
    assert.equal(player.pending(), 1)
  }
  assert.ok(player.draws.length <= 30)
  assert.ok(player.draws.length >= 24)
  assert.equal(player.stats().fbos, 0, 'no reflection means no offscreen framebuffer')
  assert.ok(player.stats().uniformLookups < 50, 'uniform locations are cached across frames')
})

test('pause/resume bursts cannot multiply pending work; context loss and disposal cancel it', async () => {
  const player = await startPlayer({ width: 1000, height: 600, layers: [{ ...layer }] })
  player.frame(0)
  for (let i = 0; i < 100; i++) {
    player.message({ type: 'dsh-set-pause', paused: true })
    assert.equal(player.pending(), 0)
    player.message({ type: 'dsh-set-pause', paused: false })
    assert.equal(player.pending(), 1)
  }
  player.event('webglcontextlost')
  assert.equal(player.pending(), 0)
  player.message({ type: 'dsh-set-pause', paused: false })
  assert.equal(player.pending(), 0, 'context loss does not poll')
  player.event('webglcontextrestored')
  assert.equal(player.messages.at(-1).type, 'dsh-scene-needs-reload')
  player.window.__hermesSceneDispose()
  player.window.__hermesSceneDispose()
  assert.equal(player.stats().loseCalls, 1)
})

test('video reused across layers/uploads plays once and copies each decoded frame once', async () => {
  const videoLayer = { ...layer, xrayBlendUrl: null, texUrl: null, videoUrl: 'movie.mp4' }
  const player = await startPlayer({ width: 1000, height: 600, layers: [videoLayer, { ...videoLayer }] })
  player.frame(0); player.frame(40)
  assert.equal(player.videos.length, 1)
  assert.equal(player.videos[0].plays, 1)
  assert.equal(player.stats().uploads, 1)
  player.videos[0].currentTime = 1
  player.frame(80)
  assert.equal(player.stats().uploads, 2)
  assert.equal(player.stats().reallocations, 1, 'later decoded frames update the existing allocation')
  player.event('webglcontextlost')
  player.message({ type: 'dsh-set-pause', paused: false })
  assert.equal(player.videos[0].plays, 1, 'context-lost renderer must not restart decoders')
  player.message({ type: 'dsh-set-pause', paused: true })
  assert.equal(player.pending(), 0)
  player.window.__hermesSceneDispose()
  assert.equal(player.videos[0].src, '')
  assert.deepEqual(player.errors, [])
})

test('native video-frame notifications avoid uploading when only media time advances', async () => {
  const player = await startPlayer({ width: 1000, height: 600, layers: [{ x: 500, y: 300, w: 1000, h: 600, videoUrl: 'video.mp4' }] }, 'cover', script, true)
  player.frame(0)
  const video = player.videos[0]
  video.currentTime = 1
  player.frame(40)
  assert.equal(player.stats().uploads, 1, 'media clock changes are not new decoded frames')
  const callback = [...video.videoCallbacks.values()][0]; video.videoCallbacks.clear()
  callback(50, { presentedFrames: 2 })
  player.frame(80)
  assert.equal(player.stats().uploads, 2)
  assert.equal(player.stats().reallocations, 1)
  assert.equal(video.videoCallbacks.size, 1)
  player.window.__hermesSceneDispose()
  assert.equal(video.videoCallbacks.size, 0)
})

test('simple scenes compile only the basic shader program', async () => {
  const player = await startPlayer({ width: 1000, height: 600, layers: [{ x: 500, y: 300, w: 1000, h: 600, texUrl: 'base.png' }] })
  assert.equal(player.shaderSources.length, 0, 'nothing compiles before the scene is drawn')
  player.frame(0)
  assert.equal(player.shaderSources.length, 2, 'one vertex and one fragment shader')
  player.frame(40)
  assert.equal(player.shaderSources.length, 2, 'programs stay cached')
})

test('cursor hide fades and recovers, and xray stops revealing when the pointer leaves', async () => {
  const player = await startPlayer({ width: 1000, height: 600, layers: [{ ...layer, cursorHide: true }] })
  player.message({ type: 'dsh-set-cursor', x: 0.5, y: 0.5, active: true })
  for (let i = 1; i <= 20; i++) player.frame(i * 40)
  assert.ok(player.uniforms.filter(u => u.name === 'u_alpha').at(-1).values[0] < 0.01)
  player.message({ type: 'dsh-set-cursor', active: false })
  for (let i = 21; i <= 40; i++) player.frame(i * 40)
  assert.ok(player.uniforms.filter(u => u.name === 'u_alpha').at(-1).values[0] > 0.99)
  assert.equal(player.uniforms.filter(u => u.name === 'u_cursorOn').at(-1).values[0], 0)
})

test('legacy ripple cache fields cannot activate a ripple GPU pass', async () => {
  const player = await startPlayer({ width: 1000, height: 600, layers: [{ ...layer, cursorRipple: true, cursorRippleEffect: { enabled: true } }] })
  player.message({ type: 'dsh-set-cursor', x: 0.5, y: 0.5, active: true })
  player.frame(0)
  assert.equal(player.stats().fbos, 0)
  assert.equal(player.draws.length, 1)
  assert.doesNotMatch(script, /fsRipple|progRipple|cursorRipples|cursorRippleEffect/)
})

test('draw failure stops all queued work and notifies the host once', async () => {
  const player = await startPlayer({ width: 1000, height: 600, layers: [{ ...layer }] })
  player.failDraw()
  player.frame(0)
  assert.equal(player.pending(), 0)
  assert.equal(player.messages.filter(msg => msg.type === 'dsh-scene-failed').length, 1)
  player.message({ type: 'dsh-set-pause', paused: false })
  assert.equal(player.pending(), 0, 'resume cannot revive a failed renderer')
})

test('large HiDPI viewport keeps the backing store within 2560 pixels per edge', async () => {
  const player = await startPlayer({ width: 1000, height: 600, layers: [{ ...layer }] })
  Object.assign(player.window, { innerWidth: 7680, innerHeight: 4320, devicePixelRatio: 4 })
  player.frame(0)
  assert.equal(player.canvas.width, 2560)
  assert.equal(player.canvas.height, 1440)
})

// Opt-in safe reproduction: execute the old installed renderer with a virtual
// frame queue and a GL recorder, never on the user's GPU.
test('old installed renderer duplicates frame requests on every virtual vsync', { skip: !process.env.HERMES_OLD_PLUGIN }, async () => {
  const old = fs.readFileSync(process.env.HERMES_OLD_PLUGIN, 'utf8')
  const start = old.indexOf('const WE_SCENE_PLAYER_HTML =')
  const end = old.indexOf('const WE_SHIM_JS =', start)
  const html = vm.runInNewContext(old.slice(start, end) + '\nWE_SCENE_PLAYER_HTML')
  const oldScript = html.match(/<script>([\s\S]*?)<\/script>/)[1]
  const player = await startPlayer({ width: 1000, height: 600, layers: [] }, 'cover', oldScript)
  const queue = []
  for (let i = 0; i < 8; i++) { player.tick(i * 40); queue.push(player.pending()) }
  assert.deepEqual(queue, [2, 4, 8, 16, 32, 64, 128, 256])
  console.log('Old installed virtual callback queue:', queue.join(' -> '))
})

test('shake effect layer draws with progShake uniforms without runtime exceptions', async () => {
  const shakeLayer = {
    name: 'Eye_Front',
    texUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
    x: 500, y: 300, w: 200, h: 100, alpha: 1, angle: 0,
    shakeEffect: {
      speed: 1.0,
      strength: 0.5,
      friction: [1, 1.2],
      bounds: [0.977, 0.997],
      direction: 1,
      flowMaskUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
      opacityMaskUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
    },
  }
  const player = await startPlayer({ width: 1000, height: 600, layers: [shakeLayer] })
  player.frame(100)
  assert.deepEqual(player.errors, [])
  const speed = player.uniforms.find(u => u.name === 'u_speed')
  assert.ok(speed, 'u_speed uniform bound')
  assert.equal(speed.values[0], 1.0)
  const strength = player.uniforms.find(u => u.name === 'u_strength')
  assert.ok(strength, 'u_strength uniform bound')
  assert.equal(strength.values[0], 0.5)
})
