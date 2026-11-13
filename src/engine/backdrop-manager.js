import { liveSceneUrl, liveWebUrl, openLiveProject, resolveBackendOrigin } from './scene-live.js'

const ROOT_ID = 'hermes-skins-backdrop-root'
const LIVE_READY_CLASS = 'hs-backdrop-live-ready'
const LIVE_FADE_MS = 1200
const LIVE_FIRST_FRAME_MS = 30000
const TRANSITION_BASE_MS = {
  cut: 0, fade: 1800, push: 700, wipe: 700, iris: 800, zoom: 900, bars: 800
}
const TRANSITION_SPEED_FACTOR = { fast: 0.6, normal: 1, slow: 1.6 }
const BARS_TEETH = 9

const clamp = (value, min, max, fallback) => {
  const number = Number(value)
  return Number.isFinite(number) ? Math.min(max, Math.max(min, number)) : fallback
}

function barsPolygon(direction, progress) {
  const horizontal = direction === 'left' || direction === 'right'
  const fromEnd = direction === 'left' || direction === 'up'
  const outer = fromEnd ? 1 : 0
  const inward = fromEnd ? -1 : 1
  const period = 1 / BARS_TEETH
  const depth = clamp(progress, 0, 1, 0)
  const spine = Math.min(0.004, depth)
  const slat = depth / BARS_TEETH
  const point = (a, t) => horizontal ? [outer + inward * a, t] : [t, outer + inward * a]
  const points = [point(0, 0)]
  for (let index = 0; index < BARS_TEETH; index += 1) {
    const start = index * period
    points.push(point(depth, start))
    points.push(point(depth, start + slat))
    if (index < BARS_TEETH - 1) {
      points.push(point(spine, start + slat))
      points.push(point(spine, start + period))
    }
  }
  points.push(point(spine, 1))
  points.push(point(0, 1))
  return `polygon(${points.map(([x, y]) => `${(x * 100).toFixed(2)}% ${(y * 100).toFixed(2)}%`).join(', ')})`
}

function wipeInset(direction) {
  return {
    left: 'inset(0 100% 0 0)',
    right: 'inset(0 0 0 100%)',
    up: 'inset(100% 0 0 0)',
    down: 'inset(0 0 100% 0)'
  }[direction] || 'inset(0 100% 0 0)'
}

function pushOffset(direction, incoming = true) {
  const sign = incoming ? 1 : -1
  return {
    left: `translate3d(${100 * sign}%, 0, 0)`,
    right: `translate3d(${-100 * sign}%, 0, 0)`,
    up: `translate3d(0, ${100 * sign}%, 0)`,
    down: `translate3d(0, ${-100 * sign}%, 0)`
  }[direction] || `translate3d(${100 * sign}%, 0, 0)`
}

