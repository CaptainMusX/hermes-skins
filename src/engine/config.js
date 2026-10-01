export const DEFAULT_CONFIG = {
  schemaVersion: 4,
  activeSkinId: 'default',
  previousTheme: null,
  wallpaperEnabled: false,
  wallpaperType: 'image',
  wallpaperMode: 'live',
  wallpaperFit: 'cover',
  wallpaperSource: '',
  wallpaperBlur: 0,
  maskOcclusion: 35,
  wallpaperOpacity: 100,
  pauseOnHidden: true,
  wallpaperSound: false,
  wallpaperVolume: 100,
  panelGlass: 10,
  bubbleOpacity: 55,
  composerFrost: 10,
  surfaceFrost: 8,
  weRoots: [],
  weSelection: null,
  customSkins: []
}

/**
 * The single parameter contract. UI sliders, normalization, rendering and the
 * i18n copy all read these ranges — no other file may clamp a stored value.
 *
 * Percent fields are true 0-100 levers with exact endpoint semantics:
 *   maskOcclusion 100 = the veil fully hides the wallpaper (DSH's own UI caps
 *     the same lever at 90; user request for Hermes is 100, so the endpoint is
 *     real, not a re-clamped 0.9 alpha),
 *   wallpaperOpacity 0 = the wallpaper media is invisible,
 *   panelGlass 100 = structural panel fills fully transparent,
 *   bubbleOpacity 0 = bubble fill transparent while text keeps its own opacity,
 *   wallpaperVolume 0 = silent.
 * Pixel fields follow the dsh-skins reference (commit 82f42bd3):
 *   wallpaperBlur = DSH wallpaperBlur (media layer, 0-60px, default 0),
 *   composerFrost = DSH inputCardBlur (composer card, 0-20px, default 10).
 * surfaceFrost is a Hermes extension: frosted blur behind the structural
 * panels (title bar, sidebars, panel headers, status bar, terminal). DSH has
 * no identical field — its closest relatives are the per-state backdrop blurs,
 * which this plugin does not expose as separate levers.
 */
export const PARAM_RANGES = {
  wallpaperBlur: { min: 0, max: 60, unit: 'px' },
  maskOcclusion: { min: 0, max: 100, unit: '%' },
  wallpaperOpacity: { min: 0, max: 100, unit: '%' },
  panelGlass: { min: 0, max: 100, unit: '%' },
  bubbleOpacity: { min: 0, max: 100, unit: '%' },
  composerFrost: { min: 0, max: 20, unit: 'px' },
  surfaceFrost: { min: 0, max: 20, unit: 'px' },
  wallpaperVolume: { min: 0, max: 100, unit: '%' }
}

/** Clamp one contract field. A missing/NaN field falls back to its default;
 *  a legal 0 (or any endpoint) is stored as 0, never mistaken for "unset". */
export function paramInRange(key, value) {
  const range = PARAM_RANGES[key]
  if (!range) throw new Error(`Unknown parameter: ${key}`)
  if (!Number.isFinite(value)) return DEFAULT_CONFIG[key]
  return Math.min(range.max, Math.max(range.min, value))
}

const validPalette = colors => colors && typeof colors === 'object' &&
  ['background', 'foreground', 'primary'].every(key => /^#[0-9a-f]{6}$/i.test(colors[key] || '')) &&
  Object.values(colors).every(value => typeof value === 'string' && /^#[0-9a-f]{6}$/i.test(value))

const validCustomSkin = skin => skin && typeof skin.id === 'string' && /^custom-[\w-]+$/.test(skin.id) &&
  typeof skin.name === 'string' && skin.name.length > 0 && skin.name.length <= 80 &&
  validPalette(skin.colors) && (!skin.darkColors || validPalette(skin.darkColors))

export function normalizeConfig(value) {
  const raw = value && typeof value === 'object' && !Array.isArray(value) ? value : {}
  // Schema 3 shipped bubbleOpacity default 100 — "keep the stock bubble fill",
  // which over a wallpaper reads as the solid white/black plates users report
  // as a bug. v4 moves the untouched default to a glassy 55; a 100 stored on
  // schema 4+ is a deliberate user choice and stays.
  const legacyBubbleDefault = (raw.schemaVersion ?? 3) < 4 && raw.bubbleOpacity === 100
  return {
    schemaVersion: 4,
    activeSkinId: typeof raw.activeSkinId === 'string' ? raw.activeSkinId : DEFAULT_CONFIG.activeSkinId,
    previousTheme: typeof raw.previousTheme === 'string' ? raw.previousTheme : null,
    wallpaperEnabled: typeof raw.wallpaperEnabled === 'boolean' ? raw.wallpaperEnabled : DEFAULT_CONFIG.wallpaperEnabled,
    wallpaperType: ['video', 'scene', 'web'].includes(raw.wallpaperType) ? raw.wallpaperType : 'image',
    wallpaperMode: raw.wallpaperMode === 'frame' ? 'frame' : 'live',
    wallpaperFit: ['cover', 'contain', 'fill'].includes(raw.wallpaperFit) ? raw.wallpaperFit : 'cover',
    wallpaperSource: typeof raw.wallpaperSource === 'string' ? raw.wallpaperSource.slice(0, 16384) : '',
    wallpaperBlur: paramInRange('wallpaperBlur', raw.wallpaperBlur),
    maskOcclusion: paramInRange('maskOcclusion', raw.maskOcclusion),
    wallpaperOpacity: paramInRange('wallpaperOpacity', raw.wallpaperOpacity),
    pauseOnHidden: typeof raw.pauseOnHidden === 'boolean' ? raw.pauseOnHidden : DEFAULT_CONFIG.pauseOnHidden,
    wallpaperSound: typeof raw.wallpaperSound === 'boolean' ? raw.wallpaperSound : DEFAULT_CONFIG.wallpaperSound,
    wallpaperVolume: paramInRange('wallpaperVolume', raw.wallpaperVolume),
    // Upgrades keep stored numbers: widening panelGlass to 0-100 makes every
    // previously legal value (including the schema-1 default 80) legal as-is,
    // so no legacy mapping may rewrite 80 into 15.
    panelGlass: paramInRange('panelGlass', raw.panelGlass),
    bubbleOpacity: legacyBubbleDefault ? 55 : paramInRange('bubbleOpacity', raw.bubbleOpacity),
    composerFrost: paramInRange('composerFrost', raw.composerFrost),
    surfaceFrost: paramInRange('surfaceFrost', raw.surfaceFrost),
    weRoots: Array.isArray(raw.weRoots)
      ? [...new Set(raw.weRoots.filter(root => typeof root === 'string' && /^[A-Za-z]:[\\/]/.test(root) && root.length <= 1024))].slice(0, 8)
      : [],
    weSelection: raw.weSelection && typeof raw.weSelection === 'object' &&
      typeof raw.weSelection.id === 'string' && typeof raw.weSelection.title === 'string'
      ? { id: raw.weSelection.id.slice(0, 1024), title: raw.weSelection.title.slice(0, 120),
          kind: String(raw.weSelection.kind || '').slice(0, 20), staticFallback: Boolean(raw.weSelection.staticFallback),
          framePath: typeof raw.weSelection.framePath === 'string' ? raw.weSelection.framePath.slice(0, 1024) : null,
          previewPath: typeof raw.weSelection.previewPath === 'string' ? raw.weSelection.previewPath.slice(0, 1024) : null }
      : null,
    customSkins: Array.isArray(raw.customSkins)
      ? raw.customSkins.filter(validCustomSkin).slice(0, 50)
      : []
  }
}
