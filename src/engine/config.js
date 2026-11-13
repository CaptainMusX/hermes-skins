export const ROTATION_INTERVAL_MIN = 1
export const ROTATION_INTERVAL_MAX = 1440
export const ROTATION_TRIGGER_VALUES = ['interval', 'videoEnd']
export const ROTATION_ORDER_VALUES = ['sequence', 'random']
export const TRANSITION_VALUES = ['cut', 'fade', 'push', 'wipe', 'iris', 'zoom', 'bars']
export const TRANSITION_DIRECTIONS = ['left', 'right', 'up', 'down']
export const TRANSITION_SPEEDS = ['fast', 'normal', 'slow']
export const WALLPAPER_TYPES = ['video', 'web', 'image', 'scene']
export const CONTENT_RATINGS = ['everyone', 'pg13', 'mature', 'unrated']
export const ORIENTATION_FILTERS = ['all', 'landscape', 'portrait']
export const PICKER_LAYOUTS = ['classic', 'fixed']
export const FX_CLICK_STYLES = ['ripple', 'spark', 'both']
export const FX_TRAIL_STYLES = ['comet', 'dust']
export const FX_BLEND_VALUES = ['screen', 'normal', 'overlay', 'multiply', 'lighten']
export const FX_COLOR_MODES = ['accent', 'rainbow', 'custom']
export const FONT_SET_KEYS = [
  'themeColors', 'themeDarkSeparate', 'themeSize', 'themeWeight',
  'themeFamily', 'globalFamily', 'componentFonts'
]
export const THEME_COLOR_ROLE_IDS = ['primary', 'secondary', 'tertiary', 'caption', 'dimmed']
export const TYPE_ROLE_IDS = [
  'markdown-h1', 'markdown-h2', 'markdown-h3', 'markdown-h4',
  'markdown-base', 'markdown-small', 'markdown-code', 'markdown-code-block',
  'markdown-table', 'markdown-table-head', 'xs-13', 'xxs-12'
]
export const COMPONENT_FONT_TARGETS = [
  { id: 'markdown', label: '对话正文' },
  { id: 'codeBlock', label: '代码块' },
  { id: 'terminal', label: '终端块' },
  { id: 'table', label: '表格' }
]

