const THEME_FOLLOW_STYLE_ID = 'hermes-skins-theme-follow-css'

const rgbToHex = (r, g, b) => `#${[r, g, b]
  .map(value => Math.max(0, Math.min(255, Math.round(value))).toString(16).padStart(2, '0'))
  .join('')}`

function adjustForAccent(r, g, b) {
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  if (max < 48) return [127, 140, 170]
  if (max - min < 18) return [130, 145, 170]
  const scale = 190 / Math.max(1, max)
  return [r * scale, g * scale, b * scale]
}

/**
 * Samples the current wallpaper preview and publishes a restrained dominant
 * colour. Kept as a separate root stylesheet so disabling it restores the
 * accent chosen by the plugin/UI-colour layer immediately.
 */
export class ThemeFollowController {
  constructor() {
    this.styleEl = null
    this.lastKey = ''
  }

  update(config) {
    if (typeof document === 'undefined') return
    if (!config.themeFollow) {
      document.documentElement.removeAttribute('data-hermes-skins-theme-follow')
      this.styleEl?.remove()
      this.styleEl = null
      this.lastKey = ''
      return
    }
    const source = config.weSelection?.previewPath ||
      (config.wallpaperType === 'image' ? config.wallpaperSource : '')
    if (!source) return
    const key = `${source}|${config.weSelection?.id || ''}`
    if (key === this.lastKey) return
    this.lastKey = key
    void this.sample(source).then(color => {
      if (!color || this.lastKey !== key || !document.documentElement) return
      if (!this.styleEl || !this.styleEl.isConnected) {
        this.styleEl = document.getElementById(THEME_FOLLOW_STYLE_ID) || document.createElement('style')
        this.styleEl.id = THEME_FOLLOW_STYLE_ID
        this.styleEl.dataset.plugin = 'hermes-skins'
        if (!this.styleEl.isConnected) document.head.appendChild(this.styleEl)
      }
      document.documentElement.setAttribute('data-hermes-skins-theme-follow', 'true')
      this.styleEl.textContent = `
        :root[data-hermes-skins-theme-follow="true"] {
          --we-accent:${color};
          --hs-theme-follow-accent:${color};
          --ui-accent:${color};
          --ui-accent-secondary:${color};
          --theme-primary:${color};
          --theme-midground:${color};
          --ui-blue:${color};
        }
      `
    })
  }

  async sample(source) {
    let url = source
    if (/^[A-Za-z]:[\\/]/.test(source)) {
      try {
        const data = await window.hermesDesktop?.readFileDataUrl?.(source)
        if (typeof data === 'string' && data.startsWith('data:image/')) url = data
        else return null
      } catch {
        return null
      }
    }
    if (!/^(https?:|data:image\/|file:\/\/)/i.test(url)) return null
    try {
      const image = new Image()
      image.decoding = 'async'
      if (/^https?:/i.test(url)) image.crossOrigin = 'anonymous'
      await new Promise((resolve, reject) => {
        let settled = false
        const finish = () => {
          if (settled) return
          settled = true
          resolve()
        }
        const fail = () => {
          if (settled) return
          settled = true
          reject(new Error('preview image failed'))
        }
        image.onload = finish
        image.onerror = fail
        image.src = url
        if (image.complete && image.naturalWidth > 0) finish()
        setTimeout(() => {
          if (!settled) fail()
        }, 5000)
      })
      const canvas = document.createElement('canvas')
      canvas.width = 48
      canvas.height = 27
      const ctx = canvas.getContext('2d', { willReadFrequently: true })
      if (!ctx) return null
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height)
      const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data
      let r = 0
      let g = 0
      let b = 0
      let weight = 0
      for (let index = 0; index < pixels.length; index += 4) {
        if (pixels[index + 3] < 160) continue
        const max = Math.max(pixels[index], pixels[index + 1], pixels[index + 2])
        const min = Math.min(pixels[index], pixels[index + 1], pixels[index + 2])
        const saturation = max - min
        const current = 1 + saturation / 48
        r += pixels[index] * current
        g += pixels[index + 1] * current
        b += pixels[index + 2] * current
        weight += current
      }
      if (!weight) return null
      return rgbToHex(...adjustForAccent(r / weight, g / weight, b / weight))
    } catch {
      return null
    }
  }

  destroy() {
    this.lastKey = ''
    this.styleEl?.remove()
    this.styleEl = null
    if (typeof document !== 'undefined') {
      document.documentElement.removeAttribute('data-hermes-skins-theme-follow')
    }
  }
}
