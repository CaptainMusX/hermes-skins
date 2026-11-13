const HOST_ID = 'hermes-skins-fx-layer'
const CANVAS_ID = 'hermes-skins-fx'
const DPR_MAX = 2
const CLICK_LIFE_MS = 900
const TRAIL_STEP_PX = 3
const DUST_STEP_PX = 10
const SPARK_COUNT = 12
const POINT_MAX = 96
const CLICK_MAX = 24
const PERF_LEVELS = 3
const TRAIL_BANDS = [2, 4, 8]
const MIN_GAP = [33, 0, 0]
const SLOW_FRAME_MS = 24
const DOWN_RUN = 6
const UP_RUN = 90
const UI_SELECTOR = 'button, a, input, select, textarea, label, [role="button"], [contenteditable="true"], [role="dialog"], [role="menu"], [role="listbox"]'
const FALLBACK_COLOR = '#4f8cff'

const fxClamp = (value, min, max, fallback) => {
  const number = Number(value)
  return Number.isFinite(number) ? Math.min(max, Math.max(min, number)) : fallback
}

/** Pointer click/trail effects drawn between the wallpaper and the app shell. */
export class FxOverlay {
  constructor() {
    this.host = null
    this.canvas = null
    this.ctx = null
    this.config = null
    this.points = []
    this.clicks = []
    this.frame = null
    this.bound = false
    this.hue = 0
    this.seed = 0
    this.accent = ''
    this.perfLevel = PERF_LEVELS - 1
    this.slowRun = 0
    this.fastRun = 0
    this.lastFrameAt = 0
    this.lastDrawAt = 0
    this.lastWidth = 0
    this.lastHeight = 0
    this.onMove = event => {
      if (!this.config?.fxEnabled || !this.config.fxTrail) return
      const points = typeof event.getCoalescedEvents === 'function'
        ? (event.getCoalescedEvents() || []) : []
      const samples = points.length ? points : [event]
      for (const sample of samples) this.pushTrail(sample.clientX, sample.clientY)
      this.kick()
    }
    this.onDown = event => {
      if (!this.config?.fxEnabled || !this.config.fxClick) return
      const target = event.target
      try {
        if (target?.closest?.(UI_SELECTOR)) return
      } catch { /* Prefer drawing if the target cannot be inspected. */ }
      this.seed += 1
      this.clicks.push({
        x: event.clientX, y: event.clientY, t0: performance.now(),
        seed: this.seed, hue: this.nextHue()
      })
      if (this.clicks.length > CLICK_MAX) this.clicks.splice(0, this.clicks.length - CLICK_MAX)
      this.kick()
    }
    this.onResize = () => this.kick()
    this.onVisibility = () => {
      if (document.hidden) this.cancelFrame()
      else this.kick()
    }
  }

  nextHue() {
    this.hue = (this.hue + 24) % 360
    return this.hue
  }

  settings() {
    const config = this.config || {}
    return {
      on: config.fxEnabled === true,
      click: config.fxClick !== false,
      clickStyle: config.fxClickStyle === 'spark' || config.fxClickStyle === 'both'
        ? config.fxClickStyle : 'ripple',
      size: fxClamp(config.fxClickSize, 40, 400, 140),
      clickGlow: fxClamp(config.fxClickGlow, 0, 100, 60),
      trail: config.fxTrail !== false,
      trailStyle: config.fxTrailStyle === 'dust' ? 'dust' : 'comet',
      lifeMs: fxClamp(config.fxTrailLength, 80, 2000, 420),
      width: fxClamp(config.fxTrailWidth, 1, 12, 3),
      trailGlow: fxClamp(config.fxTrailGlow, 0, 100, 60),
      opacity: fxClamp(config.fxOpacity, 10, 100, 85) / 100,
      blend: ['screen', 'normal', 'overlay', 'multiply', 'lighten'].includes(config.fxBlend)
        ? config.fxBlend : 'screen',
      colorMode: ['accent', 'rainbow', 'custom'].includes(config.fxColorMode)
        ? config.fxColorMode : 'accent',
      color: /^#[0-9a-f]{6}$/i.test(config.fxColor || '') ? config.fxColor : FALLBACK_COLOR
    }
  }