export const DEFAULT_CONFIG = {
  schemaVersion: 7,

  wallpaperEnabled: false,
  wallpaperType: 'image',
  wallpaperMode: 'live',
  wallpaperFit: 'cover',
  wallpaperSource: '',
  wallpaperBlur: 0,
  maskOcclusion: 25,
  wallpaperOpacity: 100,
  backgroundBrightness: 100,
  backgroundContrast: 100,
  backgroundSaturate: 100,
  wallpaperFlip: false,
  wallpaperTransition: 'cut',
  wallpaperTransitionDir: 'left',
  wallpaperTransitionSpeed: 'normal',

  pauseOnHidden: true,
  pauseOnBlur: false,
  pauseOnBattery: false,
  wallpaperSound: false,
  wallpaperVolume: 100,
  videoPlaybackRate: 1,
  sceneLive: true,
  sceneLiveFps: 30,
  sceneAutoQuality: true,
  sceneRenderDpr: 0,
  sceneVideoTexScale: 0,
  liveBootDelay: 3,
  pictureSlideSeconds: 0,

  hiddenWallpaperIds: [],
  userProps: {},
  contentRatingFilter: ['everyone'],
  typeFilter: [...WALLPAPER_TYPES],
  folderFilter: 'all',
  orientationFilter: 'all',
  pickerLayout: 'fixed',

  rotationEnabled: false,
  rotationGroupId: '',
  rotationGroups: [],
  rotationSeeded: false,
  rotationMinutes: 30,

  fontCustom: false,
  fontSets: [],
  fontSetId: '',
  themeColors: {},
  themeDarkSeparate: false,
  themeSize: {},
  themeWeight: {},
  themeFamily: {},
  globalFamily: '',
  componentFonts: {},
  caretColor: '',

  accent: '#4f8cff',
  uiColorCustom: false,
  uiColorSend: '',
  uiColorLink: '',
  uiColorFileIcon: '',
  uiColorTab: '',
  uiColorDeepDiving: '',
  themeFollow: false,

  fxEnabled: false,
  fxClick: true,
  fxClickStyle: 'ripple',
  fxClickSize: 140,
  fxClickGlow: 60,
  fxTrail: true,
  fxTrailStyle: 'comet',
  fxTrailLength: 420,
  fxTrailWidth: 3,
  fxTrailGlow: 60,
  fxOpacity: 85,
  fxBlend: 'screen',
  fxColorMode: 'accent',
  fxColor: '#4f8cff',

  parallaxEnabled: false,
  parallaxBg: 1,
  parallaxUi: false,
  parallaxPlugin: false,
  parallaxUiChatDepth: 1.2,
  parallaxUiComposerDepth: 1.8,
  parallaxUiSidebarDepth: 1.6,
  parallaxUiBubbleDepth: 1.4,
  parallaxPluginDepths: {},
  parallaxSmooth: 85,

  layerPositionX: 50,
  layerPositionY: 50,
  layerScale: 100,

  panelGlass: 10,
  bubbleOpacity: 55,
  composerFrost: 10,
  surfaceFrost: 8,
  glassSaturation: 150,
  glassBorder: 35,
  glassHighlight: true,
  glassColor: { light: '#ffffff', dark: '#ffffff' },
  glassDarkSeparate: false,
  glassFidelity: 100,
  chatGlassFidelity: 100,
  settingsWindowTransparency: 20,
  settingsWindowBlur: 16,
  sidebarGlass: true,
  sidebarFollowGlobal: true,
  sidebarBlur: 16,
  sidebarAlpha: 60,
  sidebarColor: '#ffffff',
  leftSidebarGlass: true,
  leftSidebarCornerRadius: 'native',
  leftSidebarSquareTL: false,
  leftSidebarSquareTR: false,
  leftSidebarSquareBR: false,
  leftSidebarSquareBL: false,
  rightSidebarCornerRadius: 'native',
  rightSidebarSquareTL: false,
  rightSidebarSquareTR: false,
  rightSidebarSquareBR: false,
  rightSidebarSquareBL: false,
  titlebarGlass: true,

  weRoots: [],
  weSelection: null
}

export const PARAM_RANGES = {
  wallpaperBlur: { min: 0, max: 60, unit: 'px' },
  maskOcclusion: { min: 0, max: 100, unit: '%' },
  wallpaperOpacity: { min: 0, max: 100, unit: '%' },
  backgroundBrightness: { min: 40, max: 160, unit: '%' },
  backgroundContrast: { min: 40, max: 200, unit: '%' },
  backgroundSaturate: { min: 0, max: 200, unit: '%' },
  layerPositionX: { min: 0, max: 100, unit: '%' },
  layerPositionY: { min: 0, max: 100, unit: '%' },
  layerScale: { min: 50, max: 150, unit: '%' },
  panelGlass: { min: 0, max: 100, unit: '%' },
  bubbleOpacity: { min: 0, max: 100, unit: '%' },
  composerFrost: { min: 0, max: 20, unit: 'px' },
  surfaceFrost: { min: 0, max: 20, unit: 'px' },
  wallpaperVolume: { min: 0, max: 100, unit: '%' },
  glassSaturation: { min: 100, max: 200, unit: '%' },
  glassBorder: { min: 0, max: 100, unit: '%' },
  glassFidelity: { min: 0, max: 100, unit: '%' },
  chatGlassFidelity: { min: 0, max: 100, unit: '%' },
  settingsWindowTransparency: { min: 0, max: 100, unit: '%' },
  settingsWindowBlur: { min: 0, max: 60, unit: 'px' },
  sidebarBlur: { min: 0, max: 60, unit: 'px' },
  sidebarAlpha: { min: 0, max: 100, unit: '%' },
  fxClickSize: { min: 40, max: 400, unit: 'px' },
  fxClickGlow: { min: 0, max: 100, unit: '%' },
  fxTrailLength: { min: 80, max: 2000, unit: 'ms' },
  fxTrailWidth: { min: 1, max: 12, unit: 'px' },
  fxTrailGlow: { min: 0, max: 100, unit: '%' },
  fxOpacity: { min: 10, max: 100, unit: '%' },
  parallaxBg: { min: 0, max: 10, unit: '%' },
  parallaxUiChatDepth: { min: 0, max: 10, unit: '%' },
  parallaxUiComposerDepth: { min: 0, max: 10, unit: '%' },
  parallaxUiSidebarDepth: { min: 0, max: 10, unit: '%' },
  parallaxUiBubbleDepth: { min: 0, max: 10, unit: '%' },
  parallaxSmooth: { min: 0, max: 98, unit: '%' }
}

