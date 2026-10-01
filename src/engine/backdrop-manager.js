/**
 * Backdrop & Wallpaper Engine for Hermes Desktop
 * Manages the fixed wallpaper layer, blur filters, occlusion masks and crossfades.
 */

const BACKDROP_ROOT_ID = 'hermes-skins-backdrop-root'
const BACKDROP_MEDIA_ID = 'hermes-skins-backdrop-media'
const BACKDROP_MASK_ID = 'hermes-skins-backdrop-mask'

export class BackdropManager {
  constructor() {
    this.root = null
    this.mediaEl = null
    this.maskEl = null
    this.currentSrc = null
    this.currentType = null
  }

  ensureElements() {
    if (typeof document === 'undefined') return

    if (!this.root || !document.body.contains(this.root)) {
      let root = document.getElementById(BACKDROP_ROOT_ID)
      if (!root) {
        root = document.createElement('div')
        root.id = BACKDROP_ROOT_ID
        root.setAttribute('aria-hidden', 'true')
        root.style.cssText = `
          position: fixed;
          inset: 0;
          width: 100vw;
          height: 100vh;
          z-index: -9999;
          pointer-events: none;
          overflow: hidden;
          contain: strict;
          transition: opacity 0.3s ease;
        `
        document.body.prepend(root)
      }
      this.root = root
    }

    if (!this.mediaEl || !this.root.contains(this.mediaEl)) {
      let mediaContainer = document.getElementById(BACKDROP_MEDIA_ID)
      if (!mediaContainer) {
        mediaContainer = document.createElement('div')
        mediaContainer.id = BACKDROP_MEDIA_ID
        mediaContainer.style.cssText = `
          position: absolute;
          inset: -30px;
          width: calc(100% + 60px);
          height: calc(100% + 60px);
          transition: filter 0.25s ease, opacity 0.4s ease;
          background-position: center;
          background-size: cover;
          background-repeat: no-repeat;
          will-change: filter, transform;
        `
        this.root.appendChild(mediaContainer)
      }
      this.mediaEl = mediaContainer
    }

    if (!this.maskEl || !this.root.contains(this.maskEl)) {
      let mask = document.getElementById(BACKDROP_MASK_ID)
      if (!mask) {
        mask = document.createElement('div')
        mask.id = BACKDROP_MASK_ID
        mask.style.cssText = `
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          transition: background-color 0.25s ease, opacity 0.3s ease;
          pointer-events: none;
        `
        this.root.appendChild(mask)
      }
      this.maskEl = mask
    }
  }

  update({ enabled, type, src, blur = 0, occlusion = 30, isDark = true }) {
    this.ensureElements()
    if (!this.root || !this.mediaEl || !this.maskEl) return

    if (!enabled || !src) {
      this.root.style.opacity = '0'
      this.root.style.visibility = 'hidden'
      return
    }

    this.root.style.visibility = 'visible'
    this.root.style.opacity = '1'

    // Update blur
    this.mediaEl.style.filter = blur > 0 ? `blur(${blur}px)` : 'none'

    // Update occlusion mask
    const maskAlpha = Math.min(Math.max(occlusion / 100, 0), 0.95)
    if (isDark) {
      this.maskEl.style.backgroundColor = `rgba(0, 0, 0, ${maskAlpha})`
    } else {
      this.maskEl.style.backgroundColor = `rgba(255, 255, 255, ${maskAlpha})`
    }

    // Media update
    if (this.currentSrc !== src || this.currentType !== type) {
      this.currentSrc = src
      this.currentType = type

      // Clear existing content
      this.mediaEl.innerHTML = ''
      this.mediaEl.style.backgroundImage = 'none'

      if (type === 'video') {
        const video = document.createElement('video')
        video.src = src
        video.autoplay = true
        video.loop = true
        video.muted = true
        video.playsInline = true
        video.style.cssText = `
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        `
        video.play().catch(() => {})
        this.mediaEl.appendChild(video)
      } else {
        // Image or Data URI / SVG
        this.mediaEl.style.backgroundImage = `url("${src}")`
      }
    }
  }

  destroy() {
    if (this.root && this.root.parentNode) {
      this.root.parentNode.removeChild(this.root)
    }
    this.root = null
    this.mediaEl = null
    this.maskEl = null
    this.currentSrc = null
  }
}