export function normalizeMediaSource(input, type = 'image') {
  if (typeof input !== 'string' || !input.trim()) return null
  const source = input.trim()
  if (/^https?:\/\//i.test(source)) return source
  if (type === 'image' && /^data:image\/(svg\+xml|png|jpeg|webp|gif);/i.test(source)) return source
  if (type === 'video' && /^hermes-media:\/\/stream\/[^\s?#]+$/i.test(source)) return source
  if (/^file:\/\/\//i.test(source)) return source
  if (/^[a-zA-Z]:[\\/]/.test(source)) {
    const normalized = source.replace(/\\/g, '/')
    if (type === 'video') return `hermes-media://stream/${encodeURIComponent(source)}`
    return `file:///${normalized.split('/').map((part, index) => index === 0 ? part : encodeURIComponent(part)).join('/')}`
  }
  return null
}

const isScenePath = value => typeof value === 'string' && /^[a-zA-Z]:[\\/]/.test(value)

function projectDirectory(value) {
  if (typeof value !== 'string' || !value) return null
  let path = value
  if (/^file:\/\//i.test(path)) {
    try {
      path = decodeURIComponent(new URL(path).pathname)
      if (/^\/[A-Za-z]:/.test(path)) path = path.slice(1)
    } catch {
      return null
    }
  }
  path = path.replace(/\//g, '\\')
  if (/\.(json|html?)$/i.test(path)) path = path.replace(/\\[^\\]+$/, '')
  return /^[A-Za-z]:\\/.test(path) ? path : null
}

/**
 * Wallpaper backdrop with a WebWallGL live renderer.
 *
 * Layer ownership is exclusive to this class. A switch builds the next layer
 * beside the current one, fades it in, then retires the old iframe/video; the
 * app never sees a transparent gap that would make glass lose its backdrop.
 */
export class BackdropManager {
  constructor({ prepareScene = null, openScene = null } = {}) {
    this.prepareScene = prepareScene
    this.openScene = openScene
    this.root = null
    this.layers = null
    this.scrim = null
    this.layer = null
    this.previousLayer = null
    this.sceneIframe = null
    this.sceneProject = null
    this.sceneType = null
    this.liveReady = false
    this.liveFailed = false
    this.liveStarting = false
    this.liveWatchdog = null
    this.liveStats = null
    this.currentKey = null
    this.currentOptions = null
    this.failedKeys = new Set()
    this.onVisibilityChange = null
    this.onLiveState = null
    this.onMediaEnd = null
    this.pointerFrame = null
    this.pendingPointer = null
    this.pointerInitialized = false
    this.cursorForwardInit = false
    this.pauseReasons = new Set()
    this.battery = null
    this.batteryPending = false
    this.lastMaskColor = null
    this.mediaSnapshot = null
    this.handleSceneMessage = event => {
      if (!this.sceneIframe || event.source !== this.sceneIframe.contentWindow) return
      const data = event.data
      if (!data || data.source !== 'hermes-skins-scene') return
      if (data.type === 'ready') {
        this.liveReady = true
        this.liveFailed = false
        if (this.liveWatchdog !== null) clearTimeout(this.liveWatchdog)
        this.liveWatchdog = null
        this.layer?.classList.add(LIVE_READY_CLASS)
        this.applyLiveOptions(true)
        this.pushMediaSnapshot()
        this.onLiveState?.({ ready: true, type: this.sceneType })
      } else if (data.type === 'error') {
        this.liveFailed = true
        if (this.liveWatchdog !== null) clearTimeout(this.liveWatchdog)
        this.liveWatchdog = null
        this.onLiveState?.({ ready: false, error: data.message || 'Scene renderer failed' })
      } else if (data.type === 'stats') {
        this.liveStats = data
      }
    }
    this.handleVisibility = () => {
      if (document.hidden) this.pointerLeave()
      this.syncPlayback()
      this.onVisibilityChange?.()
      if (!document.hidden) this.resumeDeferredLive()
    }
    this.handleFocus = () => {
      this.syncPlayback()
      this.onVisibilityChange?.()
      this.resumeDeferredLive()
    }
    this.handleBlur = () => {
      this.pointerLeave()
      this.syncPlayback()
      this.onVisibilityChange?.()
    }
    this.handleBattery = () => {
      this.syncPlayback()
      this.onVisibilityChange?.()
    }
  }

  ensureElements() {
    if (typeof document === 'undefined' || !document.body) return
    if (this.root?.isConnected) return
    this.root = document.getElementById(ROOT_ID) || document.createElement('div')
    this.root.id = ROOT_ID
    this.root.setAttribute('aria-hidden', 'true')
    this.root.style.cssText = 'position:fixed;inset:0;z-index:0;pointer-events:none;overflow:hidden;contain:strict;'
    this.layers = document.createElement('div')
    this.layers.style.cssText = 'position:absolute;inset:0;overflow:hidden;'
    this.scrim = document.createElement('div')
    this.scrim.style.cssText = 'position:absolute;inset:0;pointer-events:none;'
    this.root.replaceChildren(this.layers, this.scrim)
    document.body.prepend(this.root)
    this.ensureListeners()
  }

  ensureListeners() {
    if (this.pointerInitialized || typeof window === 'undefined') return
    this.pointerInitialized = true
    this.cursorForwardInit = true
    this.onPointerMove = event => {
      if (!this.sceneIframe || this.liveFailed || document.hidden) return
      this.pendingPointer = {
        x: event.clientX, y: event.clientY, buttons: event.buttons || 0,
        mods: { shift: event.shiftKey, ctrl: event.ctrlKey, alt: event.altKey, meta: event.metaKey }
      }
      if (this.pointerFrame !== null) return
      this.pointerFrame = window.requestAnimationFrame(() => {
        this.pointerFrame = null
        const sample = this.pendingPointer
        this.pendingPointer = null
        if (sample) this.forwardPointer(sample, true)
      })
    }
    this.onPointerDown = event => {
      if (!this.sceneIframe || this.liveFailed) return
      this.forwardPointer({
        x: event.clientX, y: event.clientY, buttons: event.buttons || 0,
        mods: { shift: event.shiftKey, ctrl: event.ctrlKey, alt: event.altKey, meta: event.metaKey }
      }, true)
    }
    this.onPointerUp = this.onPointerDown
    this.onPointerLeave = () => this.pointerLeave()
    this.onWheel = event => {
      if (!this.sceneIframe || this.liveFailed) return
      this.postScene({ type: 'wheel', dx: event.deltaX, dy: event.deltaY, mode: event.deltaMode,
        mods: { shift: event.shiftKey, ctrl: event.ctrlKey, alt: event.altKey, meta: event.metaKey } })
    }
    window.addEventListener('pointermove', this.onPointerMove, { passive: true, capture: true })
    window.addEventListener('pointerdown', this.onPointerDown, { passive: true, capture: true })
    window.addEventListener('pointerup', this.onPointerUp, { passive: true, capture: true })
    window.addEventListener('pointerleave', this.onPointerLeave)
    document.addEventListener('pointerleave', this.onPointerLeave)
    window.addEventListener('blur', this.handleBlur)
    window.addEventListener('focus', this.handleFocus)
    window.addEventListener('wheel', this.onWheel, { passive: true, capture: true })
    document.addEventListener('visibilitychange', this.handleVisibility)
    window.addEventListener('message', this.handleSceneMessage)
    if (typeof navigator !== 'undefined' && navigator.getBattery) {
      this.batteryPending = true
      navigator.getBattery().then(battery => {
        this.battery = battery
        battery.addEventListener('chargingchange', this.handleBattery)
        battery.addEventListener('levelchange', this.handleBattery)
        this.batteryPending = false
        this.syncPlayback()
      }).catch(() => { this.batteryPending = false })
    }
  }

  /** Compatibility alias for the pre-WebWallGL backdrop tests. */
  ensureCursorForwarding() {
    this.ensureListeners()
  }

  /** Compatibility shim: forward a normalized pointer sample. */
  forwardCursor(x, y, active = true) {
    this.postScene({ type: 'pointer', u: x, v: y, buttons: active ? 1 : 0, mods: {} })
  }

  postScene(message) {
    try {
      this.sceneIframe?.contentWindow?.postMessage({ source: 'hermes-skins-host', ...message }, '*')
    } catch { /* The frame may still be loading. */ }
  }

  forwardPointer(sample, active) {
    const rect = this.sceneIframe?.getBoundingClientRect?.()
    if (!rect?.width || !rect?.height) return
    const u = Math.min(1, Math.max(0, (sample.x - rect.left) / rect.width))
    const v = Math.min(1, Math.max(0, (sample.y - rect.top) / rect.height))
    const inside = active && sample.x >= rect.left && sample.x <= rect.right &&
      sample.y >= rect.top && sample.y <= rect.bottom
    this.postScene({ type: 'pointer', u, v, buttons: inside ? sample.buttons : 0, mods: sample.mods })
  }

  pointerLeave() {
    if (this.pointerFrame !== null) window.cancelAnimationFrame(this.pointerFrame)
    this.pointerFrame = null
    this.pendingPointer = null
    this.postScene({ type: 'pointer-leave' })
  }

  setMediaSnapshot(media) {
    this.mediaSnapshot = media && typeof media === 'object' ? media : null
    this.pushMediaSnapshot()
  }

  pushMediaSnapshot() {
    if (!this.sceneIframe) return
    const media = this.mediaSnapshot
    if (!media?.ok) {
      this.postScene({ type: 'command', command: 'setMedia', args: [null] })
      return
    }
    const status = String(media.playing || '').toLowerCase()
    this.postScene({
      type: 'command',
      command: 'setMedia',
      args: [{
        hasMedia: true,
        title: media.title || '',
        artist: media.artist || '',
        album: media.album || '',
        playing: status === 'playing',
        state: status === 'playing' ? 1 : status === 'paused' ? 2 : 0,
        position: Number(media.position) || 0,
        duration: Number(media.duration) || 0
      }]
    })
  }

  update(options) {
    const {
      enabled, type = 'image', src, sceneDir = null, sceneManifest = null,
      sceneFrame = null, webPreview = null, blur = 0, occlusion = 35,
      isDark = true, mode = 'live', fit = 'cover', opacity = 100,
      pauseOnHidden = true, pauseOnBlur = false, pauseOnBattery = false,
      sound = false, volume = 100, playbackRate = 1,
      sceneLive = true, sceneLiveFps = 30, sceneAutoQuality = true,
      sceneRenderDpr = 0, sceneVideoTexScale = 0,
      slides = null, slideIntervalMs = null,
      transition = 'fade', transitionDir = 'left', transitionSpeed = 'normal',
      brightness = 100, contrast = 100, saturate = 100, flip = false,
      layerPositionX = 50, layerPositionY = 50, layerScale = 100,
      loop = true, userProps = null
    } = options

    const source = type === 'scene'
      ? (isScenePath(sceneDir) ? sceneDir : (isScenePath(sceneManifest) ? sceneManifest : (isScenePath(src) ? src : null)))
      : (enabled ? normalizeMediaSource(src, type) : null)
    if (!enabled || !source) {
      this.hide()
      return false
    }
    const key = `${type}:${source}:${mode === 'frame' ? 'frame' : 'live'}`
    if (this.failedKeys.has(key)) {
      this.hide()
      return false
    }
    this.ensureElements()
    if (!this.root) return false
    this.root.style.display = 'block'
    this.currentOptions = {
      type, src: source, sceneDir, sceneManifest, sceneFrame, webPreview,
      blur, occlusion, isDark, mode, fit, opacity, pauseOnHidden, pauseOnBlur,
      pauseOnBattery, sound, volume, playbackRate, sceneLive,
      sceneLiveFps, sceneAutoQuality, sceneRenderDpr, sceneVideoTexScale,
      slides, slideIntervalMs,
      transition, transitionDir, transitionSpeed,
      brightness, contrast, saturate, flip,
      layerPositionX, layerPositionY, layerScale, loop
      , userProps
    }
    this.updateScrim(isDark, occlusion)
    if (key === this.currentKey && this.layer) {
      this.applyOptionsToLayer(this.layer)
      this.applyLiveOptions(false)
      this.syncPlayback()
      return true
    }
    this.currentKey = key
    this.buildNextLayer(this.currentOptions, key)
    return true
  }

  updateScrim(isDark, occlusion) {
    const alpha = clamp(occlusion, 0, 100, 35) / 100
    const color = isDark ? `rgba(0,0,0,${alpha})` : `rgba(255,255,255,${alpha})`
    if (this.lastMaskColor !== color) this.scrim.style.backgroundColor = color
    this.lastMaskColor = color
  }

  buildLayer() {
    const layer = document.createElement('div')
    layer.className = 'hs-backdrop-layer'
    layer.style.cssText = 'position:absolute;inset:0;overflow:hidden;opacity:0;'
    const surface = document.createElement('div')
    surface.className = 'hs-backdrop-surface'
    surface.style.cssText = 'position:absolute;inset:0;transform-origin:center;'
    const poster = document.createElement('div')
    poster.className = 'hs-backdrop-poster'
    poster.style.cssText = 'position:absolute;inset:0;background-size:cover;background-position:center;background-repeat:no-repeat;'
    const media = document.createElement('div')
    media.className = 'hs-backdrop-media'
    media.style.cssText = 'position:absolute;inset:0;overflow:hidden;'
    surface.appendChild(poster)
    surface.appendChild(media)
    layer.appendChild(surface)
    layer._surface = surface
    layer._poster = poster
    layer._media = media
    return layer
  }

  applyOptionsToLayer(layer) {
    const options = this.currentOptions
    const blur = clamp(options.blur, 0, 60, 0)
    const surface = layer._surface
    const media = layer._media
    const brightness = clamp(options.brightness, 40, 160, 100)
    const contrast = clamp(options.contrast, 40, 200, 100)
    const saturate = clamp(options.saturate, 0, 200, 100)
    const filters = []
    if (blur > 0) filters.push(`blur(${blur}px)`)
    if (brightness !== 100) filters.push(`brightness(${brightness}%)`)
    if (contrast !== 100) filters.push(`contrast(${contrast}%)`)
    if (saturate !== 100) filters.push(`saturate(${saturate}%)`)
    surface.style.filter = filters.length ? filters.join(' ') : 'none'
    surface.style.inset = blur > 0 ? `-${blur + 8}px` : '0'
    const x = (50 - clamp(options.layerPositionX, 0, 100, 50)) / 2
    const y = (50 - clamp(options.layerPositionY, 0, 100, 50)) / 2
    const scale = clamp(options.layerScale, 50, 150, 100) / 100
    const flip = options.flip ? ' scaleX(-1)' : ''
    layer.style.transform = 'none'
    surface.style.transform = `translate3d(${x.toFixed(2)}%, ${y.toFixed(2)}%, 0) scale(${scale.toFixed(3)})${flip}`
    media.style.opacity = String(clamp(options.opacity, 0, 100, 100) / 100)
    layer._poster.style.opacity = String(clamp(options.opacity, 0, 100, 100) / 100)
    const images = media.querySelectorAll
      ? [...media.querySelectorAll('img')]
      : [media.querySelector('img')].filter(Boolean)
    const objectFit = options.fit === 'center' ? 'none' : options.fit
    images.forEach(image => {
      image.style.objectFit = objectFit
      image.style.objectPosition = 'center'
    })
    const video = media.querySelector('video')
    if (video) {
      video.style.objectFit = objectFit
      video.style.objectPosition = 'center'
      video.muted = !options.sound
      video.volume = clamp(options.volume, 0, 100, 100) / 100
      video.playbackRate = clamp(options.playbackRate, 0.25, 2, 1)
      video.loop = options.loop !== false
    }
  }

  buildNextLayer(options, key) {
    const next = this.buildLayer()
    this.applyOptionsToLayer(next)
    this.applyPoster(next, options)
    this.appendContent(next, options, key)
    this.transitionTo(next, options, key)
  }

  applyPoster(layer, options) {
    const path = options.type === 'scene' ? options.sceneFrame : options.webPreview
    if (!path) return
    const bridge = typeof window !== 'undefined' ? window.hermesDesktop : null
    if (!bridge?.readFileDataUrl) return
    const image = document.createElement('img')
    image.alt = ''
    image.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block;'
    image.onerror = () => image.remove()
    bridge.readFileDataUrl(path).then(data => {
      if (typeof data === 'string' && data.startsWith('data:image/')) image.src = data
    }).catch(() => image.remove())
    layer._poster.appendChild(image)
  }

  appendContent(layer, options, key) {
    if (options.type === 'scene' || options.type === 'web') {
      if (options.mode !== 'frame' && options.sceneLive) {
        if (document.hidden) layer.dataset.liveState = 'deferred'
        else void this.showLive(layer, options, key)
      }
      return
    }
    if (options.type === 'video') {
      this.showVideo(layer, options, key)
      return
    }
    this.showImage(layer, options, key)
  }

  showImage(layer, options, key) {
    if (Array.isArray(options.slides) && options.slides.length > 1) {
      const wrap = document.createElement('div')
      wrap.style.cssText = 'position:absolute;inset:0;overflow:hidden;'
      const first = document.createElement('img')
      const second = document.createElement('img')
      for (const image of [first, second]) {
        image.alt = ''
        const fit = options.fit === 'center' ? 'none' : options.fit
        image.style.cssText = `position:absolute;inset:0;width:100%;height:100%;object-fit:${fit};object-position:center;display:block;transition:opacity 800ms ease;`
        wrap.appendChild(image)
      }
      first.src = normalizeMediaSource(options.slides[0], 'image') || options.slides[0]
      first.style.opacity = '1'
      second.style.opacity = '0'
      layer._media.appendChild(wrap)
      let index = 0
      const interval = clamp(options.slideIntervalMs, 1000, 24 * 60 * 60 * 1000, 60_000)
      layer._slideTimer = setInterval(() => {
        if (this.currentKey !== key) return
        index += 1
        const incoming = index % 2 === 0 ? first : second
        const outgoing = index % 2 === 0 ? second : first
        incoming.onload = () => {
          if (this.currentKey !== key) return
          incoming.style.opacity = '1'
          outgoing.style.opacity = '0'
        }
        incoming.src = normalizeMediaSource(options.slides[index % options.slides.length], 'image') ||
          options.slides[index % options.slides.length]
      }, interval)
      return
    }
    const image = document.createElement('img')
    image.alt = ''
    const fit = options.fit === 'center' ? 'none' : options.fit
    image.style.cssText = `width:100%;height:100%;object-fit:${fit};object-position:center;display:block;`
    let triedBridge = false
    image.onerror = async () => {
      const local = /^[a-zA-Z]:[\\/]/.test(options.src) || /^file:\/\/\//i.test(options.src)
      const bridge = typeof window !== 'undefined' ? window.hermesDesktop : null
      if (!triedBridge && local && bridge?.readFileDataUrl) {
        triedBridge = true
        try {
          const data = await bridge.readFileDataUrl(options.src)
          if (this.currentKey === key && typeof data === 'string' && data.startsWith('data:image/')) {
            image.src = data
            return
          }
        } catch { /* Invalid or oversized local image. */ }
      }
      this.fail(key)
    }
    image.src = options.src
    layer._media.appendChild(image)
  }

  showVideo(layer, options, key) {
    const video = document.createElement('video')
    video.autoplay = true
    video.loop = options.loop !== false
    video.playsInline = true
    video.preload = 'auto'
    video.muted = !options.sound
    video.volume = clamp(options.volume, 0, 100, 100) / 100
    video.playbackRate = clamp(options.playbackRate, 0.25, 2, 1)
    const fit = options.fit === 'center' ? 'none' : options.fit
    video.style.cssText = `width:100%;height:100%;object-fit:${fit};object-position:center;display:block;`
    video.onerror = () => this.fail(key)
    video.onended = () => {
      if (this.currentKey === key && options.loop === false) this.onMediaEnd?.()
    }
    video.src = options.src
    layer._media.appendChild(video)
    if (options.mode === 'frame') {
      video.addEventListener('loadeddata', () => {
        if (this.currentKey !== key) return
        try {
          const canvas = document.createElement('canvas')
          const scale = Math.min(1, 1920 / Math.max(video.videoWidth, video.videoHeight))
          canvas.width = Math.max(1, Math.round(video.videoWidth * scale))
          canvas.height = Math.max(1, Math.round(video.videoHeight * scale))
          canvas.getContext('2d')?.drawImage(video, 0, 0, canvas.width, canvas.height)
          const image = document.createElement('img')
          image.src = canvas.toDataURL('image/jpeg', 0.9)
          image.style.cssText = `width:100%;height:100%;object-fit:${options.fit === 'center' ? 'none' : options.fit};object-position:center;display:block;`
          if (this.currentKey === key) layer._media.replaceChildren(image)
        } catch { /* Keep the live video if capture is blocked. */ }
        finally { video.pause() }
      }, { once: true })
    }
    void video.play().catch(error => {
      // Chromium rejects play() with AbortError when a hidden/occluded window
      // pauses background media to save power; that is not a broken wallpaper.
      if (error?.name === 'AbortError' || error?.name === 'NotAllowedError') return
      if (this.currentKey === key) this.fail(key)
    })
  }

  async showLive(layer, options, key) {
    if (document.hidden) {
      layer.dataset.liveState = 'deferred'
      return
    }
    if (this.liveStarting) return
    this.liveStarting = true
    layer.dataset.liveState = 'starting'
    if (typeof this.openScene !== 'function') {
      this.liveFailed = true
      layer.dataset.liveState = 'error:no-backend'
      this.liveStarting = false
      return
    }
    this.liveReady = false
    this.liveFailed = false
    try {
      const project = await openLiveProject(this.openScene, {
        dir: options.sceneDir || projectDirectory(options.src),
        manifestPath: options.sceneManifest
      })
      if (this.currentKey !== key) return
      layer.dataset.liveState = 'opened'
      this.sceneProject = project
      this.sceneType = options.type
      const origin = project.mediaOrigin || await resolveBackendOrigin()
      const muted = !options.sound || clamp(options.volume, 0, 100, 100) <= 0
      const url = options.type === 'scene'
        ? liveSceneUrl(project, {
            origin,
            fit: options.fit, fps: options.sceneLiveFps, muted,
            autoQuality: options.sceneAutoQuality, renderDpr: options.sceneRenderDpr,
            videoTexScale: options.sceneVideoTexScale
          })
        : liveWebUrl(project, project.file, {
            origin,
            fit: options.fit, fps: options.sceneLiveFps, muted,
            autoQuality: options.sceneAutoQuality
          })
      const frame = document.createElement('iframe')
      frame.setAttribute('sandbox', 'allow-scripts allow-same-origin')
      frame.setAttribute('allow', 'autoplay; fullscreen')
      frame.setAttribute('aria-hidden', 'true')
      frame.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;border:0;background:transparent;opacity:0;transition:opacity 1200ms ease;'
      frame.onload = () => {
        if (this.sceneIframe !== frame) return
        this.applyLiveOptions(true)
        this.syncPlayback()
      }
      this.sceneIframe = frame
      this.liveWatchdog = setTimeout(() => {
        this.liveWatchdog = null
        if (this.sceneIframe !== frame || this.liveReady) return
        this.liveFailed = true
        this.onLiveState?.({ ready: false, error: 'Scene renderer did not produce a frame in time' })
      }, LIVE_FIRST_FRAME_MS)
      frame.src = url
      layer._media.appendChild(frame)
      layer.dataset.liveState = 'framed'
    } catch (error) {
      this.liveFailed = true
      layer.dataset.liveState = `error:${String(error?.message || error).slice(0, 120)}`
      this.onLiveState?.({ ready: false, error: String(error?.message || error) })
    } finally {
      this.liveStarting = false
    }
  }

  resumeDeferredLive() {
    const options = this.currentOptions
    const layer = this.layer
    if (!options || !layer || !this.currentKey || document.hidden) return
    if (options.type !== 'scene' && options.type !== 'web') return
    if (!options.sceneLive || options.mode === 'frame' || this.sceneIframe) return
    if (layer.dataset.liveState !== 'deferred' && layer.dataset.liveState !== 'idle') return
    void this.showLive(layer, options, this.currentKey)
  }

  applyLiveOptions(force = false) {
    if (!this.sceneIframe || (!this.liveReady && !force)) return
    const options = this.currentOptions
    const muted = !options.sound || clamp(options.volume, 0, 100, 100) <= 0
    this.postScene({ type: 'command', command: 'setFit', args: [options.fit] })
    this.postScene({ type: 'command', command: 'setSceneFps', args: [options.sceneLiveFps] })
    this.postScene({ type: 'command', command: 'setVolume', args: [muted ? 0 : clamp(options.volume, 0, 100, 100) / 100] })
    this.postScene({ type: 'command', command: 'setRenderDpr', args: [options.sceneRenderDpr] })
    if (!options.sceneAutoQuality) this.postScene({ type: 'command', command: 'setQuality', args: [{ autoQuality: false }] })
    if (options.userProps && typeof options.userProps === 'object') {
      this.postScene({ type: 'command', command: 'updateWebProps', args: [options.userProps] })
    }
    if (this.liveReady) {
      this.sceneIframe.style.opacity = String(clamp(options.opacity, 0, 100, 100) / 100)
      this.layer?.classList.add(LIVE_READY_CLASS)
      const poster = this.layer?._poster
      if (poster) {
        poster.style.transition = `opacity 300ms ease ${LIVE_FADE_MS}ms`
        poster.style.opacity = '0'
      }
    }
    this.pushMediaSnapshot()
  }

  syncPlayback() {
    if (typeof document === 'undefined') return
    const options = this.currentOptions
    if (!options) return
    const hiddenPaused = options.pauseOnHidden && document.hidden
    const blurPaused = options.pauseOnBlur && typeof document.hasFocus === 'function' && !document.hasFocus()
    const batteryPaused = options.pauseOnBattery && this.battery && !this.battery.charging
    const paused = Boolean(hiddenPaused || blurPaused || batteryPaused)
    const video = this.layer?._media?.querySelector('video')
    if (video) {
      if (paused) video.pause()
      else void video.play().catch(() => {})
    }
    if (this.sceneIframe) {
      this.postScene({ type: 'command', command: paused ? 'pause' : 'resume', args: [] })
    }
    this.pauseReasons.clear()
    if (hiddenPaused) this.pauseReasons.add('hidden')
    if (blurPaused) this.pauseReasons.add('blur')
    if (batteryPaused) this.pauseReasons.add('battery')
  }

  transitionTo(next, options, key) {
    const transition = options.transition || 'fade'
    const duration = Math.round((TRANSITION_BASE_MS[transition] || 700) *
      (TRANSITION_SPEED_FACTOR[options.transitionSpeed] || 1))
    const reduced = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches
    const ms = reduced || transition === 'cut' ? 0 : clamp(duration, 0, 2000, 700)
    const old = this.layer
    this.layer = next
    this.sceneIframe = next._media.querySelector('iframe') || null
    this.layers.appendChild(next)
    if (!old) {
      next.style.transition = 'none'
      next.style.opacity = '1'
      this.applyOptionsToLayer(next)
      this.syncPlayback()
      return
    }
    this.previousLayer = old
    const ease = 'cubic-bezier(0.22, 0.61, 0.36, 1)'
    if (ms === 0) {
      this.retireLayer(old)
      next.style.opacity = '1'
      this.previousLayer = null
      this.applyOptionsToLayer(next)
      this.syncPlayback()
      return
    }
    const direction = options.transitionDir || 'left'
    let incoming = { opacity: '0' }
    let outgoing = {}
    if (transition === 'fade') incoming = { opacity: '0' }
    else if (transition === 'push') {
      incoming = { transform: pushOffset(direction, true) }
      outgoing = { transform: pushOffset(direction, false) }
    } else if (transition === 'wipe') {
      incoming = { clipPath: wipeInset(direction) }
      outgoing = {}
    } else if (transition === 'iris') {
      incoming = { clipPath: 'circle(0% at 50% 50%)' }
      outgoing = {}
    } else if (transition === 'zoom') {
      incoming = { transform: 'scale(1.06)', opacity: '0' }
      outgoing = { transform: 'scale(1.04)' }
    } else if (transition === 'bars') {
      incoming = { clipPath: barsPolygon(direction, 0) }
      outgoing = {}
    }
    next.style.transition = 'none'
    next.style.willChange = 'opacity, transform'
    Object.assign(next.style, incoming)
    old.style.transition = 'none'
    old.style.willChange = 'opacity, transform'
    old.style.opacity = '1'
    old.style.transform = 'none'
    requestAnimationFrame(() => {
      next.style.transition = `opacity ${ms}ms ${ease}, transform ${ms}ms ${ease}, clip-path ${ms}ms ${ease}`
      old.style.transition = `opacity ${ms}ms ${ease}, transform ${ms}ms ${ease}, clip-path ${ms}ms ${ease}`
      if (outgoing.opacity !== undefined) old.style.opacity = outgoing.opacity
      if (outgoing.transform !== undefined) old.style.transform = outgoing.transform
      if (outgoing.clipPath !== undefined) old.style.clipPath = outgoing.clipPath
      next.style.opacity = '1'
      next.style.transform = 'none'
      next.style.clipPath = transition === 'iris' ? 'circle(75% at 50% 50%)'
        : transition === 'bars' ? barsPolygon(direction, 1) : 'inset(0)'
      this.applyOptionsToLayer(next)
      this.syncPlayback()
    })
    setTimeout(() => {
      if (this.previousLayer === old) this.previousLayer = null
      next.style.willChange = ''
      if (this.currentKey === key) {
        old.style.willChange = ''
        this.retireLayer(old)
      }
    }, ms + 60)
  }

  fail(key) {
    if (this.currentKey !== key) return
    this.failedKeys.add(key)
    this.hide()
    this.onVisibilityChange?.()
  }

  hide() {
    if (this.root) this.root.style.display = 'none'
    this.releaseLayers()
    this.currentKey = null
    this.currentOptions = null
  }

  releaseLayers() {
    for (const layer of this.layers?.children || []) {
      this.retireLayer(layer)
    }
    this.layer = null
    this.previousLayer = null
    this.sceneIframe = null
    this.sceneProject = null
    this.liveReady = false
    this.liveFailed = false
    if (this.liveWatchdog !== null) clearTimeout(this.liveWatchdog)
    this.liveWatchdog = null
  }

  retireLayer(layer) {
    if (!layer) return
    const frame = layer._media?.querySelector('iframe')
    try { frame?.contentWindow?.postMessage({ source: 'hermes-skins-host', type: 'command', command: 'destroy', args: [] }, '*') } catch {}
    const video = layer._media?.querySelector('video')
    if (video) {
      video.pause()
      video.removeAttribute('src')
      video.load()
    }
    if (layer._slideTimer) {
      clearInterval(layer._slideTimer)
      layer._slideTimer = null
    }
    layer.remove()
  }

  /** Compatibility alias for callers that release the current media only. */
  releaseMedia() {
    this.pointerLeave()
    this.releaseLayers()
  }

  destroy() {
    this.pointerLeave()
    if (this.pointerInitialized) {
      window.removeEventListener('pointermove', this.onPointerMove, { capture: true })
      window.removeEventListener('pointerdown', this.onPointerDown, { capture: true })
      window.removeEventListener('pointerup', this.onPointerUp, { capture: true })
      window.removeEventListener('pointerleave', this.onPointerLeave)
      document.removeEventListener('pointerleave', this.onPointerLeave)
      window.removeEventListener('blur', this.handleBlur)
      window.removeEventListener('focus', this.handleFocus)
      window.removeEventListener('wheel', this.onWheel, { capture: true })
      document.removeEventListener('visibilitychange', this.handleVisibility)
      window.removeEventListener('message', this.handleSceneMessage)
      if (this.battery) {
        this.battery.removeEventListener('chargingchange', this.handleBattery)
        this.battery.removeEventListener('levelchange', this.handleBattery)
      }
      this.pointerInitialized = false
      this.cursorForwardInit = false
    }
    this.releaseLayers()
    this.root?.remove()
    this.root = null
    this.layers = null
    this.scrim = null
    this.currentKey = null
    this.currentOptions = null
    this.failedKeys.clear()
  }
}

export function isLiveWallpaperSupported() {
  if (typeof WebGL2RenderingContext === 'undefined') return false
  try {
    const canvas = document.createElement('canvas')
    return Boolean(canvas.getContext('webgl2'))
  } catch {
    return false
  }
}
