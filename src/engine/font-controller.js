const FONT_STYLE_ID = 'hermes-skins-font-css'
const SURFACES = ':is([data-chat-surface], [data-slot="sidebar"], [data-slot="composer-root"], [data-panel-header], [data-slot="statusbar"])'
const COMPONENT_SELECTORS = {
  markdown: '[data-chat-surface]',
  codeBlock: '[data-chat-surface] :is(pre, code, kbd)',
  terminal: ':is([data-terminal], [data-persistent-terminal])',
  table: '[data-chat-surface] :is(table, th, td)'
}
const ROLE_SELECTORS = {
  'markdown-h1': '[data-chat-surface] h1',
  'markdown-h2': '[data-chat-surface] h2',
  'markdown-h3': '[data-chat-surface] h3',
  'markdown-h4': '[data-chat-surface] h4',
  'markdown-base': '[data-chat-surface]',
  'markdown-small': '[data-chat-surface] :is(small, [data-slot="caption"])',
  'markdown-code': '[data-chat-surface] :not(pre) > code',
  'markdown-code-block': '[data-chat-surface] :is(pre, pre code)',
  'markdown-table': '[data-chat-surface] :is(table, th, td)',
  'markdown-table-head': '[data-chat-surface] th',
  'xs-13': '[data-panel-header], [data-slot="statusbar"]',
  'xxs-12': '[data-chat-surface] :is(.text-xs, small)'
}
const TEXT_TOKEN_ROLES = {
  primary: '--ui-text-primary',
  secondary: '--ui-text-secondary',
  tertiary: '--ui-text-tertiary',
  caption: '--ui-text-quaternary',
  dimmed: '--ui-text-quaternary'
}

