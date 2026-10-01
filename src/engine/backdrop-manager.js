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
  constructor() {
    this.root = null
    this.media = null
    this.mask = null
    this.currentKey = null
    this.failedKeys = new Set()
    this.onVisibilityChange = null
    this.sceneIframe = null
    this.sceneManifest = null
    this.sceneUrls = []
    this.sceneListeners = false
    this.videoElement = null
    this.pauseOnHidden = true
    this.fitValue = 'cover'
    this.modeValue = 'live'
    this.soundValue = false
    this.volumeValue = 100
    this.handleSceneMessage = event => {
      if (event.source !== this.sceneIframe?.contentWindow || event.data?.type !== 'dsh-scene-needs-reload') return
      this.sceneIframe.srcdoc = scenePlayerHtml(this.soundValue, this.volumeValue)
    }
    this.handleVisibility = () => {
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
    this.root.id = ROOT_ID
    this.root.setAttribute('aria-hidden', 'true')
    this.root.style.cssText = 'position:fixed;inset:0;z-index:0;pointer-events:none;overflow:hidden;'
    this.media = document.createElement('div')
    this.media.style.cssText = 'position:absolute;background-size:cover;background-position:center;background-repeat:no-repeat;'
    this.mask = document.createElement('div')
    this.mask.style.cssText = 'position:absolute;inset:0;'
    this.root.replaceChildren(this.media, this.mask)
    document.body.prepend(this.root)
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
    this.media.style.filter = blurValue > 0 ? `blur(${blurValue}px)` : 'none'
    // Overscan the media box by the blur radius: gaussian sampling beyond the
    // element edge would otherwise fade to the backdrop's absence (a white or
    // theme-colored rim at large blurs). The mask keeps the viewport bounds.
    this.media.style.inset = `-${blurValue + 8}px`
    this.media.style.opacity = `${(Number.isFinite(Number(opacity)) ? Math.min(100, Math.max(0, Number(opacity))) : 100) / 100}`
    this.fitValue = ['cover', 'contain', 'fill'].includes(fit) ? fit : 'cover'
    this.modeValue = mode === 'frame' ? 'frame' : 'live'
    this.pauseOnHidden = Boolean(pauseOnHidden)
    this.soundValue = Boolean(sound)
    this.volumeValue = Number.isFinite(Number(volume)) ? Math.min(100, Math.max(0, Number(volume))) : 100
    // Endpoint honesty: occlusion 100 = the veil fully hides the wallpaper.
    // The old Math.min(0.9, …) ceiling is gone — 1.0 is a legal, reachable end.
    const alpha = (Number.isFinite(Number(occlusion)) ? Math.min(100, Math.max(0, Number(occlusion))) : 35) / 100
    this.mask.style.backgroundColor = isDark ? `rgba(0,0,0,${alpha})` : `rgba(255,255,255,${alpha})`
    if (key === this.currentKey) {
      this.syncMediaOptions(type, { fit: this.fitValue, sound, volume, pauseOnHidden })
      return true
    }
    this.currentKey = key
    this.releaseSceneUrls()
    this.sceneIframe = null
    this.sceneManifest = null
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
          finally { video.pause(); this.videoElement = null }
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
    try {
      const scene = await loadSceneManifest(bridge, manifestPath)
      if (this.currentKey !== key) {
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
      if (this.currentKey === key && !this.media.querySelector('img')) this.fail(key)
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
    const video = this.media?.querySelector('video')
    if (video) video.pause()
    this.videoElement = null
    this.media?.replaceChildren()
    if (this.media) this.media.style.backgroundImage = 'none'
    this.currentKey = null
    this.sceneIframe = null
    this.sceneManifest = null
    this.releaseSceneUrls()
  }

  releaseSceneUrls() {
    this.sceneUrls.forEach(url => URL.revokeObjectURL(url))
    this.sceneUrls = []
  }

  destroy() {
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