  ensureHost() {
    if (this.host?.isConnected || typeof document === 'undefined' || !document.body) return
    this.host = document.createElement('div')
    this.host.id = HOST_ID
    this.host.setAttribute('aria-hidden', 'true')
    this.host.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:1;'
    this.canvas = document.createElement('canvas')
    this.canvas.id = CANVAS_ID
    this.canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;'
    this.host.appendChild(this.canvas)
    const shell = document.querySelector('[data-contrib-shell]')
    if (shell?.parentNode === document.body) document.body.insertBefore(this.host, shell)
    else document.body.appendChild(this.host)
    this.ctx = this.canvas.getContext('2d')
    this.bind()
  }

  removeHost() {
    this.host?.remove()
    this.host = null
    this.canvas = null
    this.ctx = null
    this.lastWidth = 0
    this.lastHeight = 0
  }

  bind() {
    if (this.bound || typeof document === 'undefined') return
    document.addEventListener('pointermove', this.onMove, { passive: true })
    document.addEventListener('pointerdown', this.onDown, { passive: true })
    document.addEventListener('visibilitychange', this.onVisibility, { passive: true })
    window.addEventListener('resize', this.onResize, { passive: true })
    this.bound = true
  }

  unbind() {
    if (!this.bound) return
    document.removeEventListener('pointermove', this.onMove)
    document.removeEventListener('pointerdown', this.onDown)
    document.removeEventListener('visibilitychange', this.onVisibility)
    window.removeEventListener('resize', this.onResize)
    this.bound = false
  }

  pushTrail(x, y) {
    const last = this.points.at(-1)
    if (last && Math.hypot(x - last.x, y - last.y) < TRAIL_STEP_PX) return
    this.points.push({ x, y, t: performance.now(), hue: this.nextHue() })
    if (this.points.length > POINT_MAX) this.points.splice(0, this.points.length - POINT_MAX)
  }

  update(config) {
    this.config = config
    if (typeof document === 'undefined') return
    const settings = this.settings()
    if (!settings.on || (!settings.click && !settings.trail)) {
      this.stop()
      return
    }
    this.accent = ''
    this.ensureHost()
    this.start()
  }

  accentColor() {
    if (this.accent) return this.accent
    try {
      const styles = getComputedStyle(document.documentElement)
      this.accent = styles.getPropertyValue('--we-accent').trim() ||
        styles.getPropertyValue('--dt-primary').trim() ||
        styles.getPropertyValue('--primary').trim() || FALLBACK_COLOR
    } catch {
      this.accent = FALLBACK_COLOR
    }
    return this.accent
  }

  effectColor(settings, hue, now) {
    if (settings.colorMode === 'custom') return settings.color
    if (settings.colorMode === 'rainbow') {
      const current = (((hue + now / 12) % 360) + 360) % 360
      return `hsl(${current.toFixed(1)}, 92%, 66%)`
    }
    return this.accentColor()
  }

  kick() {
    if (this.frame !== null || !this.host || document.hidden) return
    this.frame = requestAnimationFrame(now => this.draw(now))
  }

  cancelFrame() {
    if (this.frame !== null) cancelAnimationFrame(this.frame)
    this.frame = null
  }

  start() {
    this.kick()
  }

  stop() {
    this.cancelFrame()
    this.unbind()
    this.removeHost()
    this.points = []
    this.clicks = []
    this.accent = ''
    this.perfLevel = PERF_LEVELS - 1
    this.slowRun = 0
    this.fastRun = 0
    this.lastFrameAt = 0
    this.lastDrawAt = 0
  }

  resize() {
    const width = Math.max(1, Math.round(window.innerWidth || 1))
    const height = Math.max(1, Math.round(window.innerHeight || 1))
    const dpr = Math.min(DPR_MAX, window.devicePixelRatio || 1)
    const pixelWidth = Math.round(width * dpr)
    const pixelHeight = Math.round(height * dpr)
    if (this.canvas.width !== pixelWidth || this.canvas.height !== pixelHeight) {
      this.canvas.width = pixelWidth
      this.canvas.height = pixelHeight
      this.canvas.style.width = `${width}px`
      this.canvas.style.height = `${height}px`
    }
    this.ctx?.setTransform(dpr, 0, 0, dpr, 0, 0)
    this.lastWidth = width
    this.lastHeight = height
  }

