import { loadSceneManifest, scenePlayerHtml } from './scene-player.js'
import { loadWebWallpaper } from './web-player.js'

const ROOT_ID = 'hermes-skins-backdrop-root'

export function normalizeMediaSource(input, type = 'image') {
  if (typeof input !== 'string' || !input.trim()) return null
  const source = input.trim()
  if (/^https?:\/\//i.test(source)) return source
  if (type === 'image' && /^data:image\/(svg\+xml|png|jpeg|webp);/i.test(source)) return source
  if (type === 'video' && /^hermes-media:\/\/stream\/[^\s?#]+$/i.test(source)) return source
  if (/^file:\/\/\//i.test(source)) return source
  if (/^[a-zA-Z]:[\\/]/.test(source)) {
    const normalized = source.replace(/\\/g, '/')
    if (type === 'video') return `hermes-media://stream/${encodeURIComponent(source)}`
    return `file:///${normalized.split('/').map((part, index) => index === 0 ? part : encodeURIComponent(part)).join('/')}`
  }
  return null
}

/** Fixed backdrop sits behind the app shell and never receives input. */
export class BackdropManager {
  constructor({ prepareScene = null } = {}) {
    this.prepareScene = prepareScene
    this.root = null
    this.media = null
    this.mask = null
    this.currentKey = null
    this.failedKeys = new Set()
    this.onVisibilityChange = null
    this.sceneIframe = null
    this.sceneManifest = null
    this.sceneUrls = []
    this.sceneLoad = null
    this.sceneReloads = 0
    this.sceneListeners = false
    this.webIframe = null
    this.cursorForwardInit = false
    this.cursorFrame = null
    this.pendingCursor = null
    this.videoElement = null
    this.pauseOnHidden = true
    this.fitValue = 'cover'
    this.modeValue = 'live'
    this.soundValue = false
    this.volumeValue = 100
    this.lastMediaOptions = null
    this.cursorRects = new WeakMap()
    this.lastMaskColor = null
    this.handleSceneMessage = event => {
      if (!this.sceneIframe || event.source !== this.sceneIframe.contentWindow) return
      if (event.data?.type === 'dsh-scene-failed') {
        this.stopScene()
        if (!this.media?.querySelector('img')) this.fail(this.currentKey)
      } else if (event.data?.type === 'dsh-scene-needs-reload') {
        // Repeated context loss must fall back instead of creating a reload loop.
        if (this.sceneReloads++ >= 1) {
          this.stopScene()
          if (!this.media?.querySelector('img')) this.fail(this.currentKey)
        } else this.sceneIframe.srcdoc = scenePlayerHtml(this.soundValue, this.volumeValue)
      }
    }
    this.handleVisibility = () => {
      if (document.hidden) this.onCursorLeave?.()
      if (this.videoElement && this.pauseOnHidden) {
        if (document.hidden) this.videoElement.pause()
        else void this.videoElement.play()?.catch(() => {})
      }
      this.sceneIframe?.contentWindow?.postMessage({ type: 'dsh-set-pause', paused: document.hidden && this.pauseOnHidden }, '*')
    }
  }

  ensureElements() {
    if (typeof document === 'undefined' || !document.body) return
    if (this.root?.isConnected) return
    this.root = document.getElementById(ROOT_ID) || document.createElement('div')
    this.currentKey = null
    this.lastMaskColor = null
    this.root.id = ROOT_ID
    this.root.setAttribute('aria-hidden', 'true')
    this.root.style.cssText = 'position:fixed;inset:0;z-index:0;pointer-events:none;overflow:hidden;'
    this.media = document.createElement('div')
    this.media.style.cssText = 'position:absolute;background-size:cover;background-position:center;background-repeat:no-repeat;'
    this.mask = document.createElement('div')
    this.mask.style.cssText = 'position:absolute;inset:0;'
    this.root.replaceChildren(this.media, this.mask)
    document.body.prepend(this.root)
    this.ensureCursorForwarding()
  }

  // Capture host movement without intercepting clicks. Deliver the newest
  // sample once per animation frame, including the last event of a short drag.
  ensureCursorForwarding() {
    if (this.cursorForwardInit || typeof window === 'undefined') return
    this.cursorForwardInit = true
    this.onCursorMove = event => {
      if (document.hidden || (!this.sceneIframe && !this.webIframe)) return
      this.pendingCursor = { x: event.clientX / Math.max(window.innerWidth, 1),
        y: event.clientY / Math.max(window.innerHeight, 1) }
      if (this.cursorFrame !== null) return
      this.cursorFrame = window.requestAnimationFrame(() => {
        this.cursorFrame = null
        const cursor = this.pendingCursor
        this.pendingCursor = null
        if (cursor) this.forwardCursor(cursor.x, cursor.y, true)
      })
    }
    this.onCursorLeave = () => {
      if (this.cursorFrame !== null) window.cancelAnimationFrame(this.cursorFrame)
      this.cursorFrame = null
      this.pendingCursor = null
      this.forwardCursor(0.5, 0.5, false)
    }
    window.addEventListener('mousemove', this.onCursorMove, { passive: true, capture: true })
    window.addEventListener('mouseleave', this.onCursorLeave)
    document.addEventListener('mouseleave', this.onCursorLeave)
    window.addEventListener('blur', this.onCursorLeave)
  }

  forwardCursor(x, y, active) {
    const position = frame => {
      if (!frame) return { x, y, active }
      // The iframe is fixed inside the overscanned backdrop. Its geometry
      // changes with viewport/blur, rather than with every mouse sample.
      const geometryKey = `${window.innerWidth}:${window.innerHeight}:${this.media?.style.inset}`
      let geometry = this.cursorRects.get(frame)
      if (!geometry || geometry.key !== geometryKey) {
        geometry = { key: geometryKey, rect: frame.getBoundingClientRect?.() }
        this.cursorRects.set(frame, geometry)
      }
      const rect = geometry.rect
      if (!rect?.width || !rect?.height) return { x, y, active }
      const px = (x * window.innerWidth - rect.left) / rect.width
      const py = (y * window.innerHeight - rect.top) / rect.height
      return { x: Math.min(1, Math.max(0, px)), y: Math.min(1, Math.max(0, py)),
        active: active && px >= 0 && px <= 1 && py >= 0 && py <= 1 }
    }
    try {
      this.sceneIframe?.contentWindow?.postMessage({ type: 'dsh-set-cursor', ...position(this.sceneIframe) }, '*')
    } catch { /* The scene frame may still be loading. */ }
    try {
      this.webIframe?.contentWindow?.postMessage({ type: 'hermes-we-cursor', ...position(this.webIframe) }, '*')
    } catch { /* The web frame may still be loading. */ }
  }

  update({ enabled, type = 'image', src, sceneFrame = null, webPreview = null, blur = 0, occlusion = 35,
    isDark = true, mode = 'live', fit = 'cover', opacity = 100, pauseOnHidden = true, sound = false, volume = 100 }) {
    const safeSource = enabled && type === 'scene' && /^[a-zA-Z]:[\\/]/.test(src)
      ? src : (enabled ? normalizeMediaSource(src, type) : null)
    if (!safeSource) {
      this.hide()
      return false
    }
    const key = `${type}:${safeSource}:${mode === 'frame' ? 'frame' : 'live'}`
    if (this.failedKeys.has(key)) {
      this.hide()
      return false
    }
    this.ensureElements()
    if (!this.root) return false
    this.root.style.display = 'block'
    // The full contract range lives in config.js; only non-finite junk is
    // coerced here. A legal 0 (no blur, fully transparent, silent) passes
    // through untouched.
    const blurValue = Number.isFinite(Number(blur)) ? Math.min(60, Math.max(0, Number(blur))) : 0
    const writeStyle = (el, key, value) => { if (el.style[key] !== value) el.style[key] = value }
    writeStyle(this.media, 'filter', blurValue > 0 ? `blur(${blurValue}px)` : 'none')
    // Overscan the media box by the blur radius: gaussian sampling beyond the
    // element edge would otherwise fade to the backdrop's absence (a white or
    // theme-colored rim at large blurs). The mask keeps the viewport bounds.
    writeStyle(this.media, 'inset', `-${blurValue + 8}px`)
    writeStyle(this.media, 'opacity', `${(Number.isFinite(Number(opacity)) ? Math.min(100, Math.max(0, Number(opacity))) : 100) / 100}`)
    this.fitValue = ['cover', 'contain', 'fill'].includes(fit) ? fit : 'cover'
    this.modeValue = mode === 'frame' ? 'frame' : 'live'
    this.pauseOnHidden = Boolean(pauseOnHidden)
    this.soundValue = Boolean(sound)
    this.volumeValue = Number.isFinite(Number(volume)) ? Math.min(100, Math.max(0, Number(volume))) : 100
    // Endpoint honesty: occlusion 100 = the veil fully hides the wallpaper.
    // The old Math.min(0.9, …) ceiling is gone — 1.0 is a legal, reachable end.
    const alpha = (Number.isFinite(Number(occlusion)) ? Math.min(100, Math.max(0, Number(occlusion))) : 35) / 100
    const maskColor = isDark ? `rgba(0,0,0,${alpha})` : `rgba(255,255,255,${alpha})`
    if (this.lastMaskColor !== maskColor) this.mask.style.backgroundColor = maskColor
    this.lastMaskColor = maskColor
    if (key === this.currentKey) {
      this.syncMediaOptions(type, { fit: this.fitValue, sound, volume, pauseOnHidden })
      return true
    }
    this.currentKey = key
    this.releaseMedia()
    this.lastMediaOptions = null
    this.sceneReloads = 0
    this.sceneManifest = null
    this.webIframe = null
    this.media.replaceChildren()
    this.media.style.backgroundImage = 'none'
    if (type === 'scene') {
      if (sceneFrame) this.showSceneFrame(sceneFrame, key, this.modeValue === 'frame')
      if (this.modeValue === 'live') void this.showScene(key, safeSource)
    } else if (type === 'web') {
      if (webPreview) this.showSceneFrame(webPreview, key, this.modeValue === 'frame')
      if (this.modeValue === 'live') void this.showWeb(key, safeSource, src)
    } else if (type === 'video') {
      const video = document.createElement('video')
      video.onerror = () => this.fail(key)
      video.src = safeSource
      video.autoplay = true
      video.loop = true
      video.muted = !sound
      video.volume = this.volumeValue / 100
      video.playsInline = true
      video.style.cssText = `width:100%;height:100%;object-fit:${this.fitValue};display:block;`
      this.videoElement = video
      this.ensurePlaybackListeners()
      if (this.modeValue === 'frame') {
      video.addEventListener('loadeddata', () => {
          if (this.currentKey !== key || this.videoElement !== video) return
          try {
            const canvas = document.createElement('canvas')
            const scale = Math.min(1, 1920 / Math.max(video.videoWidth, video.videoHeight))
            canvas.width = Math.max(1, Math.round(video.videoWidth * scale))
            canvas.height = Math.max(1, Math.round(video.videoHeight * scale))
            canvas.getContext('2d')?.drawImage(video, 0, 0, canvas.width, canvas.height)
            const image = document.createElement('img')
            image.src = canvas.toDataURL('image/jpeg', 0.9)
            image.style.cssText = `width:100%;height:100%;object-fit:${this.fitValue};display:block;`
            if (this.currentKey === key) this.media.replaceChildren(image)
          } catch { /* The live video remains visible if capture is blocked by CORS. */ }
          finally { video.pause(); if (this.videoElement === video) this.videoElement = null }
        }, { once: true })
      }
      this.media.appendChild(video)
      video.play().catch(() => this.fail(key))
    } else {
      const image = document.createElement('img')
      image.alt = ''
      let triedBridge = false
      image.onerror = async () => {
        const local = /^[a-zA-Z]:[\\/]/.test(src) || /^file:\/\/\//i.test(src)
        const bridge = typeof window !== 'undefined' ? window.hermesDesktop : null
        if (!triedBridge && local && bridge?.readFileDataUrl) {
          triedBridge = true
          try {
            const data = await bridge.readFileDataUrl(src)
            if (this.currentKey !== key) return
            if (typeof data === 'string' && data.startsWith('data:image/')) {
              image.src = data
              return
            }
          } catch { /* Invalid or oversized local image. */ }
        }
        this.fail(key)
      }
      image.src = safeSource
      image.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block;'
      this.media.appendChild(image)
    }
    return true
  }

  syncMediaOptions(type, options) {
    const optionsKey = `${type}:${options.fit}:${options.sound}:${options.volume}:${options.pauseOnHidden}`
    if (this.lastMediaOptions === optionsKey) return
    this.lastMediaOptions = optionsKey
    const video = this.media?.querySelector('video')
    if (video) {
      video.style.objectFit = options.fit
      video.muted = !options.sound
      video.volume = (Number.isFinite(Number(options.volume)) ? Math.min(100, Math.max(0, Number(options.volume))) : 100) / 100
      this.handleVisibility()
    }
    if (type === 'scene') {
      this.sceneIframe?.contentWindow?.postMessage({ type: 'dsh-set-fit', fit: options.fit }, '*')
      this.sceneIframe?.contentWindow?.postMessage({
        type: 'dsh-set-pause', paused: document.hidden && options.pauseOnHidden
      }, '*')
      this.sceneIframe?.contentWindow?.postMessage({
        type: 'dsh-set-audio', sound: options.sound, volume: options.volume
      }, '*')
    }
    const frame = this.media?.querySelector('iframe')
    if (frame && type === 'web') frame.style.objectFit = options.fit
  }

  showSceneFrame(framePath, key, freeze = false) {
    const image = document.createElement('img')
    image.alt = ''
    image.style.cssText = `position:absolute;inset:0;width:100%;height:100%;object-fit:${this.fitValue};display:block;`
    if (freeze) image.onload = () => {
      try {
        const canvas = document.createElement('canvas')
        canvas.width = Math.max(1, image.naturalWidth)
        canvas.height = Math.max(1, image.naturalHeight)
        canvas.getContext('2d')?.drawImage(image, 0, 0)
        image.src = canvas.toDataURL('image/png')
        image.onload = null
      } catch { /* Keep the source preview as a fallback. */ }
    }
    const bridge = typeof window !== 'undefined' ? window.hermesDesktop : null
    const load = async () => {
      try {
        const data = await bridge.readFileDataUrl(framePath)
        if (this.currentKey === key) image.src = data
      } catch {
        try {
          const data = await bridge.readFileDataUrlForAttach?.(framePath)
          if (this.currentKey === key && data) image.src = data
        } catch { /* Live scene may still load without a backing frame. */ }
      }
    }
    if (bridge?.readFileDataUrl) void load()
    this.media.appendChild(image)
  }

  async showScene(key, manifestPath) {
    const bridge = typeof window !== 'undefined' ? window.hermesDesktop : null
    const load = new AbortController()
    this.sceneLoad = load
    try {
      const scene = await loadSceneManifest(bridge, manifestPath, this.prepareScene, load.signal)
      if (load.signal.aborted || this.currentKey !== key) {
        scene.objectUrls.forEach(url => URL.revokeObjectURL(url))
        return
      }
      const frame = document.createElement('iframe')
      // The srcdoc contains only the vendored player code. Shared origin lets
      // its WebGL video textures consume the parent's Blob URLs safely.
      frame.setAttribute('sandbox', 'allow-scripts allow-same-origin')
      frame.setAttribute('aria-hidden', 'true')
      frame.style.cssText = `position:absolute;inset:0;width:100%;height:100%;border:0;pointer-events:none;object-fit:${this.fitValue};`
      frame.onload = () => {
        if (this.sceneIframe !== frame) return
        frame.contentWindow?.postMessage({ type: 'hermes-scene-manifest', manifest: scene.manifest }, '*')
        frame.contentWindow?.postMessage({ type: 'dsh-set-fit', fit: this.fitValue }, '*')
        frame.contentWindow?.postMessage({ type: 'dsh-set-pause', paused: document.hidden && this.pauseOnHidden }, '*')
      }
      this.sceneIframe = frame
      this.sceneManifest = scene.manifest
      this.sceneUrls = scene.objectUrls
      if (!this.sceneListeners) {
        this.ensurePlaybackListeners()
      }
      frame.srcdoc = scenePlayerHtml(this.soundValue, this.volumeValue)
      this.media.appendChild(frame)
      this.onVisibilityChange?.()
    } catch {
      // A decoded full-resolution frame remains visible if the WebGL scene
      // cannot be prepared by this Hermes build.
      if (!load.signal.aborted && this.currentKey === key && !this.media?.querySelector('img')) this.fail(key)
    } finally {
      if (this.sceneLoad === load) this.sceneLoad = null
    }
  }

  ensurePlaybackListeners() {
    if (this.sceneListeners || typeof window === 'undefined') return
    window.addEventListener('message', this.handleSceneMessage)
    document.addEventListener('visibilitychange', this.handleVisibility)
    this.sceneListeners = true
  }

  async showWeb(key, fileUrl, sourcePath) {
    const bridge = typeof window !== 'undefined' ? window.hermesDesktop : null
    try {
      const html = await loadWebWallpaper(bridge, sourcePath)
      if (this.currentKey !== key) return
      const frame = document.createElement('iframe')
      frame.setAttribute('sandbox', 'allow-scripts')
      frame.setAttribute('aria-hidden', 'true')
      frame.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;border:0;pointer-events:none;'
      frame.style.objectFit = this.fitValue
      frame.srcdoc = html
      this.webIframe = frame
      this.media.appendChild(frame)
    } catch {
      if (this.currentKey === key && !this.media.querySelector('img')) this.fail(key)
    }
  }

  fail(key) {
    if (this.currentKey !== key) return
    this.failedKeys.add(key)
    this.hide()
    this.onVisibilityChange?.()
  }

  hide() {
    if (this.root) this.root.style.display = 'none'
    this.releaseMedia()
    this.media?.replaceChildren()
    if (this.media) this.media.style.backgroundImage = 'none'
    this.currentKey = null
    this.sceneIframe = null
    this.sceneManifest = null
    this.webIframe = null
  }

  stopScene() {
    try { this.sceneIframe?.contentWindow?.__hermesSceneDispose?.() } catch { /* Frame is already unloaded. */ }
    this.sceneIframe?.remove?.()
    this.sceneIframe = null
    this.releaseSceneUrls()
  }

  releaseMedia() {
    this.sceneLoad?.abort()
    this.sceneLoad = null
    this.onCursorLeave?.()
    const video = this.videoElement || this.media?.querySelector('video')
    if (video) {
      video.pause()
      video.removeAttribute('src')
      video.load()
    }
    this.videoElement = null
    this.stopScene()
  }

  releaseSceneUrls() {
    this.sceneUrls.forEach(url => URL.revokeObjectURL(url))
    this.sceneUrls = []
  }

  destroy() {
    if (this.cursorForwardInit) {
      window.removeEventListener('mousemove', this.onCursorMove, { capture: true })
      window.removeEventListener('mouseleave', this.onCursorLeave)
      document.removeEventListener('mouseleave', this.onCursorLeave)
      window.removeEventListener('blur', this.onCursorLeave)
      if (this.cursorFrame !== null) window.cancelAnimationFrame(this.cursorFrame)
      this.cursorFrame = null
      this.pendingCursor = null
      this.cursorForwardInit = false
    }
    this.hide()
    this.root?.remove()
    this.root = null
    this.media = null
    this.mask = null
    this.currentKey = null
    this.failedKeys.clear()
    if (this.sceneListeners) {
      window.removeEventListener('message', this.handleSceneMessage)
      document.removeEventListener('visibilitychange', this.handleVisibility)
      this.sceneListeners = false
    }
  }
}
