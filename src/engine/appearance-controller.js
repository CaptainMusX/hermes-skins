import { activeRotationGroup } from './wallpaper-apply.js'

/** Owns wallpaper and glass effects; Hermes itself owns the app theme. */
export class AppearanceController {
  constructor(store, backdrop, glass, extras = []) {
    this.store = store
    this.backdrop = backdrop
    this.glass = glass
    this.extras = extras
    this.pendingConfig = null
    this.configFrame = null
    this.backdrop.onVisibilityChange = () => this.sync()
  }

  sync() {
    const config = this.store.$config.get()
    const source = config.wallpaperSource
    const enabled = Boolean(source && config.wallpaperEnabled)
    const isDark = (typeof document !== 'undefined'
      ? document.documentElement?.dataset?.hermesMode : 'dark') !== 'light'
    const rotationGroup = activeRotationGroup(config)
    const videoEndRotation = config.rotationEnabled && rotationGroup?.trigger === 'videoEnd' &&
      rotationGroup.wallpaperIds.includes(config.weSelection?.id)
    const slideIntervalMs = config.pictureSlideSeconds > 0
      ? config.pictureSlideSeconds * 1000
      : config.weSelection?.slideIntervalMs || null
    const propertyDefaults = Object.fromEntries((config.weSelection?.properties || [])
      .filter(property => property && property.name && property.type !== 'text' &&
        property.type !== 'group' && property.value !== null && property.value !== undefined)
      .map(property => [property.name, property.value]))
    const effectiveUserProps = {
      ...propertyDefaults,
      ...(config.userProps?.[config.weSelection?.id] || {})
    }
    const showing = this.backdrop.update({
      enabled,
      type: config.wallpaperType,
      src: source,
      sceneDir: config.weSelection?.dir || (config.wallpaperType === 'scene' &&
        /^[a-zA-Z]:[\\/]/.test(source) && !/\.json$/i.test(source) ? source : null),
      sceneManifest: config.weSelection?.manifestPath || (config.wallpaperType === 'scene' &&
        /\.json$/i.test(source) ? source : null),
      sceneFrame: config.wallpaperType === 'scene' ? config.weSelection?.framePath : null,
      webPreview: config.wallpaperType === 'web' || config.wallpaperType === 'scene'
        ? config.weSelection?.previewPath : null,
      slides: config.wallpaperType === 'image' ? (config.weSelection?.slides || []) : [],
      slideIntervalMs,
      mode: config.wallpaperMode,
      fit: config.wallpaperFit,
      opacity: config.wallpaperOpacity,
      pauseOnHidden: config.pauseOnHidden,
      pauseOnBlur: config.pauseOnBlur,
      pauseOnBattery: config.pauseOnBattery,
      sound: config.wallpaperSound,
      volume: config.wallpaperVolume,
      playbackRate: config.videoPlaybackRate,
      sceneLive: config.sceneLive,
      sceneLiveFps: config.sceneLiveFps,
      sceneAutoQuality: config.sceneAutoQuality,
      sceneRenderDpr: config.sceneRenderDpr,
      sceneVideoTexScale: config.sceneVideoTexScale,
      transition: config.wallpaperTransition,
      transitionDir: config.wallpaperTransitionDir,
      transitionSpeed: config.wallpaperTransitionSpeed,
      blur: config.wallpaperBlur,
      occlusion: config.maskOcclusion,
      brightness: config.backgroundBrightness,
      contrast: config.backgroundContrast,
      saturate: config.backgroundSaturate,
      flip: config.wallpaperFlip,
      layerPositionX: config.layerPositionX,
      layerPositionY: config.layerPositionY,
      layerScale: config.layerScale,
      loop: !videoEndRotation,
      userProps: Object.keys(effectiveUserProps).length ? effectiveUserProps : null,
      isDark
    })
    this.glass.update({
      enabled: showing,
      glassTransparency: config.panelGlass,
      bubbleOpacity: config.bubbleOpacity,
      composerFrost: config.composerFrost,
      surfaceFrost: config.surfaceFrost,
      saturation: config.glassSaturation,
      border: config.glassBorder,
      highlight: config.glassHighlight,
      accent: config.accent,
      glassColor: config.glassColor,
      glassDarkSeparate: config.glassDarkSeparate,
      glassFidelity: config.glassFidelity,
      chatGlassFidelity: config.chatGlassFidelity,
      sidebarGlass: config.sidebarGlass,
      sidebarFollowGlobal: config.sidebarFollowGlobal,
      sidebarBlur: config.sidebarBlur,
      sidebarAlpha: config.sidebarAlpha,
      sidebarColor: config.sidebarColor,
      leftSidebarGlass: config.leftSidebarGlass,
      leftSidebarCornerRadius: config.leftSidebarCornerRadius,
      leftSidebarSquareTL: config.leftSidebarSquareTL,
      leftSidebarSquareTR: config.leftSidebarSquareTR,
      leftSidebarSquareBR: config.leftSidebarSquareBR,
      leftSidebarSquareBL: config.leftSidebarSquareBL,
      rightSidebarCornerRadius: config.rightSidebarCornerRadius,
      rightSidebarSquareTL: config.rightSidebarSquareTL,
      rightSidebarSquareTR: config.rightSidebarSquareTR,
      rightSidebarSquareBR: config.rightSidebarSquareBR,
      rightSidebarSquareBL: config.rightSidebarSquareBL,
      titlebarGlass: config.titlebarGlass,
      settingsWindowTransparency: config.settingsWindowTransparency,
      settingsWindowBlur: config.settingsWindowBlur,
      isDark
    })
    for (const extra of this.extras) extra.update(config)
  }

  changeConfig(change) {
    this.flushConfig()
    this.store.saveConfig(change)
    this.sync()
  }

  scheduleConfig(change) {
    this.pendingConfig = { ...this.pendingConfig, ...change }
    if (this.configFrame !== null) return
    this.configFrame = requestAnimationFrame(() => {
      this.configFrame = null
      const pending = this.pendingConfig
      this.pendingConfig = null
      if (pending) {
        this.store.saveConfig(pending, { deferPersistence: true })
        this.sync()
      }
    })
  }

  flushConfig() {
    if (this.configFrame !== null) cancelAnimationFrame(this.configFrame)
    this.configFrame = null
    const pending = this.pendingConfig
    this.pendingConfig = null
    if (pending) {
      this.store.saveConfig(pending)
      this.sync()
    }
    this.store.flushPersistence?.()
  }

  destroy() {
    this.flushConfig()
    this.backdrop.destroy()
    this.glass.destroy()
    for (const extra of this.extras) extra.destroy()
  }
}