  setHostStyle(property, value) {
    if (this.host && this.host.style.getPropertyValue(property) !== value) {
      this.host.style.setProperty(property, value)
    }
  }

  updatePerformance(delta) {
    if (!(delta > 0)) return
    if (delta > SLOW_FRAME_MS) {
      this.slowRun += 1
      this.fastRun = 0
      if (this.slowRun >= DOWN_RUN && this.perfLevel > 0) {
        this.perfLevel -= 1
        this.slowRun = 0
      }
    } else {
      this.fastRun += 1
      this.slowRun = 0
      if (this.fastRun >= UP_RUN && this.perfLevel < PERF_LEVELS - 1) {
        this.perfLevel += 1
        this.fastRun = 0
      }
    }
  }

  sparkAngle(seed, index) {
    const noise = ((seed * 9301 + index * 49297) % 233280) / 233280
    return (index / SPARK_COUNT) * Math.PI * 2 + noise * 0.6
  }

  drawClicks(ctx, now, settings) {
    if (!settings.click) return
    ctx.lineCap = 'round'
    for (const click of this.clicks) {
      const progress = Math.min(1, Math.max(0, (now - click.t0) / CLICK_LIFE_MS))
      if (progress >= 1) continue
      const color = this.effectColor(settings, click.hue, now)
      if (settings.clickStyle !== 'spark') {
        for (let ring = 0; ring < 2; ring += 1) {
          const q = Math.min(1, progress - ring * 0.18)
          if (q <= 0) continue
          const fade = (1 - q) * (1 - q)
          ctx.globalAlpha = 0.9 * fade
          ctx.strokeStyle = color
          ctx.shadowColor = color
          ctx.shadowBlur = settings.clickGlow * 0.4 * fade
          ctx.lineWidth = Math.max(0.6, 3 * (1 - q))
          ctx.beginPath()
          const radius = Math.max(0.5, settings.size * (1 - Math.pow(1 - q, 3)) * (ring ? 0.78 : 1))
          ctx.arc(click.x, click.y, radius, 0, Math.PI * 2)
          ctx.stroke()
        }
      }
      if (settings.clickStyle !== 'ripple') {
        const ease = 1 - Math.pow(1 - progress, 3)
        const fade = (1 - progress) * (1 - progress)
        ctx.strokeStyle = color
        ctx.shadowColor = color
        ctx.shadowBlur = settings.clickGlow * 0.35 * fade
        ctx.lineWidth = Math.max(0.6, settings.width * 0.7 * (1 - progress))
        ctx.globalAlpha = 0.9 * fade
        ctx.beginPath()
        for (let index = 0; index < SPARK_COUNT; index += 1) {
          const angle = this.sparkAngle(click.seed, index)
          const reach = settings.size *
            (0.45 + 0.55 * (((click.seed * 31 + index * 37) % 100) / 100)) * ease
          const cos = Math.cos(angle)
          const sin = Math.sin(angle)
          ctx.moveTo(click.x + cos * reach * 0.7, click.y + sin * reach * 0.7)
          ctx.lineTo(click.x + cos * reach, click.y + sin * reach)
        }
        ctx.stroke()
        const flash = Math.max(0, 1 - progress * 3)
        if (flash > 0) {
          ctx.globalAlpha = 0.75 * flash
          ctx.fillStyle = '#ffffff'
          ctx.shadowColor = color
          ctx.shadowBlur = settings.clickGlow * 0.5 * flash
          ctx.beginPath()
          ctx.arc(click.x, click.y, Math.max(0.5, settings.width * 1.6 * flash + 1), 0, Math.PI * 2)
          ctx.fill()
        }
      }
    }
  }