const HEX_RE = /^#[0-9a-f]{6}$/i
const GROUP_ID_RE = /^[A-Za-z0-9_-]{1,64}$/
const FONT_SET_ID_RE = /^[A-Za-z0-9_-]{1,64}$/

export function clampNum(value, min, max, fallback) {
  const number = Number(value)
  return Number.isFinite(number) ? Math.min(max, Math.max(min, number)) : fallback
}

export function paramInRange(key, value) {
  const range = PARAM_RANGES[key]
  if (!range) throw new Error(`Unknown parameter: ${key}`)
  return clampNum(value, range.min, range.max, DEFAULT_CONFIG[key])
}

const hex = (value, fallback = '') => typeof value === 'string' && HEX_RE.test(value) ? value : fallback
const text = (value, max = 200) => typeof value === 'string' ? value.slice(0, max) : ''

function uniqueStrings(value, maxItems = 5000, maxLength = 1024) {
  return Array.isArray(value)
    ? [...new Set(value.filter(item => typeof item === 'string' && item.length > 0 && item.length <= maxLength))]
      .slice(0, maxItems)
    : []
}

function enumArray(value, allowed, fallback) {
  if (!Array.isArray(value)) return [...fallback]
  const filtered = [...new Set(value.filter(item => allowed.includes(item)))]
  return filtered.length ? filtered : [...fallback]
}

export function normalizeRotationGroup(raw) {
  if (!raw || typeof raw !== 'object') return null
  const id = typeof raw.id === 'string' && GROUP_ID_RE.test(raw.id) ? raw.id : ''
  if (!id) return null
  return {
    id,
    name: typeof raw.name === 'string' && raw.name.trim() ? raw.name.trim().slice(0, 80) : '轮播列表',
    interval: Math.round(clampNum(raw.interval, ROTATION_INTERVAL_MIN, ROTATION_INTERVAL_MAX, DEFAULT_CONFIG.rotationMinutes)),
    order: ROTATION_ORDER_VALUES.includes(raw.order) ? raw.order : 'sequence',
    trigger: ROTATION_TRIGGER_VALUES.includes(raw.trigger) ? raw.trigger : 'interval',
    wallpaperIds: uniqueStrings(raw.wallpaperIds, 5000, 1024)
  }
}

export function normalizeRotationGroups(value) {
  if (!Array.isArray(value)) return []
  return value.map(normalizeRotationGroup).filter(Boolean).slice(0, 100)
}

function sanitizeThemeColors(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}
  const out = {}
  for (const role of THEME_COLOR_ROLE_IDS) {
    const pair = value[role]
    if (!pair || typeof pair !== 'object' || Array.isArray(pair)) continue
    const light = hex(pair.light)
    const dark = hex(pair.dark || pair.light)
    if (light && dark) out[role] = { light, dark }
  }
  return out
}

