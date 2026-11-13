/** Only changes the shell surfaces needed to show a wallpaper. */
const STYLE_ID = 'hermes-skins-runtime-css'
// PaneBody is the first structural painter in the current Hermes layout.
// Sidebar, conversation and file views mount INSIDE it rather than beside it.
const PANE_SURFACE = '[class*="bg-(--ui-editor-surface-background)"]'
const NESTED_SURFACES = ':is([data-chat-surface], [data-slot="sidebar"], [data-panel-header], [class*="bg-(--ui-editor-surface-background)"], [class*="bg-(--ui-sidebar-surface-background)"], [class*="bg-(--ui-chat-surface-background)"])'
const PROTECTED_SURFACES = ':not(:where([data-glass-opaque], [data-glass-opaque] *, [data-glass-raised], [data-glass-raised] *, [data-overlay-surface], [data-overlay-surface] *, [data-floating-pane], [data-floating-pane] *, [data-remote-screen], [data-remote-screen] *, [data-radix-popper-content-wrapper] *, [role="dialog"], [role="dialog"] *, [role="menu"], [role="menu"] *, [role="listbox"], [role="listbox"] *))'
const FLOATING_SURFACES = ':is([data-slot="dropdown-menu-content"], [data-slot="dropdown-menu-sub-content"], [data-slot="context-menu-content"], [data-slot="context-menu-sub-content"], [data-slot="select-content"], [data-slot="popover-content"], [data-slot="dialog-content"], [data-slot="alert-dialog-content"], [data-slot="sheet-content"], [data-slot="tooltip-content"], .tooltip-bubble, [role="menu"], [role="listbox"])'

/**
 * xterm's own color parser (css.toColor) only accepts hex and comma-form
 * rgba() for translucent colors; a color-mix() chain serializes as
 * "color(srgb … / a)", which falls through to the silent #000000 fallback and
 * paints the WebGL canvas pitch black. Structural tints stay CSS color-mix
 * chains, but the terminal surface — the one value a canvas reads back as a
 * string — must be resolved here into a literal.
 */