const safeFamily = value => typeof value === 'string'
  ? value.replace(/[;{}<>"'\\\u0000-\u001f\u007f]/g, '').trim().slice(0, 200)
  : ''

export function fontFamilyStack(value) {
  const family = safeFamily(value)
  if (!family || family === 'inherit') return 'inherit'
  if (family.includes(',')) return family
  return `"${family}", var(--dt-font-sans, sans-serif)`
}

function roleCss(config) {
  const blocks = []
  for (const [role, selector] of Object.entries(ROLE_SELECTORS)) {
    const size = Number(config.themeSize?.[role]) || 0
    const weight = Number(config.themeWeight?.[role]) || 0
    const family = safeFamily(config.themeFamily?.[role])
    const declarations = []
    if (size >= 8 && size <= 48) declarations.push(`font-size:${size}px !important`)
    if (weight >= 100 && weight <= 900) declarations.push(`font-weight:${weight} !important`)
    if (family) declarations.push(`font-family:${fontFamilyStack(family)} !important`)
    if (declarations.length) blocks.push(`${selector}{${declarations.join(';')}}`)
  }
  return blocks.join('\n')
}

function componentCss(config) {
  const blocks = []
  for (const [id, selector] of Object.entries(COMPONENT_SELECTORS)) {
    const value = config.componentFonts?.[id]
    if (!value) continue
    const declarations = []
    if (Number(value.size) >= 8) declarations.push(`font-size:${Math.round(Number(value.size))}px !important`)
    if (Number(value.weight) >= 100) declarations.push(`font-weight:${Math.round(Number(value.weight))} !important`)
    const family = safeFamily(value.family)
    if (family) declarations.push(`font-family:${fontFamilyStack(family)} !important`)
    if (declarations.length) blocks.push(`${selector}{${declarations.join(';')}}`)
  }
  return blocks.join('\n')
}

function colorCss(config) {
  const blocks = []
  for (const mode of ['light', 'dark']) {
    const declarations = []
    for (const [role, token] of Object.entries(TEXT_TOKEN_ROLES)) {
      const pair = config.themeColors?.[role]
      const color = pair?.[config.themeDarkSeparate ? mode : 'light'] || pair?.dark || pair?.light
      if (/^#[0-9a-f]{6}$/i.test(color || '')) declarations.push(`${token}:${color}`)
    }
    if (declarations.length) {
      blocks.push(`:root[data-hermes-skins-text-colors="true"][data-hermes-mode="${mode}"]{${declarations.join(';')}}`)
    }
  }
  return blocks.join('\n')
}

function uiColorCss(config) {
  if (!config.uiColorCustom) return ''
  const accent = /^#[0-9a-f]{6}$/i.test(config.accent || '') ? config.accent : '#4f8cff'
  const send = /^#[0-9a-f]{6}$/i.test(config.uiColorSend || '') ? config.uiColorSend : accent
  const link = /^#[0-9a-f]{6}$/i.test(config.uiColorLink || '') ? config.uiColorLink : accent
  const file = /^#[0-9a-f]{6}$/i.test(config.uiColorFileIcon || '') ? config.uiColorFileIcon : link
  const tab = /^#[0-9a-f]{6}$/i.test(config.uiColorTab || '') ? config.uiColorTab : accent
  const deep = /^#[0-9a-f]{6}$/i.test(config.uiColorDeepDiving || '') ? config.uiColorDeepDiving : accent
  return `
    :root[data-hermes-skins-ui-colors="true"] {
      --we-accent:${accent};
      --ui-accent:${accent};
      --ui-accent-secondary:${accent};
      --theme-primary:${accent};
      --theme-midground:${accent};
      --ui-blue:${accent};
    }
    :root[data-hermes-skins-ui-colors="true"] [data-slot="composer-root"] button[type="submit"],
    :root[data-hermes-skins-ui-colors="true"] [data-slot="composer-root"] [data-primary] {
      background-color:${send} !important;
    }
    :root[data-hermes-skins-ui-colors="true"] [data-chat-surface] a,
    :root[data-hermes-skins-ui-colors="true"] [data-chat-surface] .text-primary {
      color:${link} !important;
    }
    :root[data-hermes-skins-ui-colors="true"] [data-presented-file] svg {
      color:${file} !important;
    }
    :root[data-hermes-skins-ui-colors="true"] [data-panel-header] [aria-selected="true"] {
      color:${tab} !important;
      border-color:${tab} !important;
    }
    :root[data-hermes-skins-ui-colors="true"] [data-deep-diving] {
      color:${deep} !important;
    }
  `
}

/** Applies custom typography without touching Hermes' theme registry. */
export class FontController {
  constructor({ setAccentOverride = null } = {}) {
    this.styleEl = null
    this.lastKey = null
    this.setAccentOverride = setAccentOverride
    this.lastAccent = null
  }

  update(config) {
    if (typeof document === 'undefined') return
    const root = document.documentElement
    const fontOn = config.fontCustom === true
    const colorsOn = fontOn && Object.keys(config.themeColors || {}).length > 0
    const uiColorsOn = config.uiColorCustom === true
    const caret = /^#[0-9a-f]{6}$/i.test(config.caretColor || '') ? config.caretColor : ''
    const globalFamily = safeFamily(config.globalFamily)
    const key = JSON.stringify({
      fontOn, colorsOn, uiColorsOn, caret, globalFamily,
      themeSize: config.themeSize, themeWeight: config.themeWeight,
      themeFamily: config.themeFamily, componentFonts: config.componentFonts,
      themeColors: config.themeColors, themeDarkSeparate: config.themeDarkSeparate,
      accent: config.accent, send: config.uiColorSend, link: config.uiColorLink,
      file: config.uiColorFileIcon, tab: config.uiColorTab, deep: config.uiColorDeepDiving
    })
    if (key === this.lastKey && this.styleEl?.isConnected) return
    this.lastKey = key

    if (fontOn) root.setAttribute('data-hermes-skins-font', 'true')
    else root.removeAttribute('data-hermes-skins-font')
    if (colorsOn) root.setAttribute('data-hermes-skins-text-colors', 'true')
    else root.removeAttribute('data-hermes-skins-text-colors')
    if (uiColorsOn) root.setAttribute('data-hermes-skins-ui-colors', 'true')
    else root.removeAttribute('data-hermes-skins-ui-colors')

    if (fontOn && globalFamily) root.style.setProperty('--hs-font-family', fontFamilyStack(globalFamily))
    else root.style.removeProperty('--hs-font-family')
    if (caret) root.style.setProperty('--hs-caret', caret)
    else root.style.removeProperty('--hs-caret')

    const baseSize = Number(config.themeSize?.['markdown-base']) || 0
    const smallSize = Number(config.themeSize?.['markdown-small']) || 0
    const codeSize = Number(config.themeSize?.['markdown-code-block']) || 0
    const tokenSizes = {
      '--conversation-text-base-size': baseSize,
      '--conversation-text-font-size': baseSize,
      '--conversation-caption-base-size': smallSize,
      '--conversation-caption-font-size': smallSize,
      '--conversation-tool-base-size': codeSize,
      '--conversation-tool-font-size': codeSize
    }
    for (const [name, value] of Object.entries(tokenSizes)) {
      if (fontOn && value >= 8) root.style.setProperty(name, `${value}px`)
      else root.style.removeProperty(name)
    }

    if (uiColorsOn) {
      const accent = /^#[0-9a-f]{6}$/i.test(config.accent || '') ? config.accent : null
      if (accent && accent !== this.lastAccent) {
        try { this.setAccentOverride?.(accent) } catch { /* SDK may be unavailable in isolated tests. */ }
        this.lastAccent = accent
      }
    } else if (this.lastAccent !== null) {
      try { this.setAccentOverride?.(null) } catch { /* ignored */ }
      this.lastAccent = null
    }

    const css = [
      fontOn ? `
        :root[data-hermes-skins-font="true"] ${SURFACES} {
          font-family:var(--hs-font-family, inherit) !important;
        }
        :root[data-hermes-skins-font="true"] [data-chat-surface] :is(input, textarea, [contenteditable="true"]),
        :root[data-hermes-skins-font="true"] [data-slot="composer-root"] :is(input, textarea, [contenteditable="true"]) {
          caret-color:var(--hs-caret, auto) !important;
        }
        ${roleCss(config)}
        ${componentCss(config)}
      ` : '',
      caret ? `
        :root :is(input, textarea, [contenteditable="true"]) {
          caret-color:${caret} !important;
        }
      ` : '',
      colorCss(config),
      uiColorCss(config)
    ].filter(Boolean).join('\n')

    if (!css.trim()) {
      this.styleEl?.remove()
      this.styleEl = null
      return
    }
    if (!this.styleEl || !this.styleEl.isConnected) {
      this.styleEl = document.getElementById(FONT_STYLE_ID) || document.createElement('style')
      this.styleEl.id = FONT_STYLE_ID
      this.styleEl.dataset.plugin = 'hermes-skins'
      if (!this.styleEl.isConnected) document.head.appendChild(this.styleEl)
    }
    this.styleEl.textContent = css
  }

  destroy() {
    this.update({ fontCustom: false, uiColorCustom: false, caretColor: '' })
    try { this.setAccentOverride?.(null) } catch { /* ignored */ }
  }
}