function sanitizeTypographyMap(value, allowed, min, max) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}
  const out = {}
  for (const key of allowed) {
    if (value[key] === undefined || value[key] === '') continue
    out[key] = Math.round(clampNum(value[key], min, max, min))
  }
  return out
}

function sanitizeFamilyMap(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}
  const out = {}
  for (const key of TYPE_ROLE_IDS) {
    const family = text(value[key], 200).trim()
    if (family) out[key] = family
  }
  return out
}

export function sanitizeComponentFonts(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}
  const out = {}
  const ids = new Set(COMPONENT_FONT_TARGETS.map(target => target.id))
  for (const [id, raw] of Object.entries(value)) {
    if (!ids.has(id) || !raw || typeof raw !== 'object' || Array.isArray(raw)) continue
    const entry = {}
    if (raw.size !== undefined && raw.size !== '') entry.size = Math.round(clampNum(raw.size, 8, 48, 14))
    if (raw.weight !== undefined && raw.weight !== '') entry.weight = Math.round(clampNum(raw.weight, 100, 900, 400))
    const family = text(raw.family, 200).trim()
    if (family) entry.family = family
    if (Object.keys(entry).length) out[id] = entry
  }
  return out
}

function sanitizeFontValues(raw) {
  const src = raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : {}
  return {
    themeColors: sanitizeThemeColors(src.themeColors),
    themeDarkSeparate: src.themeDarkSeparate === true,
    themeSize: sanitizeTypographyMap(src.themeSize, TYPE_ROLE_IDS, 8, 48),
    themeWeight: sanitizeTypographyMap(src.themeWeight, TYPE_ROLE_IDS, 100, 900),
    themeFamily: sanitizeFamilyMap(src.themeFamily),
    globalFamily: text(src.globalFamily, 200).trim(),
    componentFonts: sanitizeComponentFonts(src.componentFonts)
  }
}

export function sanitizeFontSets(value) {
  if (!Array.isArray(value)) return []
  const out = []
  for (const raw of value) {
    if (!raw || typeof raw !== 'object') continue
    const id = typeof raw.id === 'string' && FONT_SET_ID_RE.test(raw.id) ? raw.id : ''
    if (!id || out.some(item => item.id === id)) continue
    out.push({
      id,
      name: typeof raw.name === 'string' && raw.name.trim() ? raw.name.trim().slice(0, 80) : '字体集',
      values: sanitizeFontValues(raw.values)
    })
    if (out.length >= 100) break
  }
  return out
}

function sanitizePluginDepths(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}
  const out = {}
  for (const [slot, depth] of Object.entries(value)) {
    if (typeof slot !== 'string' || !slot || slot.length > 120) continue
    out[slot] = clampNum(depth, 0, 10, 1)
  }
  return out
}

function scalarValue(value) {
  return value === null || ['string', 'number', 'boolean'].includes(typeof value)
    ? (typeof value === 'string' ? value.slice(0, 2048) : value)
    : null
}

function sanitizeUserProps(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}
  const out = {}
  for (const [id, props] of Object.entries(value)) {
    if (typeof id !== 'string' || !id || id.length > 1024 ||
        !props || typeof props !== 'object' || Array.isArray(props)) continue
    const clean = {}
    for (const [name, propValue] of Object.entries(props)) {
      if (typeof name !== 'string' || !name || name.length > 120) continue
      const scalar = scalarValue(propValue)
      if (scalar !== null) clean[name] = scalar
    }
    if (Object.keys(clean).length) out[id] = clean
  }
  return out
}

function sanitizeSelectionProperties(value) {
  if (!Array.isArray(value)) return []
  return value.filter(property => property && typeof property === 'object' &&
      typeof property.name === 'string' && typeof property.type === 'string')
    .slice(0, 100)
    .map(property => {
      const entry = {
        name: property.name.slice(0, 120),
        type: property.type.slice(0, 20),
        text: text(property.text, 240),
        order: Number(property.order) || 0,
        value: scalarValue(property.value),
        hidden: property.hidden === true
      }
      if (Array.isArray(property.options)) {
        entry.options = property.options.filter(option => option && typeof option === 'object')
          .slice(0, 200)
          .map(option => ({
            label: text(option.label, 160),
            value: scalarValue(option.value)
          }))
      }
      for (const key of ['min', 'max', 'step', 'precision']) {
        if (Number.isFinite(Number(property[key]))) entry[key] = Number(property[key])
      }
      if (typeof property.fileType === 'string') entry.fileType = property.fileType.slice(0, 20)
      return entry
    })
}