export function parseSerializedColor(text) {
  if (typeof text !== 'string') return null
  let match = text.match(/^color\((?:srgb|srgb-linear) ([\d.]+) ([\d.]+) ([\d.]+)(?: \/ ([\d.]+))?\)$/)
  if (match) {
    const channel = value => Math.round(Number(value) * 255)
    return {
      r: channel(match[1]), g: channel(match[2]), b: channel(match[3]),
      a: match[4] === undefined ? 1 : Number(match[4])
    }
  }
  match = text.match(/^rgba?\(([\d.]+),?\s*([\d.]+),?\s*([\d.]+)(?:\s*[,/]\s*([\d.]+))?\)$/)
  if (match) {
    return {
      r: Math.round(Number(match[1])), g: Math.round(Number(match[2])), b: Math.round(Number(match[3])),
      a: match[4] === undefined ? 1 : Number(match[4])
    }
  }
  match = text.match(/^#([0-9a-f]{6})$/i)
  if (match) {
    const value = parseInt(match[1], 16)
    return { r: (value >> 16) & 255, g: (value >> 8) & 255, b: value & 255, a: 1 }
  }
  return null
}

const TRANSPARENT_TERMINAL = 'rgba(0, 0, 0, 0)'

function isXtermTerminal(value) {
  return Boolean(
    value && typeof value === 'object' &&
    value.options && value._core && typeof value.refresh === 'function' &&
    value._core.optionsService &&
    typeof value._core.optionsService.onSpecificOptionChange === 'function'
  )
}

function isXtermAddon(value) {
  return Boolean(
    value && typeof value === 'object' &&
    value._terminal && '_renderer' in value && typeof value.dispose === 'function'
  )
}

/**
 * Hermes constructs xterm with allowTransparency:false. Its public React tree
 * still keeps both the Terminal and WebGL addon in refs, which is the only
 * supported way to change the already-created renderer without rebuilding the
 * host. Walk the owning fiber's hook list rather than guessing at minified
 * component names, so a host refactor keeps working as long as the refs do.
 */
export function findXtermTerminal(host) {
  if (!host || typeof host !== 'object') return null
  const fiberKey = Object.keys(host).find(name => name.startsWith('__reactFiber$'))
  if (!fiberKey) return null
  let fiber = host[fiberKey]
  const seenFibers = new Set()
  let terminal = null
  let addon = null
  for (let depth = 0; fiber && depth < 14; depth++, fiber = fiber.return) {
    for (const candidate of [fiber, fiber.alternate]) {
      if (!candidate || seenFibers.has(candidate)) continue
      seenFibers.add(candidate)
      let hook = candidate.memoizedState
      for (let index = 0; hook && index < 80; index++, hook = hook.next) {
        const value = hook.memoizedState?.current
        if (!terminal && isXtermTerminal(value)) terminal = value
        if (!addon && isXtermAddon(value)) addon = value
        if (terminal && addon) return { terminal, addon }
      }
    }
  }
  return terminal ? { terminal, addon } : null
}

export class GlassController {
  constructor() {
    this.styleEl = null
    this.refitObserver = null
    this.refitTargets = new Set()
    this.refitQueued = false
    this.refitTimer = null
    this.materialRule = null
    this.lastMaterialKey = null
    this.terminalThemeKey = null
    this.terminalBase = null
    this.terminalObserver = null
    this.terminalRecords = new Map()
    this.terminalHostStyles = new Map()
  }

  update({
    enabled, glassTransparency = 10, bubbleOpacity = 100, composerFrost = 10,
    surfaceFrost = 8, saturation = 150, border = 35, highlight = true,
    accent = '#4f8cff', glassColor = null, glassDarkSeparate = false,
    glassFidelity = 100, chatGlassFidelity = 100,
    settingsWindowTransparency = 20, settingsWindowBlur = 16,
    sidebarGlass = true, sidebarFollowGlobal = true, sidebarBlur = 16,
    sidebarAlpha = 60, sidebarColor = '#ffffff', leftSidebarGlass = true,
    leftSidebarCornerRadius = 'native', leftSidebarSquareTL = false,
    leftSidebarSquareTR = false, leftSidebarSquareBR = false, leftSidebarSquareBL = false,
    rightSidebarCornerRadius = 'native', rightSidebarSquareTL = false,
    rightSidebarSquareTR = false, rightSidebarSquareBR = false, rightSidebarSquareBL = false,
    titlebarGlass = true, isDark = true
  }) {
    if (typeof document === 'undefined') return
    const root = document.documentElement
    if (!enabled) {
      root.removeAttribute('data-hermes-skins-active')
      const styleEl = this.styleEl || document.getElementById(STYLE_ID)
      styleEl?.remove()
      this.styleEl = null
      this.materialRule = null
      this.lastMaterialKey = null
      this.terminalThemeKey = null
      this.releaseTerminalObserver()
      this.releaseRefitWatcher()
      return
    }
    if (!this.styleEl || !document.head.contains(this.styleEl)) {
      this.materialRule = null
      this.lastMaterialKey = null
      this.styleEl = document.getElementById(STYLE_ID) || document.createElement('style')
      this.styleEl.id = STYLE_ID
      this.styleEl.dataset.plugin = 'hermes-skins'
      if (!this.styleEl.isConnected) document.head.appendChild(this.styleEl)
    }

    // Material contract (see src/engine/config.js PARAM_RANGES): one lever,
    // one keep value, everywhere. No hidden floors or ceilings — panelGlass 0
    // paints the panels in their full theme fill, panelGlass 100 leaves the
    // structural fills fully transparent.
    const pct = (value, fallback) => {
      const n = Number(value)
      return Number.isFinite(n) ? Math.min(100, Math.max(0, n)) : fallback
    }
    const fidelity = Math.min(1, Math.max(0, Number(glassFidelity) / 100))
    const chatFidelity = Math.min(1, Math.max(0, Number(chatGlassFidelity) / 100))
    const keep = (100 - pct(glassTransparency, 10)) * (0.4 + 0.6 * fidelity)
    // Floating text sits over other text, so it retains a readable veil while
    // still revealing the wallpaper. It follows the main lever above 70% fill.
    const floatingKeep = Math.max(keep, 70)
    const overlayKeep = Math.min(100, Math.max(25, 100 - pct(settingsWindowTransparency, 20)))
    const bubbleKeep = pct(bubbleOpacity, 100) * (0.5 + 0.5 * chatFidelity)
    const composerBlur = Math.min(20, Math.max(0, pct(composerFrost, 10)))
    const surfaceBlur = Math.min(20, Math.max(0, pct(surfaceFrost, 8)))
    const overlayBlur = Math.min(60, Math.max(0, pct(settingsWindowBlur, 16)))

    // Frosted glass samples the wallpaper behind a surface; blur(0) would still
    // promote a composited layer, so the frost vars stay `none` when off.
    const saturate = Math.min(200, Math.max(100, Number.isFinite(Number(saturation)) ? Number(saturation) : 150))
    const borderAlpha = Math.min(1, Math.max(0, (Number.isFinite(Number(border)) ? Number(border) : 35) / 100))
    const highlightAlpha = highlight ? 0.16 : 0
    const frost = surfaceBlur > 0 ? `saturate(${saturate}%) blur(${surfaceBlur}px)` : 'none'
    const overlayFrost = overlayBlur > 0 ? `saturate(${saturate}%) blur(${overlayBlur}px)` : 'none'
    const overlayScrimFrost = 'none'
    const composerFrostCss = composerBlur > 0 ? `saturate(${saturate}%) blur(${composerBlur}px)` : 'none'
    const chosenGlassColor = glassColor && typeof glassColor === 'object'
      ? (isDark && glassDarkSeparate ? glassColor.dark : glassColor.light)
      : null
    const customTint = /^#[0-9a-f]{6}$/i.test(chosenGlassColor || '') &&
      String(chosenGlassColor).toLowerCase() !== '#ffffff'
      ? `color-mix(in srgb, ${chosenGlassColor} ${keep}%, transparent)`
      : null
    const chromeTint = customTint || `color-mix(in srgb, var(--ui-bg-chrome) ${keep}%, transparent)`
    const sidebarKeep = sidebarFollowGlobal ? keep : 100 - pct(sidebarAlpha, 60)
    const sidebarTint = !sidebarGlass || !leftSidebarGlass
      ? 'var(--ui-bg-sidebar)'
      : sidebarFollowGlobal
        ? chromeTint
        : `color-mix(in srgb, ${sidebarColor} ${sidebarKeep}%, transparent)`
    const sidebarFrost = sidebarFollowGlobal
      ? frost
      : sidebarBlur > 0 ? `saturate(${saturate}%) blur(${Math.min(60, sidebarBlur)}px)` : 'none'
    const titlebarTint = titlebarGlass ? chromeTint : 'var(--ui-bg-chrome)'
    const titlebarFrost = titlebarGlass ? frost : 'none'
    const cornerOf = (mode, square) => square ? '0px'
      : mode === 'native' ? 'var(--radius-lg, 12px)' : `${mode}px`
    const nativeCorners = leftSidebarCornerRadius === 'native' &&
      !leftSidebarSquareTL && !leftSidebarSquareTR &&
      !leftSidebarSquareBR && !leftSidebarSquareBL
    const sidebarRadius = nativeCorners ? 'revert'
      : `${cornerOf(leftSidebarCornerRadius, leftSidebarSquareTL)}
        ${cornerOf(leftSidebarCornerRadius, leftSidebarSquareTR)}
        ${cornerOf(leftSidebarCornerRadius, leftSidebarSquareBR)}
        ${cornerOf(leftSidebarCornerRadius, leftSidebarSquareBL)}`

    // Terminal: xterm resolves --ui-terminal-surface-background to a concrete
    // color for its WebGL canvas, and the persistent host paints the same var
    // inline. Unpatched hosts construct xterm with allowTransparency:false, so
    // CSS alone can only cover that opaque canvas, never reveal the wallpaper
    // through it. applyTerminalSurface() flips the live renderer to alpha and
    // the inner [data-terminal] owns the single glass fill; the outer persistent
    // wrapper stays clear so the 45% tint is not compounded into ~70% white.
    // Both literals come from the live --ui-bg-chrome probe because xterm
    // rejects color-mix/color(srgb) backgrounds.
    const terminalAlpha = root.dataset?.hermesTerminalAlpha === 'true'
    const themeKey = `${root.dataset?.hermesTheme}:${root.dataset?.hermesMode}:${root.className}:${root.style?.cssText || ''}`
    const terminalCanvasBlend = isDark ? 'screen' : 'multiply'
    const materialKey = `${keep}:${overlayKeep}:${bubbleKeep}:${composerBlur}:${surfaceBlur}:${overlayBlur}:${saturate}:${borderAlpha}:${highlightAlpha}:${terminalAlpha}:${terminalCanvasBlend}:${accent}:${chosenGlassColor}:${fidelity}:${chatFidelity}:${sidebarGlass}:${sidebarFollowGlobal}:${sidebarBlur}:${sidebarAlpha}:${sidebarColor}:${leftSidebarGlass}:${leftSidebarCornerRadius}:${leftSidebarSquareTL}:${leftSidebarSquareTR}:${leftSidebarSquareBR}:${leftSidebarSquareBL}:${rightSidebarCornerRadius}:${rightSidebarSquareTL}:${rightSidebarSquareTR}:${rightSidebarSquareBR}:${rightSidebarSquareBL}:${titlebarGlass}:${themeKey}`
    if (this.lastMaterialKey === materialKey && this.styleEl.isConnected) return
    let terminalSurface = 'var(--ui-bg-chrome)'
    let terminalTint = `color-mix(in srgb, var(--ui-bg-chrome) ${Math.max(32, keep)}%, transparent)`
    if (document.body) {
      // The resolved theme color only changes with the host theme. Reusing it
      // avoids an append -> getComputedStyle -> remove flush on every drag.
      if (this.terminalThemeKey !== themeKey) {
        const probe = document.createElement('span')
        probe.style.cssText = 'position:absolute;visibility:hidden;pointer-events:none;background-color:var(--ui-bg-chrome);'
        document.body.appendChild(probe)
        this.terminalBase = parseSerializedColor(getComputedStyle(probe).backgroundColor)
        probe.remove()
        this.terminalThemeKey = themeKey
      }
      const base = this.terminalBase
      if (base) {
        terminalTint = `rgba(${base.r}, ${base.g}, ${base.b}, ${keep / 100})`
        terminalSurface = `rgba(${base.r}, ${base.g}, ${base.b}, ${keep / 100})`
      }
    }

    if (root.getAttribute?.('data-hermes-skins-active') !== 'true') root.setAttribute('data-hermes-skins-active', 'true')
    if (this.materialRule) {
      // Keep the large selector sheet parsed and change only its material
      // properties. CSSOM edits do not enqueue childList mutation scans.
      const properties = {
        '--hermes-skins-keep': `${keep}%`,
        '--hermes-skins-floating-tint': `color-mix(in srgb, var(--ui-bg-chrome) ${floatingKeep}%, transparent)`,
        '--hermes-skins-overlay-tint': `color-mix(in srgb, var(--ui-bg-chrome) ${overlayKeep}%, transparent)`,
        '--hermes-skins-overlay-sidebar-tint': `color-mix(in srgb, var(--ui-bg-sidebar) ${Math.max(25, overlayKeep - 40)}%, transparent)`,
        '--hermes-skins-chrome-tint': chromeTint,
        '--hermes-skins-sidebar-tint': sidebarTint,
        '--hermes-skins-editor-tint': chromeTint,
        '--hermes-skins-frost': frost,
        '--hermes-skins-sidebar-frost': sidebarFrost,
        '--hermes-skins-terminal-tint': terminalTint,
        '--hermes-skins-terminal-canvas-blend': terminalCanvasBlend,
        '--hermes-skins-titlebar-tint': titlebarTint,
        '--hermes-skins-titlebar-frost': titlebarFrost,
        '--hermes-skins-overlay-frost': overlayFrost,
        '--hermes-skins-overlay-scrim-frost': overlayScrimFrost,
        '--hermes-skins-composer-frost': composerFrostCss,
        '--hermes-skins-glass-border': String(borderAlpha),
        '--hermes-skins-glass-highlight': String(highlightAlpha),
        '--hermes-skins-accent': accent,
        '--we-accent': accent,
        '--hermes-skins-fidelity': String(fidelity),
        '--hermes-skins-chat-fidelity': String(chatFidelity),
        '--hermes-skins-sidebar-radius': sidebarRadius,
        '--user-bubble-keep': `${bubbleKeep}%`,
        '--ui-terminal-surface-background': terminalSurface
      }
      for (const [name, value] of Object.entries(properties)) {
        if (this.materialRule.getPropertyValue(name).trim() !== value) {
          this.materialRule.setProperty(name, value, name === '--user-bubble-keep' ? 'important' : '')
        }
      }
      this.lastMaterialKey = materialKey
      return
    }
    const css = `
      :root[data-hermes-skins-active="true"] {
        --hermes-skins-keep: ${keep}%;
        --hermes-skins-chrome-tint: ${chromeTint};
        --hermes-skins-sidebar-tint: ${sidebarTint};
        --hermes-skins-editor-tint: ${chromeTint};
        --hermes-skins-floating-tint: color-mix(in srgb, var(--ui-bg-chrome) ${floatingKeep}%, transparent);
        --hermes-skins-overlay-tint: color-mix(in srgb, var(--ui-bg-chrome) ${overlayKeep}%, transparent);
        --hermes-skins-overlay-sidebar-tint: color-mix(in srgb, var(--ui-bg-sidebar) ${Math.max(25, overlayKeep - 40)}%, transparent);
        --hermes-skins-frost: ${frost};
        --hermes-skins-sidebar-frost: ${sidebarFrost};
        --hermes-skins-terminal-tint: ${terminalTint};
        --hermes-skins-terminal-canvas-blend: ${terminalCanvasBlend};
        --hermes-skins-titlebar-tint: ${titlebarTint};
        --hermes-skins-titlebar-frost: ${titlebarFrost};
        --hermes-skins-overlay-frost: ${overlayFrost};
        --hermes-skins-overlay-scrim-frost: ${overlayScrimFrost};
        --hermes-skins-composer-frost: ${composerFrostCss};
        --hermes-skins-glass-border: ${borderAlpha};
        --hermes-skins-glass-highlight: ${highlightAlpha};
        --hermes-skins-accent: ${accent};
        --we-accent: ${accent};
        --hermes-skins-fidelity: ${fidelity};
        --hermes-skins-chat-fidelity: ${chatFidelity};
        --hermes-skins-sidebar-radius: ${sidebarRadius};
        /* Bubble fill share. !important is required to outrank the host's own
           bubble-transparency lever, which publishes the same custom property
           as an inline style on <html>; while a wallpaper is showing this
           plugin's 0-100 lever is authoritative, and removing it (disable or
           unload) hands control straight back. 0% keeps only the text. */
        --user-bubble-keep: ${bubbleKeep}% !important;
        --ui-chat-surface-background: var(--hermes-skins-chrome-tint);
        --ui-sidebar-surface-background: var(--hermes-skins-sidebar-tint);
        --ui-editor-surface-background: var(--hermes-skins-editor-tint);
        /* --ui-bg-editor feeds --dt-card, which paints every bg-card surface
           (markdown code cards, file cards, the composer backing's stock
           fill). Left opaque it reads as solid white/black plates floating on
           the glass; routed through the editor tint it joins the one material.
           Floating interaction layers use a stronger translucent veil through
           their own token so they keep their content hierarchy. */
        --ui-bg-editor: var(--hermes-skins-editor-tint);
        --ui-bg-elevated: var(--hermes-skins-floating-tint);
        --dt-popover: var(--hermes-skins-floating-tint);
        /* --dt-background paints bg-background — most visibly the active
           segment of every segmented control, whose full-opacity white/black
           pill is the harshest leftover plate on a glass page. */
        --dt-background: var(--hermes-skins-chrome-tint);
        --ui-terminal-surface-background: ${terminalSurface};
      }
      /* The wallpaper is a fixed child of body. The host also paints body with
         the chat token, then paints the chat/sidebars again. That makes a 55%
         panel behave like two 45% veils (about 70% fill). Keep body clear and
         let each actual surface own exactly one tint. */
      :root[data-hermes-skins-active="true"] body {
        background: transparent !important;
      }
      /* Surfaces that mask sibling content keep their real paint (host
         contract — a see-through mask reads as text bleeding through text). */
      :root[data-hermes-skins-active="true"] [data-glass-opaque] {
        --ui-chat-surface-background: var(--ui-bg-chrome);
        --ui-editor-surface-background: var(--ui-bg-chrome);
        --ui-sidebar-surface-background: var(--ui-bg-sidebar);
        --ui-bg-editor: var(--ui-bg-chrome);
        --dt-background: var(--ui-bg-chrome);
      }
      /* The full-window painters between <body> and every surface step aside
         so the wallpaper layer is the only backdrop. The shell also opts out
         of the shared frost below: it spans the whole window, and a
         backdrop-filter here would blur the wallpaper itself instead of a
         surface above it. !important — the shell paints the chrome token
         through the same utility class the frost rule matches on, and the
         two selectors tie at (0,3,0). */
      :root[data-hermes-skins-active="true"] [data-contrib-shell] {
        position: relative;
        z-index: 1;
        background-color: transparent !important;
        backdrop-filter: none !important;
        -webkit-backdrop-filter: none !important;
      }
      :root[data-hermes-skins-active="true"] [data-slot="sidebar-wrapper"] {
        background-color: transparent !important;
        backdrop-filter: none !important;
        -webkit-backdrop-filter: none !important;
      }
      /* ChatRuntimeBoundary's message viewport repeats the outer chat fill and
         spans the whole chat column: restating either tint or frost here would
         stack a second veil / blur over everything inside. */
      :root[data-hermes-skins-active="true"] [data-chat-surface] [data-slot="composer-bounds"] {
        background-color: transparent !important;
        backdrop-filter: none;
        -webkit-backdrop-filter: none;
      }
      /* Shared frost: every surface that paints one of the structural tokens
         through a Tailwind utility gets exactly one blur. Covers the chat
         column, the right file/review columns, collapsed rails, pane headers
         and the status bar — the surfaces that used to frost only on some
         panes, which read as a different material on every region. None of
         them contain fixed-position descendants (verified against the running
         host: tooltips, popovers and floating composers portal out), so a
         backdrop-filter cannot re-anchor anything. bg-background surfaces
         (segmented-control active pills and friends) join the same treatment:
         a frosted pill keeps its selected-state affordance through the blur
         even at low keeps. */
      :root[data-hermes-skins-active="true"] [class*="bg-(--ui-sidebar-surface-background)"],
      :root[data-hermes-skins-active="true"] [class*="bg-(--ui-chat-surface-background)"],
      :root[data-hermes-skins-active="true"] [class*="bg-(--ui-editor-surface-background)"],
      :root[data-hermes-skins-active="true"] [class*="bg-(--ui-bg-chrome)"],
      :root[data-hermes-skins-active="true"] [class*="bg-background"] {
        backdrop-filter: var(--hermes-skins-frost);
        -webkit-backdrop-filter: var(--hermes-skins-frost);
      }
      /* Status bar chips (gateway status, session info) repaint the bar's own
         surface token on top of it — a 12% veil becomes ~23% patches inside
         the strip. The bar is the single fill; chips stay transparent. */
      :root[data-hermes-skins-active="true"] [data-slot="statusbar"] [class*="bg-(--ui-sidebar-surface-background)"],
      :root[data-hermes-skins-active="true"] [data-slot="statusbar"] [class*="bg-(--ui-bg-chrome)"] {
        background-color: transparent !important;
        backdrop-filter: none;
        -webkit-backdrop-filter: none;
      }
      /* Structural panels that paint with opaque Tailwind utilities (bg-sidebar
         & co. resolve to fixed theme colors, not the surface tokens) need their
         fill restated. Everything routes through the same tint vars, so
         light/dark only changes the theme seed underneath. */
      :root[data-hermes-skins-active="true"] [data-slot="sidebar"] {
        background-color: var(--hermes-skins-sidebar-tint) !important;
        backdrop-filter: var(--hermes-skins-sidebar-frost);
        -webkit-backdrop-filter: var(--hermes-skins-sidebar-frost);
        border-radius: var(--hermes-skins-sidebar-radius, revert);
        box-shadow: inset 0 1px 0 rgba(255, 255, 255, var(--hermes-skins-glass-highlight)),
          inset 0 0 0 1px rgba(255, 255, 255, var(--hermes-skins-glass-border));
      }
      /* Frameless-window title bar: the popout shell declares --titlebar-height
         and its aria-hidden first child paints the opaque chrome strip. */
      :root[data-hermes-skins-active="true"] [data-contrib-shell][style*="--titlebar-height"] > div[aria-hidden="true"] {
        background-color: var(--hermes-skins-titlebar-tint) !important;
        backdrop-filter: var(--hermes-skins-titlebar-frost);
        -webkit-backdrop-filter: var(--hermes-skins-titlebar-frost);
      }
      /* Token-painted structural surfaces (status bar, pane headers) restated
         for builds that paint them without the utility class; the frost is the
         shared one. Painting the tint twice on one box would stack two
         translucent fills, so these stay the only extra tint rules. */
      :root[data-hermes-skins-active="true"] [data-slot="statusbar"],
      :root[data-hermes-skins-active="true"] [data-panel-header] {
        /* Native Glass sidebar scope sets an opaque token on the footer.
           Override it locally as well as painting the outer surface, so
           descendants cannot inherit a different material. */
        --ui-sidebar-surface-background: var(--hermes-skins-sidebar-tint) !important;
        background-color: var(--hermes-skins-chrome-tint) !important;
        backdrop-filter: var(--hermes-skins-frost);
        -webkit-backdrop-filter: var(--hermes-skins-frost);
        box-shadow: inset 0 1px 0 rgba(255, 255, 255, var(--hermes-skins-glass-highlight));
      }
      /* Pane tab strip: the pane header behind it is the single structural
         fill. The strip's own utility fill — and the inactive-tab fill it
         publishes through --pane-tab-strip-bg — would stack a second (active
         tabs a third) veil on the same box and read as a brighter, harder top
         bar. The active underline and hover darken stay as the affordances. */
      :root[data-hermes-skins-active="true"] [data-panel-header] [class*="group/pane-header"] {
        background-color: transparent !important;
        --pane-tab-strip-bg: transparent;
        backdrop-filter: none;
        -webkit-backdrop-filter: none;
      }
      /* Plugin SDK cards use bg-card/bg-background, not Hermes' surface
         tokens. These are the large white plates visible in the plugin settings.
         Scope the fix to our marked cards so other apps' readability is not
         changed; nested wallpaper thumbnails do not stack another veil. */
      :root[data-hermes-skins-active="true"] [data-hermes-skins-surface] {
        background-color: var(--hermes-skins-editor-tint) !important;
        backdrop-filter: var(--hermes-skins-frost);
        -webkit-backdrop-filter: var(--hermes-skins-frost);
      }
      :root[data-hermes-skins-active="true"] [data-hermes-skins-surface] [data-hermes-skins-surface] {
        background-color: transparent !important;
        backdrop-filter: none;
        -webkit-backdrop-filter: none;
      }
      /* A plugin page already sits on the host's structural pane fill. Its
         cards and heading define groups through borders, not a second veil.
         Limit this to our page; raised menus and opaque masks keep their paint. */
      :root[data-hermes-skins-active="true"] [data-hermes-skins-page] [data-hermes-skins-surface],
      :root[data-hermes-skins-active="true"] [data-hermes-skins-page] > header,
      :root[data-hermes-skins-active="true"] [data-chat-surface] [data-panel-header],
      :root[data-hermes-skins-active="true"] [data-slot="sidebar"] [data-panel-header] {
        background-color: transparent !important;
        backdrop-filter: none;
        -webkit-backdrop-filter: none;
      }
      /* A pane body already owns the tint. Clearing only plugin cards missed
         the real app: a conversation/sidebar inside PaneBody painted it again
         (20% + 20% = 36%), while the footer stayed at 20%. Apply the same rule
         to all structural descendants, including nested file views. Masks and
         raised/portaled interaction layers remain independent painters. */
      :root[data-hermes-skins-active="true"] ${PANE_SURFACE} ${NESTED_SURFACES}${PROTECTED_SURFACES} {
        background-color: transparent !important;
        backdrop-filter: none !important;
        -webkit-backdrop-filter: none !important;
      }
      /* Shared floating material: SDK menus use hard-coded 92/96% mixes and
         some status-bar panels use bg-popover. Restate the actual outer box,
         not just the token. Color-category chips, selection highlights and
         deliberate primary/accent surfaces keep their semantic colors. */
      :root[data-hermes-skins-active="true"] ${FLOATING_SURFACES}:not([class*="dt-primary-solid"], [class*="bg-black"]) {
        --popover-surface: var(--hermes-skins-floating-tint) !important;
        --dt-popover: var(--hermes-skins-floating-tint);
        --dt-muted-foreground: var(--ui-text-primary);
        background-color: var(--hermes-skins-floating-tint) !important;
        backdrop-filter: var(--hermes-skins-frost) !important;
        -webkit-backdrop-filter: var(--hermes-skins-frost) !important;
        color: var(--ui-text-primary) !important;
      }
      /* A nested cmdk list/card belongs to its popover; it must not paint a
         second veil. Arrow shapes still receive --popover-surface separately. */
      :root[data-hermes-skins-active="true"] ${FLOATING_SURFACES} :is([data-slot="command"], [class~="bg-popover"], [class~="bg-card"], [class~="bg-background"]):not(${FLOATING_SURFACES}) {
        background-color: transparent !important;
        backdrop-filter: none !important;
        -webkit-backdrop-filter: none !important;
      }
      :root[data-hermes-skins-active="true"] .tooltip-bubble [data-slot="tooltip-arrow"] {
        fill: var(--hermes-skins-floating-tint);
      }
      /* Overlay modal cards (Settings, Command Center, Profiles) and raised glass surfaces:
         instead of opaque 94-100% white/black slabs, they join the frosted glass style
         with clean text readability and wallpaper translucency. */
      :root[data-hermes-skins-active="true"] [data-overlay-surface] {
        background-color: color-mix(in srgb, #000 18%, transparent) !important;
        backdrop-filter: var(--hermes-skins-overlay-scrim-frost) !important;
        -webkit-backdrop-filter: var(--hermes-skins-overlay-scrim-frost) !important;
      }
      :root[data-hermes-skins-active="true"] [data-glass-raised] {
        --ui-chat-surface-background: var(--hermes-skins-overlay-tint) !important;
        --ui-sidebar-surface-background: var(--hermes-skins-overlay-sidebar-tint) !important;
        --ui-editor-surface-background: var(--hermes-skins-overlay-tint) !important;
        background-color: var(--hermes-skins-overlay-tint) !important;
        backdrop-filter: var(--hermes-skins-overlay-frost) !important;
        -webkit-backdrop-filter: var(--hermes-skins-overlay-frost) !important;
        box-shadow: 0 16px 40px rgba(0, 0, 0, 0.2),
          0 0 0 1px color-mix(in srgb, var(--dt-border) 40%, transparent),
          inset 0 1px 0 rgba(255, 255, 255, var(--hermes-skins-glass-highlight)) !important;
      }
      /* Left sidebar in overlay cards: single layer translucency to avoid double-darkening */
      :root[data-hermes-skins-active="true"] [data-glass-raised] aside,
      :root[data-hermes-skins-active="true"] [data-glass-raised] [class*="bg-(--ui-sidebar-surface-background)"] {
        background-color: var(--hermes-skins-overlay-sidebar-tint) !important;
        backdrop-filter: none !important;
        -webkit-backdrop-filter: none !important;
        border-right: 1px solid color-mix(in srgb, var(--ui-stroke-secondary) 50%, transparent) !important;
      }
      :root[data-hermes-skins-active="true"] [data-glass-raised] main {
        background-color: transparent !important;
      }
      /* Titlebar pill buttons (like Search) and opaque badges in overlays */
      :root[data-hermes-skins-active="true"] [data-overlay-surface] [data-glass-opaque] {
        background-color: color-mix(in srgb, var(--ui-bg-chrome) 60%, transparent) !important;
        backdrop-filter: none !important;
        -webkit-backdrop-filter: none !important;
        border-color: color-mix(in srgb, var(--ui-stroke-secondary) 60%, transparent) !important;
      }
      /* Radix dialogs and floating dialog contents */
      :root[data-hermes-skins-active="true"] [role="dialog"]:not([data-overlay-surface]),
      :root[data-hermes-skins-active="true"] [data-slot="dialog-content"] {
        background-color: var(--hermes-skins-overlay-tint) !important;
        backdrop-filter: var(--hermes-skins-overlay-frost) !important;
        -webkit-backdrop-filter: var(--hermes-skins-overlay-frost) !important;
      }
      /* The persistent terminal host paints its opaque token inline and seals
         the box with contain:size layout paint. Remove that isolation, keep
         the outer positioning wrapper clear, and let the inner terminal own
         exactly one glass fill. Stacking the same 45% tint on both wrappers
         turns the panel into an almost-solid white plate. Remote-screen
         sharing keeps its real paint. */
      :root[data-hermes-skins-active="true"] [data-persistent-terminal] {
        background-color: transparent !important;
        border-radius: 10px;
        contain: size layout !important;
        isolation: auto !important;
        backdrop-filter: none !important;
        -webkit-backdrop-filter: none !important;
      }
      :root[data-hermes-skins-active="true"] [data-terminal]:not([data-remote-screen]) {
        background-color: var(--hermes-skins-terminal-tint, var(--hermes-skins-chrome-tint)) !important;
        border-radius: 10px;
        box-shadow: inset 0 1px 0 rgba(255, 255, 255, var(--hermes-skins-glass-highlight)),
          inset 0 0 0 1px rgba(255, 255, 255, var(--hermes-skins-glass-border));
        contain: size layout !important;
        isolation: auto !important;
        /* The rest of the Hermes surface stack does not carry this extra
           blur. A terminal-only blur turns the same 45% tint into a milky
           plate and visibly separates the terminal from the sidebars. */
        backdrop-filter: none !important;
        -webkit-backdrop-filter: none !important;
      }
      /* The persistent terminal is a fixed overlay on top of the editor pane,
         and that pane already paints the shared 45% glass. Painting the same
         tint again here compounds two 45% veils into ~70% white. Keep only the
         parent pane's single fill; the xterm canvas above it is transparent. */
      :root[data-hermes-skins-active="true"] [data-persistent-terminal] [data-terminal]:not([data-remote-screen]) {
        background-color: transparent !important;
      }
      :root[data-hermes-skins-active="true"] [data-persistent-terminal] :is(.xterm, .xterm-screen, .xterm-viewport, .xterm-scrollable-element),
      :root[data-hermes-skins-active="true"] [data-terminal]:not([data-remote-screen]) :is(.xterm, .xterm-screen, .xterm-viewport, .xterm-scrollable-element),
      :root[data-hermes-skins-active="true"] [class*="bg-(--ui-terminal-surface-background)"]:not([data-terminal]):not([data-persistent-terminal]),
      :root[data-hermes-skins-active="true"] [class*="[&_.xterm-screen]"][class*="bg-(--ui-terminal-surface-background)"],
      :root[data-hermes-skins-active="true"] [class*="[&_.xterm-viewport]"][class*="bg-(--ui-terminal-surface-background)"] {
        background-color: transparent !important;
      }
      :root[data-hermes-skins-active="true"] [data-persistent-terminal] :is(.xterm-screen, .xterm-viewport) :is(canvas, .xterm-link-layer),
      :root[data-hermes-skins-active="true"] [data-terminal]:not([data-remote-screen]) :is(.xterm-screen, .xterm-viewport) :is(canvas, .xterm-link-layer) {
        mix-blend-mode: var(--hermes-skins-terminal-canvas-blend, normal) !important;
      }
      :root[data-hermes-skins-active="true"] [data-persistent-terminal] .xterm-link-layer,
      :root[data-hermes-skins-active="true"] [data-terminal]:not([data-remote-screen]) .xterm-link-layer {
        mix-blend-mode: normal !important;
      }
      /* Composer: the fill joins the structural keep (one lever), and the
         frost sits ON the composer surface itself — backdrop-filter never
         touches an element's own content, so placeholder and typed text stay
         sharp while the wallpaper shows through the blur. The previous fixed
         overlay layer competed in the root stacking context at a positive
         z-index and frosted the card and its text along with everything else;
         it is gone. The host composer has no fixed-position descendants
         (completion drawers are absolute, tooltips portal out), so the filter
         cannot re-anchor anything. */
      :root[data-hermes-skins-active="true"] [data-slot="composer-root"] {
        --composer-fill: color-mix(in srgb, var(--ui-bg-chrome) var(--hermes-skins-keep), transparent);
      }
      :root[data-hermes-skins-active="true"] [data-hud-shell] [data-slot="composer-root"] {
        /* HUD mode pins an opaque dock fill so its overlay bar and everything
           docked to it stay readable — keep the host's intent. */
        --composer-fill: var(--dt-card);
      }
      :root[data-hermes-skins-active="true"] [data-slot="composer-surface"] {
        backdrop-filter: var(--hermes-skins-composer-frost);
        -webkit-backdrop-filter: var(--hermes-skins-composer-frost);
      }
    `
    if (this.styleEl.textContent !== css) this.styleEl.textContent = css
    this.materialRule = this.styleEl.sheet?.cssRules?.[0]?.style || null
    this.lastMaterialKey = materialKey
    this.syncTerminalObserver()
    this.syncTerminalRefitWatcher()
  }

  /** Hermes writes terminal backgrounds inline and xterm can replace its
   *  canvases after mount. Reapply the two authoritative rules whenever that
   *  subtree changes, so a hot reload cannot leave a white terminal plate. */
  syncTerminalObserver() {
    if (typeof MutationObserver !== 'function' || typeof document === 'undefined') return
    if (this.terminalObserver) return
    this.terminalObserver = new MutationObserver(entries => {
      for (const entry of entries) {
        const target = entry.target
        if (!target || target.nodeType !== 1) continue
        this.applyTerminalSurface(target)
      }
    })
    this.terminalObserver.observe(document.body, {
      attributes: true,
      attributeFilter: ['style', 'class'],
      childList: true,
      subtree: true
    })
    this.applyTerminalSurface(document.body)
  }

  applyTerminalSurface(root) {
    if (typeof document === 'undefined' || !root || typeof root.querySelectorAll !== 'function') return
    const active = document.documentElement.getAttribute?.('data-hermes-skins-active') === 'true'
    const blend = getComputedStyle(document.documentElement)
      .getPropertyValue('--hermes-skins-terminal-canvas-blend').trim() || 'normal'
    const hosts = []
    if (root.matches?.('[data-terminal]:not([data-remote-screen]), [data-persistent-terminal]')) hosts.push(root)
    hosts.push(...(root.querySelectorAll?.('[data-terminal]:not([data-remote-screen]), [data-persistent-terminal]') || []))
    for (const host of hosts) {
      if (!host?.style || typeof host.querySelectorAll !== 'function') continue
      if (host.dataset.hsTerminalOwned !== 'true') {
        if (typeof host.style.getPropertyValue === 'function') {
          this.terminalHostStyles.set(host, {
            contain: host.style.getPropertyValue('contain'),
            containPriority: host.style.getPropertyPriority('contain'),
            isolation: host.style.getPropertyValue('isolation'),
            isolationPriority: host.style.getPropertyPriority('isolation')
          })
        }
        host.dataset.hsTerminalOwned = 'true'
        host.style.setProperty('contain', 'size layout', 'important')
        host.style.setProperty('isolation', 'auto', 'important')
      }
      const alpha = this.ensureTerminalTransparency(host)
      const surfaces = host.querySelectorAll?.('.xterm, .xterm-screen, .xterm-viewport, .xterm-scrollable-element') || []
      for (const surface of surfaces) {
        if (active) surface.style.setProperty('background-color', 'transparent', 'important')
        else surface.style.removeProperty('background-color')
      }
      const canvases = host.querySelectorAll?.('.xterm-screen canvas') || []
      for (const canvas of canvases) {
        if (active) canvas.style.setProperty('mix-blend-mode',
          canvas.classList.contains('xterm-link-layer') || alpha ? 'normal' : blend, 'important')
        else canvas.style.removeProperty('mix-blend-mode')
      }
    }
    const shellSurfaces = []
    if (root.matches?.('[class*="bg-(--ui-terminal-surface-background)"]') &&
        !root.matches?.('[data-terminal], [data-persistent-terminal]')) shellSurfaces.push(root)
    shellSurfaces.push(...(root.querySelectorAll?.('[class*="bg-(--ui-terminal-surface-background)"]') || []))
    for (const surface of shellSurfaces) {
      if (surface.matches?.('[data-terminal], [data-persistent-terminal]')) continue
      if (active) surface.style.setProperty('background-color', 'transparent', 'important')
      else surface.style.removeProperty('background-color')
    }
  }

  ensureTerminalTransparency(host) {
    const found = findXtermTerminal(host)
    if (!found?.terminal) return false
    const { terminal, addon } = found
    let record = this.terminalRecords.get(terminal)
    if (!record) {
      record = {
        terminal,
        addon: null,
        hostTheme: { ...(terminal.options?.theme || {}) },
        originalAllowTransparency: terminal.options?.allowTransparency,
        unsubscribe: null,
        enforcing: false,
        restoring: false
      }
      const optionsService = terminal._core?.optionsService
      const subscription = optionsService?.onSpecificOptionChange?.('theme', () => {
        if (record.restoring) return
        const liveTheme = terminal.options?.theme
        if (liveTheme && !record.enforcing) record.hostTheme = { ...liveTheme }
        this.applyTerminalTransparency(record)
      })
      record.unsubscribe = typeof subscription === 'function'
        ? subscription
        : () => subscription?.dispose?.()
      this.terminalRecords.set(terminal, record)
    }
    if (addon) record.addon = addon
    this.applyTerminalTransparency(record)
    host.dataset.hsTerminalAlpha = 'true'
    return true
  }

  applyTerminalTransparency(record) {
    if (!record || record.restoring || record.enforcing) return
    const { terminal } = record
    record.enforcing = true
    let changed = false
    try {
      try {
        if (terminal.options?.allowTransparency !== true) {
          terminal.options.allowTransparency = true
          changed = true
        }
      } catch {}
      const theme = terminal.options?.theme || {}
      if (theme.background !== TRANSPARENT_TERMINAL || theme.cursorAccent !== TRANSPARENT_TERMINAL) {
        terminal.options.theme = {
          ...theme,
          background: TRANSPARENT_TERMINAL,
          cursorAccent: TRANSPARENT_TERMINAL
        }
        changed = true
      }
      const renderer = record.addon?._renderer || terminal._core?._renderService?._renderer?.value
      const atlasConfig = renderer?._charAtlas?._config
      if (atlasConfig && atlasConfig.allowTransparency !== true) {
        atlasConfig.allowTransparency = true
        changed = true
      }
      const rectangleRenderer = renderer?._rectangleRenderer?.value || renderer?._rectangleRenderer
      if (rectangleRenderer?._bgFloat?.[3] !== 0) {
        rectangleRenderer._bgFloat[3] = 0
        changed = true
      }
      if (changed) {
        try { record.addon?.clearTextureAtlas?.() } catch {}
        try { terminal.refresh(0, Math.max(0, terminal.rows - 1)) } catch {}
      }
    } finally {
      record.enforcing = false
    }
  }

  restoreTerminalTransparency() {
    for (const record of this.terminalRecords.values()) {
      record.restoring = true
      try {
        record.unsubscribe?.()
        const { terminal } = record
        try {
          if (record.hostTheme && Object.keys(record.hostTheme).length) {
            terminal.options.theme = { ...record.hostTheme }
          }
          terminal.options.allowTransparency = record.originalAllowTransparency
        } catch {}
        const renderer = record.addon?._renderer || terminal._core?._renderService?._renderer?.value
        if (renderer?._charAtlas?._config) {
          renderer._charAtlas._config.allowTransparency = record.originalAllowTransparency === true
        }
        try { record.addon?.clearTextureAtlas?.() } catch {}
        try { terminal.refresh(0, Math.max(0, terminal.rows - 1)) } catch {}
      } finally {
        record.restoring = false
      }
    }
    this.terminalRecords.clear()
  }

  releaseTerminalObserver() {
    this.terminalObserver?.disconnect()
    this.terminalObserver = null
    this.restoreTerminalTransparency()
    if (typeof document === 'undefined' || typeof document.querySelectorAll !== 'function') return
    if (typeof document !== 'undefined') {
      const restoreProperty = (host, name, value, priority) => {
        if (value) host.style?.setProperty?.(name, value, priority)
        else host.style?.removeProperty?.(name)
      }
      for (const [host, original] of this.terminalHostStyles) {
        restoreProperty(host, 'contain', original.contain, original.containPriority)
        restoreProperty(host, 'isolation', original.isolation, original.isolationPriority)
      }
      this.terminalHostStyles.clear()
      for (const host of document.querySelectorAll('[data-hs-terminal-owned]')) {
        delete host.dataset.hsTerminalOwned
        delete host.dataset.hsTerminalAlpha
      }
      for (const surface of document.querySelectorAll('[data-terminal] .xterm, [data-terminal] .xterm-screen, [data-terminal] .xterm-viewport, [data-terminal] .xterm-scrollable-element, [data-persistent-terminal] .xterm, [data-persistent-terminal] .xterm-screen, [data-persistent-terminal] .xterm-viewport, [data-persistent-terminal] .xterm-scrollable-element')) {
        surface.style?.removeProperty?.('background-color')
      }
      for (const surface of document.querySelectorAll('[class*="bg-(--ui-terminal-surface-background)"]:not([data-terminal]):not([data-persistent-terminal])')) {
        surface.style?.removeProperty?.('background-color')
      }
      for (const canvas of document.querySelectorAll('[data-terminal] .xterm-screen canvas, [data-persistent-terminal] .xterm-screen canvas')) {
        canvas.style?.removeProperty?.('mix-blend-mode')
      }
    }
  }

  /** xterm's WebGL canvas keeps its last fitted size; when a terminal pane
   *  grows (tab switch, split, window resize) the freshly exposed area shows
   *  raw wallpaper while the old canvas area keeps its tint — the split
   *  surface users report as a broken terminal. Nudge the host's resize
   *  handling whenever a terminal box actually changes size. The dispatch is
   *  debounced and ResizeObserver only fires on real size changes, so the
   *  loop terminates. */
  syncTerminalRefitWatcher() {
    if (typeof document === 'undefined' || typeof ResizeObserver !== 'function') return
    if (!this.refitObserver) {
      this.refitObserver = new ResizeObserver(() => this.queueRefitNudge())
    }
    const terminals = document.querySelectorAll('[data-terminal]:not([data-remote-screen]), [data-persistent-terminal]')
    const seen = new Set()
    for (const el of terminals) {
      seen.add(el)
      if (!this.refitTargets.has(el)) {
        this.refitTargets.add(el)
        this.refitObserver.observe(el)
      }
    }
    for (const el of [...this.refitTargets]) {
      if (!seen.has(el)) {
        this.refitTargets.delete(el)
        this.refitObserver.unobserve(el)
      }
    }
  }

  queueRefitNudge() {
    if (this.refitQueued) return
    this.refitQueued = true
    this.refitTimer = setTimeout(() => {
      this.refitTimer = null
      this.refitQueued = false
      if (typeof window !== 'undefined') window.dispatchEvent(new Event('resize'))
    }, 150)
  }

  releaseRefitWatcher() {
    if (this.refitTimer !== null) clearTimeout(this.refitTimer)
    this.refitTimer = null
    this.refitObserver?.disconnect()
    this.refitObserver = null
    this.refitTargets.clear()
    this.refitQueued = false
  }

  destroy() {
    this.releaseTerminalObserver()
    this.releaseRefitWatcher()
    this.update({ enabled: false })
  }
}
