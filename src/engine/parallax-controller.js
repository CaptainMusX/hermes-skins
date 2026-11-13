const FRAME_MS = 1000 / 60
const DT_MAX = 64
const SETTLE_VISIBLE_PX = 0.25
const IDLE_MS = 180
const IDLE_VISIBLE_PX = 1
const TARGETS_MS = 500
const BUBBLE_MAX = 24
const PLUGIN_DEFAULT_DEPTH = 1
const UI_SKIP_SCOPE = '[data-slot="settings.section"], [data-slot="plugins.bundle.config"]'
const UI_SKIP_PREFIX = ['settings.', 'plugins.', 'shell.']
const UI_SKIP = ['root', 'main', 'rightbar', 'conversation.view', 'sidebar', 'main.conversation']
const UI_GROUPS = {
  chat: '[data-chat-surface], [data-slot="conversation.view"]',
  composer: '[data-slot="composer-root"], [data-slot="composer-surface"]',
  sidebar: '[data-slot="sidebar"]',
  bubble: '[data-chat-flow-kind="user"], [data-chat-flow-kind="steering"], [data-message-role="user"]'
}

const parallaxClamp = (value, min, max, fallback) => {
  const number = Number(value)
  return Number.isFinite(number) ? Math.min(max, Math.max(min, number)) : fallback
}

function hasFixedDescendant(element) {
  if (!element || typeof element.querySelectorAll !== 'function') return false
  let count = 0
  try {
    for (const node of element.querySelectorAll('*')) {
      if (++count > 400) break
      if (getComputedStyle(node).position === 'fixed') return true
    }
  } catch { /* Cross-origin or detached nodes are not movable. */ }
  return false
}

function writeTranslate(element, x, y, independent = true) {
  if (!element?.style) return false
  const value = `${x.toFixed(2)}px ${y.toFixed(2)}px`
  if (element.dataset.hsParallaxValue === value) return false
  element.dataset.hsParallaxValue = value
  if (independent && 'translate' in element.style) {
    element.style.translate = value
  } else {
    element.style.transform = `translate3d(${value}, 0)`
  }
  return true
}

function clearTranslate(element) {
  if (!element?.style) return
  if (element.style.translate) element.style.removeProperty('translate')
  if (element.dataset.hsParallaxTransform === '1') element.style.removeProperty('transform')
  delete element.dataset.hsParallaxValue
  delete element.dataset.hsParallaxTransform
  if (element.style.willChange === 'translate') element.style.removeProperty('will-change')
}

/** Pointer-driven background and optional surface parallax. */
export class ParallaxController {
  constructor() {
    this.config = null
    this.x = 0
    this.y = 0
    this.targetX = 0
    this.targetY = 0
    this.frame = null
    this.bound = false
    this.seen = false
    this.lastMs = 0
    this.moveMs = 0
    this.viewportWidth = 0
    this.viewportHeight = 0
    this.dpr = 1
    this.backgroundTargets = []
    this.uiTargets = []
    this.pluginTargets = []
    this.targetsAt = 0
    this.onMove = event => {
      if (!this.config?.parallaxEnabled) return
      this.x = event.clientX
      this.y = event.clientY
      this.seen = true
      this.moveMs = performance.now()
      this.kick()
    }
    this.onLeave = () => {
      this.targetX = 0
      this.targetY = 0
      this.kick()
    }
    this.onResize = () => {
      this.readViewport()
      this.refreshTargets(true)
      this.kick()
    }
    this.onVisibility = () => {
      if (document.hidden) this.cancelFrame()
      else this.kick()
    }
  }

  readViewport() {
    this.viewportWidth = Math.max(1, window.innerWidth || 1)
    this.viewportHeight = Math.max(1, window.innerHeight || 1)
    this.dpr = Math.max(1, window.devicePixelRatio || 1)
  }

  bind() {
    if (this.bound) return
    document.addEventListener('pointermove', this.onMove, { passive: true })
    document.addEventListener('pointerleave', this.onLeave, { passive: true })
    document.addEventListener('visibilitychange', this.onVisibility, { passive: true })
    window.addEventListener('blur', this.onLeave)
    window.addEventListener('resize', this.onResize, { passive: true })
    this.bound = true
  }

  unbind() {
    if (!this.bound) return
    document.removeEventListener('pointermove', this.onMove)
    document.removeEventListener('pointerleave', this.onLeave)
    document.removeEventListener('visibilitychange', this.onVisibility)
    window.removeEventListener('blur', this.onLeave)
    window.removeEventListener('resize', this.onResize)
    this.bound = false
  }