export function normalizeConfig(value) {
  const raw = value && typeof value === 'object' && !Array.isArray(value) ? value : {}
  const schemaVersion = Math.max(7, Number(raw.schemaVersion) || 0)
  const rotationGroups = normalizeRotationGroups(raw.rotationGroups)
  const rotationGroupId = rotationGroups.some(group => group.id === raw.rotationGroupId)
    ? raw.rotationGroupId : ''
  const transition = raw.wallpaperTransition === 'slide' ? 'push'
    : TRANSITION_VALUES.includes(raw.wallpaperTransition) ? raw.wallpaperTransition : DEFAULT_CONFIG.wallpaperTransition
  const fontSets = sanitizeFontSets(raw.fontSets)
  const fontSetId = fontSets.some(item => item.id === raw.fontSetId) ? raw.fontSetId : ''
  const sourceType = WALLPAPER_TYPES.includes(raw.wallpaperType) ? raw.wallpaperType : DEFAULT_CONFIG.wallpaperType
  const fit = ['cover', 'contain', 'center', 'fill'].includes(raw.wallpaperFit)
    ? raw.wallpaperFit : DEFAULT_CONFIG.wallpaperFit
  const typeFilter = typeof raw.typeFilter === 'string'
    ? (raw.typeFilter === 'all' ? [...WALLPAPER_TYPES] : [raw.typeFilter].filter(item => WALLPAPER_TYPES.includes(item)))
    : enumArray(raw.typeFilter, WALLPAPER_TYPES, WALLPAPER_TYPES)
  const legacyBubbleDefault = (Number(raw.schemaVersion ?? 3) < 4) && raw.bubbleOpacity === 100

  return {
    schemaVersion,

    wallpaperEnabled: raw.wallpaperEnabled === true,
    wallpaperType: sourceType,
    wallpaperMode: raw.wallpaperMode === 'frame' ? 'frame' : 'live',
    wallpaperFit: fit,
    wallpaperSource: text(raw.wallpaperSource, 16384),
    wallpaperBlur: paramInRange('wallpaperBlur', raw.wallpaperBlur),
    maskOcclusion: paramInRange('maskOcclusion', raw.maskOcclusion),
    wallpaperOpacity: paramInRange('wallpaperOpacity', raw.wallpaperOpacity),
    backgroundBrightness: paramInRange('backgroundBrightness', raw.backgroundBrightness),
    backgroundContrast: paramInRange('backgroundContrast', raw.backgroundContrast),
    backgroundSaturate: paramInRange('backgroundSaturate', raw.backgroundSaturate),
    wallpaperFlip: raw.wallpaperFlip === true,
    wallpaperTransition: transition,
    wallpaperTransitionDir: TRANSITION_DIRECTIONS.includes(raw.wallpaperTransitionDir)
      ? raw.wallpaperTransitionDir : DEFAULT_CONFIG.wallpaperTransitionDir,
    wallpaperTransitionSpeed: TRANSITION_SPEEDS.includes(raw.wallpaperTransitionSpeed)
      ? raw.wallpaperTransitionSpeed : DEFAULT_CONFIG.wallpaperTransitionSpeed,

    pauseOnHidden: typeof raw.pauseOnHidden === 'boolean' ? raw.pauseOnHidden : DEFAULT_CONFIG.pauseOnHidden,
    pauseOnBlur: typeof raw.pauseOnBlur === 'boolean' ? raw.pauseOnBlur : DEFAULT_CONFIG.pauseOnBlur,
    pauseOnBattery: typeof raw.pauseOnBattery === 'boolean' ? raw.pauseOnBattery : DEFAULT_CONFIG.pauseOnBattery,
    wallpaperSound: typeof raw.wallpaperSound === 'boolean' ? raw.wallpaperSound : DEFAULT_CONFIG.wallpaperSound,
    wallpaperVolume: paramInRange('wallpaperVolume', raw.wallpaperVolume),
    videoPlaybackRate: clampNum(raw.videoPlaybackRate, 0.5, 2, DEFAULT_CONFIG.videoPlaybackRate),
    sceneLive: typeof raw.sceneLive === 'boolean' ? raw.sceneLive : DEFAULT_CONFIG.sceneLive,
    sceneLiveFps: [15, 30, 60].includes(Number(raw.sceneLiveFps)) ? Number(raw.sceneLiveFps) : DEFAULT_CONFIG.sceneLiveFps,
    sceneAutoQuality: typeof raw.sceneAutoQuality === 'boolean' ? raw.sceneAutoQuality : DEFAULT_CONFIG.sceneAutoQuality,
    sceneRenderDpr: [0, 1, 1.5, 2].includes(Number(raw.sceneRenderDpr)) ? Number(raw.sceneRenderDpr) : DEFAULT_CONFIG.sceneRenderDpr,
    sceneVideoTexScale: [0, 0.5, 1].includes(Number(raw.sceneVideoTexScale))
      ? Number(raw.sceneVideoTexScale) : DEFAULT_CONFIG.sceneVideoTexScale,
    liveBootDelay: clampNum(raw.liveBootDelay, 0, 30, DEFAULT_CONFIG.liveBootDelay),
    pictureSlideSeconds: Math.round(clampNum(raw.pictureSlideSeconds, 0, 3600, DEFAULT_CONFIG.pictureSlideSeconds)),

    hiddenWallpaperIds: uniqueStrings(raw.hiddenWallpaperIds),
    userProps: sanitizeUserProps(raw.userProps),
    contentRatingFilter: enumArray(raw.contentRatingFilter, CONTENT_RATINGS, ['everyone']),
    typeFilter,
    folderFilter: text(raw.folderFilter, 200) || 'all',
    orientationFilter: ORIENTATION_FILTERS.includes(raw.orientationFilter)
      ? raw.orientationFilter : DEFAULT_CONFIG.orientationFilter,
    pickerLayout: PICKER_LAYOUTS.includes(raw.pickerLayout) ? raw.pickerLayout : DEFAULT_CONFIG.pickerLayout,

    rotationEnabled: raw.rotationEnabled === true,
    rotationGroupId,
    rotationGroups,
    rotationSeeded: raw.rotationSeeded === true,
    rotationMinutes: Math.round(clampNum(raw.rotationMinutes, ROTATION_INTERVAL_MIN, ROTATION_INTERVAL_MAX,
      DEFAULT_CONFIG.rotationMinutes)),

    fontCustom: raw.fontCustom === true,
    fontSets,
    fontSetId,
    themeColors: sanitizeThemeColors(raw.themeColors),
    themeDarkSeparate: raw.themeDarkSeparate === true,
    themeSize: sanitizeTypographyMap(raw.themeSize, TYPE_ROLE_IDS, 8, 48),
    themeWeight: sanitizeTypographyMap(raw.themeWeight, TYPE_ROLE_IDS, 100, 900),
    themeFamily: sanitizeFamilyMap(raw.themeFamily),
    globalFamily: text(raw.globalFamily || raw.fontFamily, 200).trim(),
    componentFonts: sanitizeComponentFonts(raw.componentFonts),
    caretColor: hex(raw.caretColor),

    accent: hex(raw.accent, DEFAULT_CONFIG.accent),
    uiColorCustom: raw.uiColorCustom === true,
    uiColorSend: hex(raw.uiColorSend),
    uiColorLink: hex(raw.uiColorLink),
    uiColorFileIcon: hex(raw.uiColorFileIcon),
    uiColorTab: hex(raw.uiColorTab),
    uiColorDeepDiving: hex(raw.uiColorDeepDiving),
    themeFollow: raw.themeFollow === true,

    fxEnabled: raw.fxEnabled === true,
    fxClick: raw.fxClick !== false,
    fxClickStyle: FX_CLICK_STYLES.includes(raw.fxClickStyle) ? raw.fxClickStyle : DEFAULT_CONFIG.fxClickStyle,
    fxClickSize: paramInRange('fxClickSize', raw.fxClickSize),
    fxClickGlow: paramInRange('fxClickGlow', raw.fxClickGlow),
    fxTrail: raw.fxTrail !== false,
    fxTrailStyle: raw.fxTrailStyle === 'sparkle' ? 'dust'
      : FX_TRAIL_STYLES.includes(raw.fxTrailStyle) ? raw.fxTrailStyle : DEFAULT_CONFIG.fxTrailStyle,
    fxTrailLength: paramInRange('fxTrailLength', raw.fxTrailLength),
    fxTrailWidth: paramInRange('fxTrailWidth', raw.fxTrailWidth),
    fxTrailGlow: paramInRange('fxTrailGlow', raw.fxTrailGlow),
    fxOpacity: paramInRange('fxOpacity', raw.fxOpacity),
    fxBlend: FX_BLEND_VALUES.includes(raw.fxBlend) ? raw.fxBlend : DEFAULT_CONFIG.fxBlend,
    fxColorMode: FX_COLOR_MODES.includes(raw.fxColorMode) ? raw.fxColorMode : DEFAULT_CONFIG.fxColorMode,
    fxColor: hex(raw.fxColor, DEFAULT_CONFIG.fxColor),

    parallaxEnabled: raw.parallaxEnabled === true,
    parallaxBg: paramInRange('parallaxBg', raw.parallaxBg),
    parallaxUi: raw.parallaxUi === true,
    parallaxPlugin: raw.parallaxPlugin === true,
    parallaxUiChatDepth: paramInRange('parallaxUiChatDepth', raw.parallaxUiChatDepth),
    parallaxUiComposerDepth: paramInRange('parallaxUiComposerDepth', raw.parallaxUiComposerDepth),
    parallaxUiSidebarDepth: paramInRange('parallaxUiSidebarDepth', raw.parallaxUiSidebarDepth),
    parallaxUiBubbleDepth: paramInRange('parallaxUiBubbleDepth', raw.parallaxUiBubbleDepth),
    parallaxPluginDepths: sanitizePluginDepths(raw.parallaxPluginDepths),
    parallaxSmooth: paramInRange('parallaxSmooth', raw.parallaxSmooth),

    layerPositionX: paramInRange('layerPositionX', raw.layerPositionX),
    layerPositionY: paramInRange('layerPositionY', raw.layerPositionY),
    layerScale: paramInRange('layerScale', raw.layerScale),

    panelGlass: paramInRange('panelGlass', raw.panelGlass),
    bubbleOpacity: legacyBubbleDefault ? 55 : paramInRange('bubbleOpacity', raw.bubbleOpacity),
    composerFrost: paramInRange('composerFrost', raw.composerFrost),
    surfaceFrost: paramInRange('surfaceFrost', raw.surfaceFrost),
    glassSaturation: paramInRange('glassSaturation', raw.glassSaturation),
    glassBorder: paramInRange('glassBorder', raw.glassBorder),
    glassHighlight: raw.glassHighlight !== false,
    glassColor: {
      light: hex(raw.glassColor?.light, DEFAULT_CONFIG.glassColor.light),
      dark: hex(raw.glassColor?.dark, DEFAULT_CONFIG.glassColor.dark)
    },
    glassDarkSeparate: raw.glassDarkSeparate === true,
    glassFidelity: paramInRange('glassFidelity', raw.glassFidelity),
    chatGlassFidelity: paramInRange('chatGlassFidelity', raw.chatGlassFidelity),
    settingsWindowTransparency: paramInRange('settingsWindowTransparency', raw.settingsWindowTransparency),
    settingsWindowBlur: paramInRange('settingsWindowBlur', raw.settingsWindowBlur),
    sidebarGlass: raw.sidebarGlass !== false,
    sidebarFollowGlobal: raw.sidebarFollowGlobal !== false,
    sidebarBlur: paramInRange('sidebarBlur', raw.sidebarBlur),
    sidebarAlpha: paramInRange('sidebarAlpha', raw.sidebarAlpha),
    sidebarColor: hex(raw.sidebarColor, DEFAULT_CONFIG.sidebarColor),
    leftSidebarGlass: typeof raw.leftSidebarGlass === 'boolean'
      ? raw.leftSidebarGlass : DEFAULT_CONFIG.leftSidebarGlass,
    leftSidebarCornerRadius: ['native', '6', '12', '20'].includes(raw.leftSidebarCornerRadius)
      ? raw.leftSidebarCornerRadius : DEFAULT_CONFIG.leftSidebarCornerRadius,
    leftSidebarSquareTL: raw.leftSidebarSquareTL === true,
    leftSidebarSquareTR: raw.leftSidebarSquareTR === true,
    leftSidebarSquareBR: raw.leftSidebarSquareBR === true,
    leftSidebarSquareBL: raw.leftSidebarSquareBL === true,
    rightSidebarCornerRadius: ['native', '6', '12', '20'].includes(raw.rightSidebarCornerRadius)
      ? raw.rightSidebarCornerRadius : DEFAULT_CONFIG.rightSidebarCornerRadius,
    rightSidebarSquareTL: raw.rightSidebarSquareTL === true,
    rightSidebarSquareTR: raw.rightSidebarSquareTR === true,
    rightSidebarSquareBR: raw.rightSidebarSquareBR === true,
    rightSidebarSquareBL: raw.rightSidebarSquareBL === true,
    titlebarGlass: typeof raw.titlebarGlass === 'boolean' ? raw.titlebarGlass : DEFAULT_CONFIG.titlebarGlass,

    weRoots: Array.isArray(raw.weRoots)
      ? [...new Set(raw.weRoots.filter(root => typeof root === 'string' && /^[A-Za-z]:[\\/]/.test(root) && root.length <= 1024))]
        .slice(0, 8)
      : [],
    weSelection: raw.weSelection && typeof raw.weSelection === 'object' &&
      typeof raw.weSelection.id === 'string' && typeof raw.weSelection.title === 'string'
      ? {
          id: raw.weSelection.id.slice(0, 1024),
          title: raw.weSelection.title.slice(0, 120),
          kind: String(raw.weSelection.kind || '').slice(0, 20),
          source: String(raw.weSelection.source || '').slice(0, 20),
          staticFallback: Boolean(raw.weSelection.staticFallback),
          dir: typeof raw.weSelection.dir === 'string' ? raw.weSelection.dir.slice(0, 1024) : null,
          manifestPath: typeof raw.weSelection.manifestPath === 'string' ? raw.weSelection.manifestPath.slice(0, 1024) : null,
          framePath: typeof raw.weSelection.framePath === 'string' ? raw.weSelection.framePath.slice(0, 1024) : null,
          previewPath: typeof raw.weSelection.previewPath === 'string' ? raw.weSelection.previewPath.slice(0, 1024) : null,
          slides: uniqueStrings(raw.weSelection.slides, 500, 1024),
          properties: sanitizeSelectionProperties(raw.weSelection.properties),
          slideIntervalMs: Number.isFinite(Number(raw.weSelection.slideIntervalMs))
            ? Math.min(24 * 60 * 60 * 1000, Math.max(1000, Number(raw.weSelection.slideIntervalMs))) : null
        }
      : null
  }
}
