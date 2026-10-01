/**
 * Glass & Style Controller for Hermes Desktop
 * Manages scoped runtime CSS, glassmorphism transparency, bubble opacity and composer frost.
 */

const STYLE_ID = 'hermes-skins-runtime-css'

export class GlassController {
  constructor() {
    this.styleEl = null
  }

  ensureStyleElement() {
    if (typeof document === 'undefined') return
    if (!this.styleEl || !document.head.contains(this.styleEl)) {
      let el = document.getElementById(STYLE_ID)
      if (!el) {
        el = document.createElement('style')
        el.id = STYLE_ID
        el.dataset.plugin = 'hermes-skins'
        document.head.appendChild(el)
      }
      this.styleEl = el
    }
  }

  update({
    enabled,
    glassTransparency = 80,
    bubbleOpacity = 90,
    composerFrost = 12,
    customCSS = '',
    isDark = true
  }) {
    if (typeof document === 'undefined') return
    this.ensureStyleElement()

    const root = document.documentElement

    if (!enabled) {
      root.removeAttribute('data-hermes-skins-active')
      if (this.styleEl) {
        this.styleEl.textContent = ''
      }
      return
    }

    root.setAttribute('data-hermes-skins-active', 'true')

    const glassKeep = Math.min(Math.max(100 - glassTransparency, 0), 100)
    const bubbleKeep = Math.min(Math.max(bubbleOpacity, 0), 100)
    const frostBlur = Math.min(Math.max(composerFrost, 0), 30)

    const baseChrome = isDark ? 'rgba(10, 15, 28, 0.45)' : 'rgba(255, 255, 255, 0.55)'
    const sidebarChrome = isDark ? 'rgba(8, 12, 22, 0.65)' : 'rgba(248, 250, 252, 0.72)'
    const cardChrome = isDark ? 'rgba(19, 29, 56, 0.6)' : 'rgba(255, 255, 255, 0.75)'

    const css = `
      /* Root variables driven by Hermes Skins */
      :root[data-hermes-skins-active="true"] {
        --user-bubble-keep: ${bubbleKeep}%;
        --translucency-glass-keep: ${glassKeep}%;
        --ui-chat-surface-background: ${glassKeep === 0 ? 'transparent' : `color-mix(in srgb, var(--ui-bg-chrome, #0d1117) ${glassKeep}%, transparent)`};
        --ui-editor-surface-background: ${glassKeep === 0 ? 'transparent' : `color-mix(in srgb, var(--ui-bg-editor, #0d1117) ${glassKeep}%, transparent)`};
      }

      /* Chat container and transcript translucency */
      :root[data-hermes-skins-active="true"] [data-contrib-shell],
      :root[data-hermes-skins-active="true"] [data-slot="sidebar-wrapper"] {
        background-color: transparent !important;
      }

      /* Translucent Sidebar */
      :root[data-hermes-skins-active="true"] [data-slot="sidebar"] {
        background: ${sidebarChrome} !important;
        backdrop-filter: blur(16px) saturate(180%);
        -webkit-backdrop-filter: blur(16px) saturate(180%);
      }

      /* Chat viewport frosted glass cards */
      :root[data-hermes-skins-active="true"] .hermes-skins-card-translucent {
        background: ${cardChrome};
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        border: 1px solid rgba(255, 255, 255, 0.1);
      }

      /* Composer Rich Input Frost Glass */
      :root[data-hermes-skins-active="true"] [data-slot="composer-rich-input"] {
        backdrop-filter: blur(${frostBlur}px) saturate(150%);
        -webkit-backdrop-filter: blur(${frostBlur}px) saturate(150%);
        background: ${baseChrome} !important;
        transition: border-color 0.2s ease, box-shadow 0.2s ease;
      }

      /* Chat messages bubble alpha adaptation */
      :root[data-hermes-skins-active="true"] [data-slot="aui_user-message-root"] button,
      :root[data-hermes-skins-active="true"] [data-slot="aui_user-message-root"] [data-glass-raised] {
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
      }

      /* Custom CSS from skin author */
      ${customCSS || ''}
    `

    this.styleEl.textContent = css
  }

  destroy() {
    if (typeof document !== 'undefined') {
      document.documentElement.removeAttribute('data-hermes-skins-active')
      if (this.styleEl && this.styleEl.parentNode) {
        this.styleEl.parentNode.removeChild(this.styleEl)
      }
    }
    this.styleEl = null
  }
}
