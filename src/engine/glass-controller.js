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

export class GlassController {
  constructor() {
    this.styleEl = null
    this.refitObserver = null
    this.refitTargets = new Set()
    this.refitQueued = false
  }

  update({ enabled, glassTransparency = 10, bubbleOpacity = 100, composerFrost = 10, surfaceFrost = 8 }) {
    if (typeof document === 'undefined') return
    const root = document.documentElement
    if (!enabled) {
      root.removeAttribute('data-hermes-skins-active')
      const styleEl = this.styleEl || document.getElementById(STYLE_ID)
      styleEl?.remove()
      this.styleEl = null
      this.releaseRefitWatcher()
      return
    }
    if (!this.styleEl || !document.head.contains(this.styleEl)) {
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
    const keep = 100 - pct(glassTransparency, 10)
    // Floating text sits over other text, so it retains a readable veil while
    // still revealing the wallpaper. It follows the main lever above 70% fill.
    const floatingKeep = Math.max(keep, 70)
    const bubbleKeep = pct(bubbleOpacity, 100)
    const composerBlur = Math.min(20, Math.max(0, pct(composerFrost, 10)))
    const surfaceBlur = Math.min(20, Math.max(0, pct(surfaceFrost, 8)))

    // Frosted glass samples the wallpaper behind a surface; blur(0) would still
    // promote a composited layer, so the frost vars stay `none` when off.
    const frost = surfaceBlur > 0 ? `blur(${surfaceBlur}px)` : 'none'
    const composerFrostCss = composerBlur > 0 ? `blur(${composerBlur}px)` : 'none'

    // Terminal: xterm resolves --ui-terminal-surface-background to a concrete
    // color for its WebGL canvas, and the persistent host paints the same var
    // inline. With the host default (allowTransparency: false) an alpha color
    // would paint opaque glyph-cell plates over a translucent viewport, so the
    // var is pinned to the opaque chrome mix (the host's own glass mode does
    // exactly this) and the terminal reads solid — no fake blend-mode
    // transparency. Hosts patched by patches/hermes-desktop-terminal-alpha.patch
    // advertise via the data-hermes-terminal-alpha attribute and get a real
    // translucent mix. That mix must be a comma-form rgba() literal resolved
    // through a live probe: the raw color-mix chain would reach xterm as
    // "color(srgb …)" and paint the canvas black, and probing --ui-bg-chrome
    // keeps the value tracking the official light/dark mode on every sync.
    const terminalAlpha = root.dataset?.hermesTerminalAlpha === 'true'
    let terminalSurface = 'var(--ui-bg-chrome)'
    if (terminalAlpha && document.body) {
      const probe = document.createElement('span')
      probe.style.cssText = 'position:absolute;visibility:hidden;pointer-events:none;background-color:var(--ui-bg-chrome);'
      document.body.appendChild(probe)
      const base = parseSerializedColor(getComputedStyle(probe).backgroundColor)
      probe.remove()
      if (base) terminalSurface = `rgba(${base.r}, ${base.g}, ${base.b}, ${keep / 100})`
    }

    root.setAttribute('data-hermes-skins-active', 'true')
    this.styleEl.textContent = `
      :root[data-hermes-skins-active="true"] {
        --hermes-skins-keep: ${keep}%;
        --hermes-skins-chrome-tint: color-mix(in srgb, var(--ui-bg-chrome) var(--hermes-skins-keep), transparent);
        --hermes-skins-sidebar-tint: var(--hermes-skins-chrome-tint);
        --hermes-skins-editor-tint: var(--hermes-skins-chrome-tint);
        --hermes-skins-floating-tint: color-mix(in srgb, var(--ui-bg-chrome) ${floatingKeep}%, transparent);
        --hermes-skins-frost: ${frost};
        --hermes-skins-composer-frost: ${composerFrostCss};
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
        backdrop-filter: var(--hermes-skins-frost);
        -webkit-backdrop-filter: var(--hermes-skins-frost);
      }
      /* Frameless-window title bar: the popout shell declares --titlebar-height
         and its aria-hidden first child paints the opaque chrome strip. */
      :root[data-hermes-skins-active="true"] [data-contrib-shell][style*="--titlebar-height"] > div[aria-hidden="true"] {
        background-color: var(--hermes-skins-chrome-tint) !important;
        backdrop-filter: var(--hermes-skins-frost);
        -webkit-backdrop-filter: var(--hermes-skins-frost);
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
         tokens. These are the large white plates visible in Skin Center.
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
      /* Terminal surfaces resolve through --ui-terminal-surface-background: the
         fixed persistent host paints it inline and the xterm canvas paints the
         resolved theme background, so the plugin never restates the fill here —
         only the shared frost. On unpatched hosts the var is opaque and the
         canvas is a solid plate; patched hosts get the translucent literal.
         Remote-screen sharing must keep its real paint. */
      :root[data-hermes-skins-active="true"] [data-persistent-terminal],
      :root[data-hermes-skins-active="true"] [data-terminal]:not([data-remote-screen]) {
        backdrop-filter: var(--hermes-skins-frost);
        -webkit-backdrop-filter: var(--hermes-skins-frost);
      }
      :root[data-hermes-skins-active="true"] [data-persistent-terminal] :is(.xterm, .xterm-screen, .xterm-viewport),
      :root[data-hermes-skins-active="true"] [data-terminal]:not([data-remote-screen]) :is(.xterm, .xterm-screen, .xterm-viewport) {
        background-color: transparent !important;
      }
      ${terminalAlpha ? `
      /* xterm's alpha canvas owns the tint. Its two outer wrappers must not
         paint the same tint again or a 45% fill becomes an 83% solid plate. */
      :root[data-hermes-skins-active="true"] [data-persistent-terminal],
      :root[data-hermes-skins-active="true"] [data-terminal]:not([data-remote-screen]) {
        background-color: transparent !important;
      }` : ''}
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
    this.syncTerminalRefitWatcher()
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
    setTimeout(() => {
      this.refitQueued = false
      if (typeof window !== 'undefined') window.dispatchEvent(new Event('resize'))
    }, 150)
  }

  releaseRefitWatcher() {
    this.refitObserver?.disconnect()
    this.refitObserver = null
    this.refitTargets.clear()
    this.refitQueued = false
  }

  destroy() {
    this.releaseRefitWatcher()
    this.update({ enabled: false })
  }
}