  refreshTargets(force = false) {
    const now = performance.now()
    if (!force && this.targetsAt && now - this.targetsAt < TARGETS_MS) return
    this.targetsAt = now
    this.backgroundTargets = [...document.querySelectorAll('.hs-backdrop-surface')]
    const config = this.config || {}
    const uiTargets = []
    if (config.parallaxUi) {
      for (const [kind, selector] of Object.entries(UI_GROUPS)) {
        const elements = [...document.querySelectorAll(selector)]
        const limited = kind === 'bubble' ? elements.slice(-BUBBLE_MAX) : elements
        for (const element of limited) {
          if (uiTargets.some(record => record.element === element)) continue
          uiTargets.push({
            element,
            kind,
            depth: kind === 'chat' ? config.parallaxUiChatDepth
              : kind === 'composer' ? config.parallaxUiComposerDepth
              : kind === 'sidebar' ? config.parallaxUiSidebarDepth
              : config.parallaxUiBubbleDepth,
            blocked: hasFixedDescendant(element)
          })
        }
      }
    }
    this.uiTargets = uiTargets
    const pluginTargets = []
    if (config.parallaxPlugin) {
      const taken = new Set(uiTargets.map(record => record.element))
      for (const element of document.querySelectorAll('[data-slot]')) {
        const slot = element.getAttribute('data-slot') || ''
        if (!slot || UI_SKIP.includes(slot) || UI_SKIP_PREFIX.some(prefix => slot.startsWith(prefix))) continue
        try {
          if (element.closest(UI_SKIP_SCOPE)) continue
        } catch { continue }
        if ([...taken].some(node => node === element || node.contains?.(element) || element.contains?.(node))) continue
        if (!element.getBoundingClientRect().width || !element.getBoundingClientRect().height) continue
        const depth = config.parallaxPluginDepths?.[slot] ?? PLUGIN_DEFAULT_DEPTH
        if (!(Number(depth) > 0) || hasFixedDescendant(element)) continue
        pluginTargets.push({ element, kind: 'plugin', depth, blocked: false })
        taken.add(element)
      }
    }
    this.pluginTargets = pluginTargets
  }

  kick() {
    if (this.frame !== null || !this.config?.parallaxEnabled || document.hidden) return
    if (!this.viewportWidth || !this.viewportHeight) this.readViewport()
    this.refreshTargets(false)
    this.frame = requestAnimationFrame(now => this.tick(now))
  }

  cancelFrame() {
    if (this.frame !== null) cancelAnimationFrame(this.frame)
    this.frame = null
    this.lastMs = 0
  }

  start() {
    this.readViewport()
    this.bind()
    this.refreshTargets(true)
    this.kick()
  }

  stop() {
    this.cancelFrame()
    this.unbind()
    for (const element of this.backgroundTargets) {
      clearTranslate(element)
      element.style.removeProperty('scale')
    }
    for (const element of [...this.uiTargets, ...this.pluginTargets]) clearTranslate(element.element)
    this.backgroundTargets = []
    this.uiTargets = []
    this.pluginTargets = []
    this.x = 0
    this.y = 0
    this.targetX = 0
    this.targetY = 0
    this.seen = false
    this.lastMs = 0
    this.moveMs = 0
    this.targetsAt = 0
  }

  update(config) {
    this.config = config
    if (typeof document === 'undefined') return
    const root = document.documentElement
    if (!config.parallaxEnabled) {
      root.removeAttribute('data-hermes-skins-parallax')
      this.stop()
      return
    }
    root.setAttribute('data-hermes-skins-parallax', 'true')
    this.start()
  }

  tick(now = performance.now()) {
    this.frame = null
    const config = this.config
    if (!config?.parallaxEnabled) return
    if (!this.backgroundTargets.length && !this.uiTargets.length && !this.pluginTargets.length) {
      this.refreshTargets(true)
    }
    const width = this.viewportWidth
    const height = this.viewportHeight
    const cx = this.seen ? this.x : width / 2
    const cy = this.seen ? this.y : height / 2
    const targetX = -(cx - width / 2)
    const targetY = -(cy - height / 2)
    const smooth = parallaxClamp(config.parallaxSmooth, 0, 98, 85)
    const alpha = 1 - smooth / 100
    const dt = this.lastMs ? Math.min(DT_MAX, Math.max(1, now - this.lastMs)) : FRAME_MS
    this.lastMs = now
    const factor = alpha <= 0 ? 1 : 1 - Math.pow(1 - alpha, dt / FRAME_MS)
    this.targetX += (targetX - this.targetX) * factor
    this.targetY += (targetY - this.targetY) * factor

    const diagonal = Math.hypot(width, height)
    const bgDepth = parallaxClamp(config.parallaxBg, 0, 10, 1)
    const bgX = this.targetX / Math.max(1, width) * bgDepth * diagonal
    const bgY = this.targetY / Math.max(1, height) * bgDepth * diagonal
    const bgScale = 1 + bgDepth / 50
    for (const element of this.backgroundTargets) {
      if (!element.isConnected) continue
      writeTranslate(element, bgX, bgY)
      if (element.style.scale !== String(bgScale)) element.style.scale = String(bgScale)
    }

    const applyGroup = record => {
      const element = record.element
      if (!element?.isConnected) return
      const ratio = record.blocked ? 0 : parallaxClamp(record.depth, 0, 10, 1)
      let dx = this.targetX / Math.max(1, width) * ratio * diagonal
      let dy = this.targetY / Math.max(1, height) * ratio * diagonal
      dx = Math.round(dx * this.dpr) / this.dpr
      dy = Math.round(dy * this.dpr) / this.dpr
      if (Math.abs(dx) < 0.25 && Math.abs(dy) < 0.25) {
        clearTranslate(element)
      } else {
        element.style.willChange = 'translate'
        writeTranslate(element, dx, dy)
      }
    }
    for (const record of this.uiTargets) applyGroup(record)
    for (const record of this.pluginTargets) applyGroup(record)

    const idle = this.moveMs > 0 && now - this.moveMs >= IDLE_MS
    const remaining = Math.hypot(targetX - this.targetX, targetY - this.targetY) /
      Math.max(1, width) * diagonal
    if (remaining > (idle ? IDLE_VISIBLE_PX : SETTLE_VISIBLE_PX)) this.kick()
  }

  destroy() {
    this.stop()
    this.config = null
    if (typeof document !== 'undefined') {
      document.documentElement.removeAttribute('data-hermes-skins-parallax')
    }
  }
}