  drawTrail(ctx, now, settings) {
    if (!settings.trail || this.points.length < 2) return
    const life = settings.lifeMs
    const bands = TRAIL_BANDS[this.perfLevel] || TRAIL_BANDS[0]
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    if (settings.trailStyle === 'dust') {
      let distance = 0
      const buckets = []
      for (let index = 1; index < this.points.length; index += 1) {
        const point = this.points[index]
        const previous = this.points[index - 1]
        distance += Math.abs(point.x - previous.x) + Math.abs(point.y - previous.y)
        if (distance < DUST_STEP_PX) continue
        distance = 0
        const fade = 1 - (now - point.t) / life
        if (fade <= 0) continue
        const band = Math.min(bands - 1, Math.max(0, Math.floor((1 - fade) * bands)))
        if (!buckets[band]) buckets[band] = { points: [], fade: 0, count: 0 }
        buckets[band].points.push(point)
        buckets[band].fade += fade
        buckets[band].count += 1
      }
      for (const bucket of buckets) {
        if (!bucket) continue
        const fade = bucket.fade / bucket.count
        ctx.globalAlpha = Math.max(0, Math.min(1, fade * fade * 0.9))
        ctx.fillStyle = this.effectColor(settings, bucket.points[0].hue, now)
        ctx.shadowColor = ctx.fillStyle
        ctx.shadowBlur = settings.trailGlow * fade * 0.4
        const radius = Math.max(0.6, settings.width * (0.45 + fade * 0.75))
        ctx.beginPath()
        for (const point of bucket.points) {
          ctx.moveTo(point.x + radius, point.y)
          ctx.arc(point.x, point.y, radius, 0, Math.PI * 2)
        }
        ctx.fill()
      }
      return
    }
    const buckets = []
    for (let index = 1; index < this.points.length; index += 1) {
      const a = this.points[index - 1]
      const b = this.points[index]
      const fade = 1 - (now - b.t) / life
      if (fade <= 0) continue
      const band = Math.min(bands - 1, Math.max(0, Math.floor((1 - fade) * bands)))
      if (!buckets[band]) buckets[band] = { segments: [], fade: 0, count: 0, hue: b.hue }
      buckets[band].segments.push(a, b)
      buckets[band].fade += fade
      buckets[band].count += 1
    }
    for (const bucket of buckets) {
      if (!bucket) continue
      const fade = bucket.fade / bucket.count
      ctx.globalAlpha = Math.max(0, Math.min(1, fade * fade * 0.9))
      ctx.strokeStyle = this.effectColor(settings, bucket.hue, now)
      ctx.shadowColor = ctx.strokeStyle
      ctx.shadowBlur = settings.trailGlow * fade * 0.35
      ctx.lineWidth = Math.max(0.4, settings.width * (0.25 + fade * 0.75))
      ctx.beginPath()
      for (let index = 0; index < bucket.segments.length; index += 2) {
        ctx.moveTo(bucket.segments[index].x, bucket.segments[index].y)
        ctx.lineTo(bucket.segments[index + 1].x, bucket.segments[index + 1].y)
      }
      ctx.stroke()
    }
  }

  draw(now) {
    this.frame = null
    const settings = this.settings()
    if (!settings.on || !this.host || !this.canvas) return
    if (this.lastFrameAt) this.updatePerformance(now - this.lastFrameAt)
    this.lastFrameAt = now
    const gap = MIN_GAP[this.perfLevel] || 0
    if (gap > 0 && this.lastDrawAt && now - this.lastDrawAt < gap) {
      this.kick()
      return
    }
    this.lastDrawAt = now
    this.points = this.points.filter(point => now - point.t <= settings.lifeMs)
    this.clicks = this.clicks.filter(click => now - click.t0 <= CLICK_LIFE_MS)
    this.resize()
    this.setHostStyle('mix-blend-mode', settings.blend)
    this.setHostStyle('opacity', String(settings.opacity))
    const ctx = this.ctx
    if (!ctx) return
    ctx.clearRect(0, 0, this.lastWidth, this.lastHeight)
    const active = this.points.length > 1 || this.clicks.length > 0
    if (active) {
      ctx.globalCompositeOperation = 'lighter'
      this.drawTrail(ctx, now, settings)
      this.drawClicks(ctx, now, settings)
      ctx.globalCompositeOperation = 'source-over'
      ctx.globalAlpha = 1
      ctx.shadowBlur = 0
      this.kick()
    }
  }

  destroy() {
    this.stop()
    this.config = null
  }
}
