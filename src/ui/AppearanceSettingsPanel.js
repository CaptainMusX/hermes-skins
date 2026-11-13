import { Button, Input, Switch, usePluginI18n, useValue } from '@hermes/plugin-sdk'
import { useEffect, useState } from 'react'
import { jsx, jsxs } from 'react/jsx-runtime'
import { normalizeMediaSource } from '../engine/backdrop-manager.js'
import {
  DEFAULT_CONFIG, FX_BLEND_VALUES, FX_CLICK_STYLES, FX_COLOR_MODES, FX_TRAIL_STYLES,
  PARAM_RANGES, PICKER_LAYOUTS, TRANSITION_DIRECTIONS, TRANSITION_SPEEDS, TRANSITION_VALUES,
  WALLPAPER_TYPES
} from '../engine/config.js'
import { FontSettingsPanel } from './FontSettingsPanel.js'
import { RotationGroupEditor } from './RotationGroupEditor.js'
import { WallpaperEnginePanel } from './WallpaperEnginePanel.js'

const isZh = () => String(typeof document !== 'undefined'
  ? (document.documentElement?.lang || navigator.language || '')
  : (typeof navigator !== 'undefined' ? navigator.language : '')).toLowerCase().startsWith('zh')
const text = (zh, en) => isZh() ? zh : en
const TABS = [
  ['library', '壁纸库', 'Library'],
  ['appearance', '外观', 'Appearance'],
  ['effects', '效果', 'Effects'],
  ['audio', '声音', 'Audio'],
  ['advanced', '高级', 'Advanced'],
  ['extensions', '扩展', 'Extensions'],
  ['about', '关于', 'About']
]
const EXCLUDED_PRESET_KEYS = new Set([
  'schemaVersion', 'wallpaperSource', 'weSelection', 'hiddenWallpaperIds',
  'userProps', 'rotationGroupId', 'fontSetId', 'weRoots'
])
const RESET_KEYS = {
  library: [
    'wallpaperTransition', 'wallpaperTransitionDir', 'wallpaperTransitionSpeed',
    'rotationEnabled', 'rotationGroups', 'rotationSeeded', 'pictureSlideSeconds',
    'contentRatingFilter', 'typeFilter', 'folderFilter', 'orientationFilter'
  ],
  appearance: [
    'maskOcclusion', 'wallpaperBlur', 'wallpaperOpacity', 'backgroundBrightness',
    'backgroundContrast', 'backgroundSaturate', 'wallpaperFlip', 'layerPositionX',
    'layerPositionY', 'layerScale', 'panelGlass', 'bubbleOpacity', 'composerFrost',
    'surfaceFrost', 'glassSaturation', 'glassBorder', 'glassHighlight', 'glassColor',
    'glassDarkSeparate', 'glassFidelity', 'chatGlassFidelity', 'settingsWindowTransparency',
    'settingsWindowBlur', 'sidebarGlass', 'sidebarFollowGlobal', 'sidebarBlur', 'sidebarAlpha',
    'sidebarColor', 'leftSidebarGlass', 'leftSidebarCornerRadius', 'leftSidebarSquareTL',
    'leftSidebarSquareTR', 'leftSidebarSquareBR', 'leftSidebarSquareBL', 'rightSidebarCornerRadius',
    'rightSidebarSquareTL', 'rightSidebarSquareTR', 'rightSidebarSquareBR', 'rightSidebarSquareBL',
    'titlebarGlass', 'fontCustom', 'themeColors', 'themeDarkSeparate', 'themeSize', 'themeWeight',
    'themeFamily', 'globalFamily', 'componentFonts', 'accent', 'uiColorCustom', 'uiColorSend',
    'uiColorLink', 'uiColorFileIcon', 'uiColorTab', 'uiColorDeepDiving', 'caretColor', 'themeFollow'
  ],
  effects: [
    'sceneLive', 'sceneLiveFps', 'sceneAutoQuality', 'sceneRenderDpr', 'sceneVideoTexScale',
    'liveBootDelay', 'videoPlaybackRate'
  ],
  audio: ['wallpaperSound', 'wallpaperVolume'],
  advanced: ['pickerLayout', 'pauseOnHidden', 'pauseOnBlur', 'pauseOnBattery'],
  extensions: [
    'fxEnabled', 'fxClick', 'fxClickStyle', 'fxClickSize', 'fxClickGlow', 'fxTrail',
    'fxTrailStyle', 'fxTrailLength', 'fxTrailWidth', 'fxTrailGlow', 'fxOpacity', 'fxBlend',
    'fxColorMode', 'fxColor', 'parallaxEnabled', 'parallaxBg', 'parallaxUi', 'parallaxPlugin',
    'parallaxUiChatDepth', 'parallaxUiComposerDepth', 'parallaxUiSidebarDepth',
    'parallaxUiBubbleDepth', 'parallaxPluginDepths', 'parallaxSmooth'
  ]
}

const section = (title, description, children) => jsxs('section', {
  'data-hermes-skins-surface': '',
  className: 'flex flex-col gap-4 rounded-xl border border-border bg-card p-4',
  children: [
    jsxs('div', { className: 'space-y-1', children: [
      jsx('h3', { className: 'text-sm font-semibold text-foreground', children: title }),
      description && jsx('p', { className: 'text-[11px] leading-5 text-muted-foreground', children: description })
    ] }),
    ...children.filter(Boolean)
  ]
})

function downloadJson(name, payload) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = name
  anchor.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

function bytes(value) {
  const number = Number(value) || 0
  if (number < 1024) return `${number} B`
  if (number < 1024 * 1024) return `${(number / 1024).toFixed(1)} KB`
  if (number < 1024 * 1024 * 1024) return `${(number / 1024 / 1024).toFixed(1)} MB`
  return `${(number / 1024 / 1024 / 1024).toFixed(2)} GB`
}

export function AppearanceSettingsPanel({
  store, controller, openScene, loadFonts, loadUploads, importUploads, importUrl,
  importBing, loadDiagnostics, clearSceneCache, loadNowPlaying
}) {
  const t = usePluginI18n('hermes-skins')
  const config = useValue(store.$config)
  const [tab, setTab] = useState('library')
  const [sourceDraft, setSourceDraft] = useState(config.wallpaperSource)
  const [presetMessage, setPresetMessage] = useState('')
  const [fontList, setFontList] = useState([])
  const [fontLoading, setFontLoading] = useState(false)
  const [diagnostics, setDiagnostics] = useState(null)
  const [diagnosticsLoading, setDiagnosticsLoading] = useState(false)
  const [diagnosticsError, setDiagnosticsError] = useState('')
  const [cacheArmed, setCacheArmed] = useState(false)
  const [cacheMessage, setCacheMessage] = useState('')
  const [nowPlaying, setNowPlaying] = useState(null)
  const [discoveredSlots, setDiscoveredSlots] = useState([])

  useEffect(() => setSourceDraft(config.wallpaperSource), [config.wallpaperSource])

  useEffect(() => {
    if (!loadFonts) return
    let cancelled = false
    setFontLoading(true)
    loadFonts().then(result => {
      if (!cancelled && Array.isArray(result?.fonts)) setFontList(result.fonts)
    }).catch(() => {}).finally(() => { if (!cancelled) setFontLoading(false) })
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    if (tab !== 'advanced' || diagnostics || !loadDiagnostics) return
    void refreshDiagnostics()
  }, [tab])

  useEffect(() => {
    if (tab !== 'audio' || !loadNowPlaying) return
    let cancelled = false
    const tick = () => {
      loadNowPlaying().then(result => { if (!cancelled) setNowPlaying(result) }).catch(() => {
        if (!cancelled) setNowPlaying({ ok: false })
      })
    }
    tick()
    const timer = setInterval(tick, 5000)
    return () => { cancelled = true; clearInterval(timer) }
  }, [tab])

  useEffect(() => {
    if (tab !== 'extensions' || !config.parallaxPlugin) return
    const skip = new Set(['root', 'main', 'rightbar', 'conversation.view', 'sidebar', 'main.conversation'])
    const slots = [...document.querySelectorAll('[data-slot]')]
      .map(element => element.getAttribute('data-slot') || '')
      .filter(slot => slot && !skip.has(slot) && !slot.startsWith('settings.') &&
        !slot.startsWith('plugins.') && !slot.startsWith('shell.'))
    setDiscoveredSlots([...new Set(slots)].sort())
  }, [tab, config.parallaxPlugin])

  const customSourceValid = !sourceDraft || Boolean(normalizeMediaSource(sourceDraft, config.wallpaperType))
  const commitSource = () => {
    if (customSourceValid && sourceDraft !== config.wallpaperSource) {
      controller.changeConfig({ wallpaperSource: sourceDraft, weSelection: null })
    }
  }

  const slider = (key, label, description, options = {}) => {
    const range = PARAM_RANGES[key]
    if (!range) return null
    const value = Number(config[key]) || 0
    return jsxs('label', { className: 'flex flex-col gap-1.5', children: [
      jsxs('span', { className: 'flex justify-between gap-3 text-xs text-foreground', children: [
        jsx('span', { children: label }),
        jsx('span', { className: 'font-mono text-muted-foreground', children: `${value}${range.unit}` })
      ] }),
      jsx('input', {
        type: 'range', min: range.min, max: range.max, step: options.step || 1, value,
        onChange: event => controller.scheduleConfig({ [key]: Number(event.target.value) }),
        onPointerUp: () => controller.flushConfig(),
        onKeyUp: () => controller.flushConfig(),
        onBlur: () => controller.flushConfig(),
        className: 'w-full accent-primary'
      }),
      description && jsx('span', { className: 'text-[11px] leading-4 text-muted-foreground', children: description })
    ] })
  }

  const toggle = (key, label, description, disabled = false) => jsxs('label', {
    className: `flex items-start justify-between gap-4 text-xs text-foreground ${disabled ? 'opacity-50' : ''}`,
    children: [
      jsxs('span', { className: 'min-w-0 space-y-0.5', children: [
        jsx('span', { className: 'block font-medium', children: label }),
        description && jsx('span', { className: 'block text-[11px] leading-4 text-muted-foreground', children: description })
      ] }),
      jsx(Switch, {
        checked: Boolean(config[key]), disabled, 'aria-label': label,
        onCheckedChange: value => controller.changeConfig({ [key]: value })
      })
    ]
  })

  const select = (key, label, options, description) => jsxs('label', {
    className: 'flex flex-col gap-1.5 text-xs text-foreground',
    children: [
      jsxs('span', { className: 'space-y-0.5', children: [
        jsx('span', { className: 'block font-medium', children: label }),
        description && jsx('span', { className: 'block text-[11px] text-muted-foreground', children: description })
      ] }),
      jsx('select', {
        value: String(config[key]),
        onChange: event => controller.changeConfig({ [key]: typeof config[key] === 'number'
          ? Number(event.target.value) : event.target.value }),
        className: 'rounded-md border border-border bg-background px-2.5 py-1.5 text-xs',
        children: options.map(option => jsx('option', { value: option[0], children: option[1] }, option[0]))
      })
    ]
  })

  const currentTitle = config.weSelection?.title ||
    config.wallpaperSource.split(/[\\/]/).filter(Boolean).at(-1) || ''

  const exportPreset = () => {
    const settings = Object.fromEntries(Object.keys(DEFAULT_CONFIG)
      .filter(key => !EXCLUDED_PRESET_KEYS.has(key))
      .map(key => [key, config[key]]))
    downloadJson('hermes-wallpaper-preset.json', {
      format: 'hermes-wallpaper-preset@2',
      version: 2,
      settings
    })
    setPresetMessage(t('presetExported'))
  }

  const importPreset = async event => {
    const file = event.target.files?.[0]
    if (!file) return
    try {
      const payload = JSON.parse(await file.text())
      const settings = payload?.settings ?? payload
      const patch = Object.fromEntries(Object.keys(DEFAULT_CONFIG).filter(key => key in (settings || {}))
        .map(key => [key, settings[key]]))
      if (!Object.keys(patch).length) throw new Error('empty preset')
      controller.changeConfig(patch)
      setPresetMessage(t('presetImported'))
    } catch {
      setPresetMessage(t('presetInvalid'))
    } finally {
      event.target.value = ''
    }
  }

  const resetTab = () => {
    const keys = RESET_KEYS[tab] || []
    if (!keys.length) return
    const patch = Object.fromEntries(keys.filter(key => key in DEFAULT_CONFIG)
      .map(key => [key, DEFAULT_CONFIG[key]]))
    controller.changeConfig(patch)
  }

  const refreshDiagnostics = async () => {
    if (!loadDiagnostics || diagnosticsLoading) return
    setDiagnosticsLoading(true)
    setDiagnosticsError('')
    try {
      setDiagnostics(await loadDiagnostics())
    } catch (cause) {
      setDiagnosticsError(String(cause?.message || cause))
    } finally {
      setDiagnosticsLoading(false)
    }
  }

  const clearCache = async () => {
    if (!cacheArmed) {
      setCacheArmed(true)
      return
    }
    setCacheArmed(false)
    setCacheMessage('')
    try {
      const result = await clearSceneCache?.()
      if (!result?.ok) throw new Error(result?.error || 'Cache cleanup failed')
      setCacheMessage(text('场景缓存已清理。', 'Scene cache cleared.'))
      setDiagnostics(null)
      await refreshDiagnostics()
    } catch (cause) {
      setCacheMessage(String(cause?.message || cause))
    }
  }

  const scanFonts = async () => {
    if (!loadFonts || fontLoading) return
    setFontLoading(true)
    try {
      const result = await loadFonts()
      if (Array.isArray(result?.fonts)) setFontList(result.fonts)
    } catch {
      setFontList([])
    } finally {
      setFontLoading(false)
    }
  }

  const wallpaperProperties = Array.isArray(config.weSelection?.properties)
    ? config.weSelection.properties.filter(property => !property.hidden) : []
  const wallpaperOverrides = config.userProps?.[config.weSelection?.id] || {}

  const wallpaperColor = value => {
    if (typeof value !== 'string') return '#4f8cff'
    if (/^#[0-9a-f]{6}$/i.test(value)) return value
    const parts = value.trim().split(/\s+/).map(Number)
    if (parts.length >= 3 && parts.every(Number.isFinite)) {
      const max = Math.max(...parts)
      return `#${parts.slice(0, 3).map(channel => Math.max(0, Math.min(255,
        Math.round((max <= 1 ? channel * 255 : channel))
      )).toString(16).padStart(2, '0')).join('')}`
    }
    return '#4f8cff'
  }

  const wallpaperColorWire = value => {
    const match = /^#([0-9a-f]{6})$/i.exec(value || '')
    if (!match) return value
    const number = parseInt(match[1], 16)
    return [(number >> 16) & 255, (number >> 8) & 255, number & 255]
      .map(channel => (channel / 255).toFixed(6)).join(' ')
  }

  const setWallpaperProperty = (name, value) => {
    const id = config.weSelection?.id
    if (!id) return
    const current = { ...(config.userProps?.[id] || {}) }
    if (value === undefined) delete current[name]
    else current[name] = value
    const userProps = { ...(config.userProps || {}) }
    if (Object.keys(current).length) userProps[id] = current
    else delete userProps[id]
    controller.changeConfig({ userProps })
  }

  const resetWallpaperProperties = () => {
    const id = config.weSelection?.id
    if (!id) return
    const userProps = { ...(config.userProps || {}) }
    delete userProps[id]
    controller.changeConfig({ userProps })
  }

  const tabBar = jsx('div', {
    role: 'tablist',
    className: 'sticky top-0 z-10 flex flex-wrap gap-1 rounded-xl border border-border bg-card/95 p-1.5 backdrop-blur',
    children: TABS.map(([id, zh, en]) => jsx('button', {
      type: 'button', role: 'tab', 'aria-selected': tab === id,
      onClick: () => setTab(id),
      className: `rounded-lg px-3 py-1.5 text-xs transition ${tab === id
        ? 'bg-primary text-primary-foreground'
        : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'}`,
      children: text(zh, en)
    }, id))
  })

  const tabFooter = RESET_KEYS[tab] && jsx('div', {
    className: 'flex items-center justify-between gap-3 rounded-lg border border-dashed border-border px-3 py-2',
    children: [
      jsx('span', { className: 'text-[11px] text-muted-foreground',
        children: text('只重置本页参数，不改当前壁纸或隐藏名单。', 'Resets this tab only; the current wallpaper and hidden list stay untouched.') }),
      jsx(Button, { size: 'sm', variant: 'outline', onClick: resetTab,
        children: text('重置本页', 'Reset tab') })
    ]
  })

  let content = null
  if (tab === 'library') {
    const propertiesSection = wallpaperProperties.length > 0 && section(
      text('壁纸属性', 'Wallpaper properties'),
      text('由壁纸作者声明的 Scene / Web 属性；修改会即时传给 WebWallGL 并保存在本机。', 'Scene / Web properties declared by the wallpaper author; changes are sent to WebWallGL immediately and stored locally.'),
      [
        jsxs('div', { className: 'flex flex-col gap-3', children: wallpaperProperties.map(property => {
          const overridden = Object.prototype.hasOwnProperty.call(wallpaperOverrides, property.name)
          const value = overridden ? wallpaperOverrides[property.name] : property.value
          const label = property.text || property.name
          const reset = overridden && jsx('button', {
            type: 'button', className: 'text-[11px] text-muted-foreground hover:text-foreground',
            onClick: () => setWallpaperProperty(property.name, undefined),
            children: text('恢复默认', 'Reset')
          })
          if (property.type === 'text' || property.type === 'group') {
            return jsxs('div', { className: 'border-t border-border/60 pt-2 first:border-t-0 first:pt-0', children: [
              jsx('div', { className: 'text-xs font-medium text-foreground', children: label }),
              property.type === 'text' && jsx('div', { className: 'mt-0.5 text-[11px] text-muted-foreground',
                children: property.name })
            ] }, property.name)
          }
          if (property.type === 'bool') {
            return jsx('div', { className: 'flex items-center justify-between gap-3', children: [
              jsx('span', { className: 'text-xs text-foreground', children: label }),
              jsxs('div', { className: 'flex items-center gap-2', children: [
                reset,
                jsx('input', {
                  type: 'checkbox', checked: Boolean(value),
                  onChange: event => setWallpaperProperty(property.name, event.target.checked)
                })
              ] })
            ] }, property.name)
          }
          if (property.type === 'slider') {
            const min = Number.isFinite(Number(property.min)) ? Number(property.min) : 0
            const max = Number.isFinite(Number(property.max)) ? Number(property.max) : 1
            const step = Number.isFinite(Number(property.step)) ? Number(property.step) : 0.01
            return jsxs('label', { className: 'flex flex-col gap-1.5 text-xs text-foreground', children: [
              jsxs('span', { className: 'flex items-center justify-between gap-2', children: [
                jsx('span', { children: label }),
                jsxs('span', { className: 'flex items-center gap-2', children: [
                  jsx('span', { className: 'font-mono text-muted-foreground', children: String(value ?? '') }),
                  reset
                ] })
              ] }),
              jsx('input', {
                type: 'range', min, max, step, value: Number(value) || 0,
                onChange: event => setWallpaperProperty(property.name, Number(event.target.value)),
                onPointerUp: () => controller.flushConfig(),
                className: 'w-full accent-primary'
              })
            ] }, property.name)
          }
          if (property.type === 'combo' && property.options?.length) {
            return jsxs('label', { className: 'flex items-center justify-between gap-3 text-xs text-foreground', children: [
              jsx('span', { children: label }),
              jsxs('span', { className: 'flex items-center gap-2', children: [
                reset,
                jsxs('select', {
                  value: String(value ?? ''),
                  onChange: event => {
                    const option = property.options.find(item => String(item.value) === event.target.value)
                    setWallpaperProperty(property.name, option ? option.value : event.target.value)
                  },
                  className: 'max-w-56 rounded border border-border bg-background px-2 py-1 text-xs',
                  children: property.options.map((option, index) => jsx('option', {
                    value: String(option.value ?? ''), children: option.label || String(option.value ?? '')
                  }, `${property.name}:${index}`))
                })
              ] })
            ] }, property.name)
          }
          if (property.type === 'color') {
            return jsxs('label', { className: 'flex items-center justify-between gap-3 text-xs text-foreground', children: [
              jsx('span', { children: label }),
              jsxs('span', { className: 'flex items-center gap-2', children: [
                reset,
                jsx('input', {
                  type: 'color', value: wallpaperColor(value),
                  onChange: event => setWallpaperProperty(property.name, wallpaperColorWire(event.target.value)),
                  className: 'h-7 w-10 rounded border border-border bg-transparent'
                })
              ] })
            ] }, property.name)
          }
          return jsxs('label', { className: 'flex flex-col gap-1.5 text-xs text-foreground', children: [
            jsxs('span', { className: 'flex items-center justify-between gap-2', children: [
              jsx('span', { children: label }),
              reset
            ] }),
            jsx(Input, {
              value: typeof value === 'string' ? value : value == null ? '' : String(value),
              onChange: event => setWallpaperProperty(property.name, event.target.value),
              placeholder: property.type === 'file' || property.type === 'directory'
                ? text('相对壁纸目录的路径', 'Path relative to the wallpaper directory')
                : ''
            })
          ] }, property.name)
        }) }),
        jsx('div', { className: 'flex justify-end', children: jsx(Button, {
          size: 'sm', variant: 'outline', onClick: resetWallpaperProperties,
          children: text('全部恢复默认', 'Reset all')
        }) })
      ]
    )
    content = [
      section(t('wallpaperEngineTitle'), t('wallpaperEngineDesc'), [
        jsxs('div', { className: 'flex items-center justify-between gap-4', children: [
          jsxs('div', { className: 'min-w-0 space-y-1', children: [
            jsx('p', { className: 'truncate text-sm font-medium text-foreground',
              children: currentTitle || t('selectWallpaperFirst') }),
            jsx('p', { className: 'text-[11px] text-muted-foreground', children: t('enableWallpaperDesc') })
          ] }),
          jsx(Switch, {
            checked: Boolean(config.wallpaperSource && config.wallpaperEnabled),
            disabled: !config.wallpaperSource,
            'aria-label': t('enableWallpaper'),
            onCheckedChange: value => controller.changeConfig({ wallpaperEnabled: value })
          })
        ] }),
        select('wallpaperType', t('wallpaperType'), WALLPAPER_TYPES.map(type =>
          [type, type === 'image' ? t('wallpaperTypeImage')
            : type === 'video' ? t('wallpaperTypeVideo')
            : type === 'scene' ? t('weTypeScene') : t('weTypeWeb')])),
        jsxs('label', { className: 'flex flex-col gap-2 text-xs text-foreground', children: [
          t('wallpaperSource'),
          jsx(Input, {
            value: sourceDraft,
            onChange: event => setSourceDraft(event.target.value),
            onBlur: commitSource,
            onKeyDown: event => { if (event.key === 'Enter') commitSource() },
            placeholder: t('wallpaperSourcePlaceholder'),
            'aria-invalid': !customSourceValid
          }),
          jsx('span', { className: 'text-[11px] text-muted-foreground', children: t('sourceCommitHint') }),
          !customSourceValid && jsx('span', { className: 'text-destructive', children: t('invalidWallpaperSource') })
        ] }),
        jsxs('div', { className: 'grid gap-3 sm:grid-cols-2', children: [
          select('wallpaperMode', t('wallpaperMode'), [
            ['live', t('wallpaperModeLive')], ['frame', t('wallpaperModeFrame')]
          ]),
          select('wallpaperFit', t('wallpaperFit'), [
            ['cover', t('wallpaperFitCover')], ['contain', t('wallpaperFitContain')],
            ['center', text('居中原始尺寸', 'Center native size')], ['fill', t('wallpaperFitFill')]
          ])
        ] })
      ]),
      propertiesSection,
      section(text('切换过场', 'Switch transition'), text('手动选壁纸与自动轮播共用同一套过场。', 'Manual picks and auto rotation share the same transition recipe.'), [
        jsxs('div', { className: 'grid gap-3 sm:grid-cols-3', children: [
          select('wallpaperTransition', text('过场', 'Transition'), TRANSITION_VALUES.map(value => [value, {
            cut: text('硬切', 'Cut'), fade: text('交叉淡化', 'Crossfade'),
            push: text('推移', 'Push'), wipe: text('擦除', 'Wipe'),
            iris: text('光圈', 'Iris'), zoom: text('缩放', 'Zoom'),
            bars: text('条带', 'Bars')
          }[value]])),
          select('wallpaperTransitionDir', text('方向', 'Direction'), TRANSITION_DIRECTIONS.map(value => [value, {
            left: text('左', 'Left'), right: text('右', 'Right'),
            up: text('上', 'Up'), down: text('下', 'Down')
          }[value]])),
          select('wallpaperTransitionSpeed', text('速度', 'Speed'), TRANSITION_SPEEDS.map(value => [value, {
            fast: text('快', 'Fast'), normal: text('标准', 'Normal'), slow: text('慢', 'Slow')
          }[value]]))
        ] })
      ]),
      section(text('自动轮播', 'Auto rotation'), text('每个列表有自己的壁纸集合、间隔、顺序和推进方式。', 'Each list has its own wallpaper set, interval, order and trigger.'), [
        jsx(RotationGroupEditor, { store, controller })
      ]),
      jsx(WallpaperEnginePanel, {
        store, controller, openScene, loadUploads, importUploads, importUrl, importBing
      })
    ]
  } else if (tab === 'appearance') {
    content = [
      section(text('主题与玻璃颜色', 'Theme and glass colours'), text('Hermes 原生主题仍在设置中管理；这里只控制插件外观。', 'Hermes still owns the native theme; this controls the plugin appearance.'), [
        toggle('themeFollow', text('主题随壁纸', 'Follow wallpaper theme'),
          text('从当前壁纸取样主色并更新 Hermes 强调色。', 'Samples the current wallpaper and updates the Hermes accent colour.')),
        jsxs('div', { className: 'grid gap-3 sm:grid-cols-3', children: [
          jsxs('label', { className: 'flex items-center justify-between gap-2 text-xs text-foreground', children: [
            jsx('span', { children: text('强调色', 'Accent colour') }),
            jsx('input', {
              type: 'color', value: config.accent,
              onChange: event => controller.changeConfig({ accent: event.target.value }),
              className: 'h-7 w-10 rounded border border-border bg-transparent'
            })
          ] }),
          jsxs('label', { className: 'flex items-center justify-between gap-2 text-xs text-foreground', children: [
            jsx('span', { children: text('浅色玻璃色', 'Light glass colour') }),
            jsx('input', {
              type: 'color', value: config.glassColor.light,
              onChange: event => controller.changeConfig({
                glassColor: { ...config.glassColor, light: event.target.value }
              }),
              className: 'h-7 w-10 rounded border border-border bg-transparent'
            })
          ] }),
          jsxs('label', { className: 'flex items-center justify-between gap-2 text-xs text-foreground', children: [
            jsx('span', { children: text('深色玻璃色', 'Dark glass colour') }),
            jsx('input', {
              type: 'color', value: config.glassColor.dark,
              disabled: !config.glassDarkSeparate,
              onChange: event => controller.changeConfig({
                glassColor: { ...config.glassColor, dark: event.target.value }
              }),
              className: 'h-7 w-10 rounded border border-border bg-transparent disabled:opacity-40'
            })
          ] })
        ] }),
        toggle('glassDarkSeparate', text('深色主题单独设置玻璃色', 'Separate dark-theme glass colour'))
      ]),
      section(text('壁纸画面', 'Wallpaper image'), text('亮度、对比度、饱和度、模糊、遮罩与取景。', 'Brightness, contrast, saturation, blur, veil and framing.'), [
        jsxs('div', { className: 'grid gap-4 sm:grid-cols-2', children: [
          slider('maskOcclusion', text('暗化遮罩', 'Wallpaper veil'), text('100% 完全遮住壁纸。', '100% fully hides the wallpaper.')),
          slider('wallpaperBlur', t('wallpaperBlur'), t('wallpaperBlurDesc')),
          slider('wallpaperOpacity', t('wallpaperOpacity'), t('wallpaperOpacityDesc')),
          slider('backgroundBrightness', text('亮度', 'Brightness'), text('100% = 原图。', '100% = untouched.')),
          slider('backgroundContrast', text('对比度', 'Contrast'), text('100% = 原图。', '100% = untouched.')),
          slider('backgroundSaturate', text('饱和度', 'Saturation'), text('0% = 黑白。', '0% = greyscale.')),
          slider('layerPositionX', text('水平位置', 'Horizontal position')),
          slider('layerPositionY', text('垂直位置', 'Vertical position')),
          slider('layerScale', text('画面缩放', 'Layer scale'))
        ] }),
        toggle('wallpaperFlip', text('水平镜像', 'Horizontal mirror'))
      ]),
      section(t('sectionGlass'), t('sectionGlassDesc'), [
        jsxs('div', { className: 'grid gap-4 sm:grid-cols-2', children: [
          slider('panelGlass', t('panelGlass'), t('panelGlassDesc')),
          slider('bubbleOpacity', t('bubbleOpacity'), t('bubbleOpacityDesc')),
          slider('composerFrost', t('composerFrost'), t('composerFrostDesc')),
          slider('surfaceFrost', t('surfaceFrost'), t('surfaceFrostDesc')),
          slider('glassSaturation', t('glassSaturation'), t('glassSaturationDesc')),
          slider('glassBorder', t('glassBorder'), t('glassBorderDesc')),
          slider('glassFidelity', text('玻璃保真度', 'Glass fidelity'), text('越低越保留原始玻璃色，可读性下限越弱。', 'Lower values keep more of the raw glass colour and relax readability clamping.')),
          slider('chatGlassFidelity', text('对话栏玻璃保真度', 'Conversation glass fidelity')),
          slider('settingsWindowTransparency', text('设置窗透光度', 'Settings-window transparency')),
          slider('settingsWindowBlur', text('设置窗模糊', 'Settings-window blur'))
        ] }),
        toggle('glassHighlight', t('glassHighlight'))
      ]),
      section(text('侧栏与标题栏', 'Sidebars and titlebar'), text('这些是 Hermes 原始结构面上的液态玻璃与圆角。', 'Liquid glass and corners on Hermes structural surfaces.'), [
        toggle('leftSidebarGlass', text('左侧栏原生玻璃', 'Native left-sidebar glass')),
        toggle('titlebarGlass', text('标题栏玻璃', 'Titlebar glass')),
        toggle('sidebarGlass', text('侧栏玻璃', 'Sidebar glass')),
        toggle('sidebarFollowGlobal', text('侧栏跟随全局玻璃参数', 'Sidebar follows global glass settings')),
        !config.sidebarFollowGlobal && jsxs('div', { className: 'grid gap-4 sm:grid-cols-2', children: [
          slider('sidebarBlur', text('侧栏模糊', 'Sidebar blur')),
          slider('sidebarAlpha', text('侧栏透明度', 'Sidebar transparency')),
          jsxs('label', { className: 'flex items-center justify-between gap-2 text-xs text-foreground', children: [
            jsx('span', { children: text('侧栏玻璃色', 'Sidebar glass colour') }),
            jsx('input', {
              type: 'color', value: config.sidebarColor,
              onChange: event => controller.changeConfig({ sidebarColor: event.target.value }),
              className: 'h-7 w-10 rounded border border-border bg-transparent'
            })
          ] })
        ] }),
        jsxs('div', { className: 'grid gap-3 sm:grid-cols-2', children: [
          select('leftSidebarCornerRadius', text('左侧栏圆角', 'Left-sidebar corners'), [
            ['native', text('跟随原生', 'Native')], ['6', '6px'], ['12', '12px'], ['20', '20px']
          ]),
          select('rightSidebarCornerRadius', text('右侧栏圆角', 'Right-sidebar corners'), [
            ['native', text('跟随原生', 'Native')], ['6', '6px'], ['12', '12px'], ['20', '20px']
          ])
        ] }),
        jsxs('div', { className: 'grid gap-2 sm:grid-cols-2', children: [
          toggle('leftSidebarSquareTL', text('左栏左上直角', 'Left top square')),
          toggle('leftSidebarSquareTR', text('左栏右上直角', 'Left top-right square')),
          toggle('leftSidebarSquareBR', text('左栏右下直角', 'Left bottom-right square')),
          toggle('leftSidebarSquareBL', text('左栏左下直角', 'Left bottom-left square')),
          toggle('rightSidebarSquareTL', text('右栏左上直角', 'Right top-left square')),
          toggle('rightSidebarSquareTR', text('右栏右上直角', 'Right top-right square')),
          toggle('rightSidebarSquareBR', text('右栏右下直角', 'Right bottom-right square')),
          toggle('rightSidebarSquareBL', text('右栏左下直角', 'Right bottom-left square'))
        ] })
      ]),
      section(t('sectionTypography'), t('sectionTypographyDesc'), [
        jsx(FontSettingsPanel, {
          config, controller, fontList, loadingFonts: fontLoading, scanFonts
        })
      ])
    ]
  } else if (tab === 'effects') {
    content = [
      section(text('场景实时渲染', 'Live scene rendering'), t('sectionPlaybackDesc'), [
        toggle('sceneLive', t('sceneLive'), t('sceneLiveDesc')),
        jsxs('div', { className: 'grid gap-3 sm:grid-cols-2', children: [
          select('sceneLiveFps', t('sceneLiveFps'), [
            ['15', '15 fps'], ['30', '30 fps'], ['60', '60 fps']
          ]),
          select('sceneRenderDpr', t('sceneRenderDpr'), [
            ['0', t('sceneRenderDprAuto')], ['1', '1x'], ['1.5', '1.5x'], ['2', '2x']
          ]),
          select('sceneVideoTexScale', t('sceneVideoTexScale'), [
            ['0', t('sceneVideoTexScaleAuto')], ['0.5', t('sceneVideoTexScaleHalf')],
            ['1', t('sceneVideoTexScaleFull')]
          ]),
          select('liveBootDelay', text('重启恢复等待', 'Restore wait'), [
            [0, text('不等待', 'No wait')], [1, '1 s'], [3, '3 s'],
            [5, '5 s'], [10, '10 s'], [30, '30 s']
          ], text('只在重启恢复上次壁纸时生效。', 'Only applies when restoring the previous wallpaper after a restart.'))
        ] }),
        toggle('sceneAutoQuality', t('sceneAutoQuality'), t('sceneAutoQualityDesc'))
      ]),
      section(text('视频播放', 'Video playback'), text('视频壁纸与场景内嵌视频共用基础播放参数。', 'Shared by video wallpapers and embedded scene video.'), [
        select('videoPlaybackRate', t('videoPlaybackRate'), [
          [0.5, '0.5x'], [0.75, '0.75x'], [1, '1x'], [1.25, '1.25x'], [1.5, '1.5x'], [2, '2x']
        ])
      ]),
      section(text('画面取景', 'Framing'), text('与 WE 的自由取景同一量程：位置 50 = 居中，缩放 100% = 原始大小。', 'Matches Wallpaper Engine free framing: 50 = centre, 100% = original size.'), [
        jsxs('div', { className: 'grid gap-4 sm:grid-cols-3', children: [
          slider('layerPositionX', text('水平位置', 'Horizontal position')),
          slider('layerPositionY', text('垂直位置', 'Vertical position')),
          slider('layerScale', text('缩放', 'Scale'))
        ] }),
        toggle('wallpaperFlip', text('水平镜像', 'Horizontal mirror'))
      ])
    ]
  } else if (tab === 'audio') {
    content = [
      section(text('声音', 'Audio'), t('sectionPlaybackDesc'), [
        toggle('wallpaperSound', t('wallpaperSound'),
          text('视频壁纸、场景内嵌 MP4 与场景包内音频共用；关闭 = 静音但保留音量数值。', 'Shared by video wallpapers, embedded scene video and scene audio; off keeps the volume value.')),
        slider('wallpaperVolume', t('wallpaperVolume'), t('wallpaperVolumeDesc'))
      ]),
      section(text('系统媒体信息', 'System media integration'), text('与上游一致，媒体集成和系统音频反应为常开；宿主不支持时自动降级。', 'Media integration and system audio response are always on, matching upstream; unsupported hosts fall back automatically.'), [
        jsxs('div', { className: 'rounded-lg border border-border bg-background/50 p-3 text-xs', children: [
          jsxs('div', { className: 'flex items-center justify-between gap-2', children: [
            jsx('span', { className: 'font-medium text-foreground', children: text('Now Playing', 'Now Playing') }),
            jsx('span', { className: nowPlaying?.ok ? 'text-emerald-600' : 'text-muted-foreground',
              children: nowPlaying?.ok
                ? (nowPlaying.playing || 'available')
                : text('当前无可用媒体会话', 'No active media session') })
          ] }),
          nowPlaying?.ok && jsxs('div', { className: 'mt-2 space-y-0.5 text-muted-foreground', children: [
            jsx('div', { className: 'text-foreground', children: nowPlaying.title || '—' }),
            jsx('div', { children: [nowPlaying.artist, nowPlaying.album].filter(Boolean).join(' · ') || '—' }),
            nowPlaying.duration > 0 && jsx('div', { className: 'font-mono',
              children: `${Math.floor(nowPlaying.position || 0)} / ${Math.floor(nowPlaying.duration)} s` })
          ] })
        ] }),
        jsxs('div', { className: 'text-[11px] leading-5 text-muted-foreground', children: [
          text('系统音频反应：', 'System audio response: '),
          jsx('span', { className: 'text-foreground', children: 'auto' }),
          text(' · 媒体集成：', ' · Media integration: '),
          jsx('span', { className: 'text-foreground', children: text('常开', 'always on') })
        ] })
      ])
    ]
  } else if (tab === 'advanced') {
    content = [
      section(text('浏览方式', 'Browsing'), text('壁纸库卡片的呈现方式。', 'How wallpaper cards are laid out.'), [
        select('pickerLayout', text('紧凑布局', 'Compact layout'), PICKER_LAYOUTS.map(value => [value,
          value === 'classic' ? text('经典比例卡片', 'Classic aspect-ratio cards')
            : text('固定高度网格', 'Fixed-height grid')]))
      ]),
      section(text('省电', 'Power saving'), text('类似 Wallpaper Engine 的遮挡暂停；恢复后自动继续。', 'Wallpaper Engine-style pause rules; playback resumes automatically.'), [
        toggle('pauseOnHidden', t('pauseOnHidden')),
        toggle('pauseOnBlur', t('pauseOnBlur')),
        toggle('pauseOnBattery', t('pauseOnBattery'))
      ]),
      section(text('缓存与诊断', 'Cache and diagnostics'), text('缓存可再生；这里只清理场景解包缓存，不删除壁纸原文件。', 'Caches are reproducible; this only clears extracted scene data, never source wallpapers.'), [
        jsxs('div', { className: 'flex flex-wrap gap-2', children: [
          jsx(Button, { size: 'sm', variant: 'outline', onClick: () => void refreshDiagnostics(),
            disabled: diagnosticsLoading,
            children: diagnosticsLoading ? '…' : text('刷新诊断', 'Refresh diagnostics') }),
          jsx(Button, {
            size: 'sm', variant: 'outline', onClick: () => void clearCache(),
            children: cacheArmed ? text('确认清理场景缓存', 'Confirm scene-cache cleanup')
              : text('清理场景缓存', 'Clear scene cache')
          })
        ] }),
        cacheMessage && jsx('p', { className: 'text-[11px] text-muted-foreground', children: cacheMessage }),
        diagnosticsError && jsx('p', { className: 'text-[11px] text-destructive', children: diagnosticsError }),
        diagnostics?.ok && jsxs('div', { className: 'grid gap-3 md:grid-cols-2', children: [
          jsxs('div', { className: 'space-y-1 rounded-lg border border-border bg-background/50 p-3 text-[11px] text-muted-foreground', children: [
            jsx('div', { className: 'text-xs font-medium text-foreground', children: text('运行状态', 'Runtime') }),
            jsx('div', { children: `WebWallGL: ${diagnostics.webwallgl ? 'OK' : 'missing'}` }),
            jsx('div', { children: `Node.js: ${diagnostics.node || '—'}` }),
            jsx('div', { children: `${text('系统字体缓存', 'System fonts')}: ${diagnostics.fonts || 0}` })
          ] }),
          jsxs('div', { className: 'space-y-1 rounded-lg border border-border bg-background/50 p-3 text-[11px] text-muted-foreground', children: [
            jsx('div', { className: 'text-xs font-medium text-foreground', children: text('占用', 'Storage') }),
            jsx('div', { children: `${text('上传', 'Uploads')}: ${bytes(diagnostics.sizes?.uploads)}` }),
            jsx('div', { children: `${text('场景缓存', 'Scene cache')}: ${bytes(diagnostics.sizes?.sceneCache)}` }),
            jsx('div', { className: 'break-all', children: diagnostics.paths?.data || '—' })
          ] })
        ] }),
        diagnostics?.logs?.length > 0 && jsxs('details', { className: 'rounded-lg border border-border bg-background/50 p-3', children: [
          jsx('summary', { className: 'cursor-pointer text-xs font-medium text-foreground',
            children: text('最近日志', 'Recent logs') }),
          ...diagnostics.logs.map(log => jsxs('div', { className: 'mt-2', children: [
            jsx('div', { className: 'text-[11px] font-medium text-foreground', children: `${log.name} · ${bytes(log.size)}` }),
            jsx('pre', { className: 'mt-1 max-h-40 overflow-auto whitespace-pre-wrap break-all text-[10px] text-muted-foreground',
              children: (log.tail || []).slice(-40).join('\n') })
          ] }, log.name))
        ] })
      ]),
      section(t('sectionSystem'), t('sectionSystemDesc'), [
        jsxs('div', { className: 'flex flex-wrap items-center gap-2', children: [
          jsx(Button, { size: 'sm', variant: 'outline', onClick: exportPreset, children: t('exportPreset') }),
          jsx('label', {
            className: 'inline-flex cursor-pointer items-center rounded-md border border-border px-3 py-1.5 text-xs text-foreground hover:bg-accent/50',
            children: [
              t('importPreset'),
              jsx('input', { type: 'file', accept: 'application/json,.json', className: 'hidden',
                onChange: event => void importPreset(event) })
            ]
          })
        ] }),
        presetMessage && jsx('p', { className: 'text-[11px] text-muted-foreground', children: presetMessage })
      ])
    ]
  } else if (tab === 'extensions') {
    content = [
      section(t('sectionFx'), t('sectionFxDesc'), [
        toggle('fxEnabled', t('fxEnabled')),
        config.fxEnabled && jsxs('div', { className: 'flex flex-col gap-4', children: [
          toggle('fxClick', t('fxClick')),
          select('fxClickStyle', t('fxClickStyle'), FX_CLICK_STYLES.map(value => [value, {
            ripple: text('波纹', 'Ripple'), spark: text('火花', 'Spark'), both: text('两者一起', 'Both')
          }[value]])),
          jsxs('div', { className: 'grid gap-3 sm:grid-cols-2', children: [
            slider('fxClickSize', t('fxClickSize')),
            slider('fxClickGlow', t('fxClickGlow'))
          ] }),
          toggle('fxTrail', t('fxTrail')),
          select('fxTrailStyle', t('fxTrailStyle'), FX_TRAIL_STYLES.map(value => [value, {
            comet: text('彗尾', 'Comet'), dust: text('星尘', 'Dust')
          }[value]])),
          jsxs('div', { className: 'grid gap-3 sm:grid-cols-2', children: [
            slider('fxTrailLength', t('fxTrailLength')),
            slider('fxTrailWidth', t('fxTrailWidth')),
            slider('fxTrailGlow', t('fxTrailGlow')),
            slider('fxOpacity', t('fxOpacity'))
          ] }),
          jsxs('div', { className: 'grid gap-3 sm:grid-cols-2', children: [
            select('fxBlend', t('fxBlend'), FX_BLEND_VALUES.map(value => [value, {
              screen: text('滤色', 'Screen'), normal: text('正常', 'Normal'),
              overlay: text('叠加', 'Overlay'), multiply: text('正片叠底', 'Multiply'),
              lighten: text('变亮', 'Lighten')
            }[value]])),
            select('fxColorMode', t('fxColorMode'), FX_COLOR_MODES.map(value => [value, {
              accent: text('主题色', 'Accent'), rainbow: text('彩虹', 'Rainbow'),
              custom: text('自定义', 'Custom')
            }[value]]))
          ] }),
          config.fxColorMode === 'custom' && jsxs('label', {
            className: 'flex items-center justify-between gap-3 text-xs text-foreground',
            children: [
              jsx('span', { children: t('fxColor') }),
              jsx('input', {
                type: 'color', value: config.fxColor,
                onChange: event => controller.changeConfig({ fxColor: event.target.value }),
                className: 'h-7 w-10 rounded border border-border bg-transparent'
              })
            ]
          })
        ] })
      ]),
      section(t('sectionParallax'), t('sectionParallaxDesc'), [
        toggle('parallaxEnabled', t('parallaxEnabled')),
        config.parallaxEnabled && jsxs('div', { className: 'flex flex-col gap-4', children: [
          slider('parallaxBg', t('parallaxBgDepth'), text('光标到屏幕角落时的最大位移，单位 = 屏幕最长对角线的百分比。', 'Maximum travel when the cursor reaches a screen corner, as a percentage of the longest diagonal.')),
          toggle('parallaxUi', t('parallaxUi')),
          config.parallaxUi && jsxs('div', { className: 'grid gap-3 sm:grid-cols-2', children: [
            slider('parallaxUiChatDepth', t('parallaxUiChat')),
            slider('parallaxUiComposerDepth', t('parallaxUiComposer')),
            slider('parallaxUiSidebarDepth', t('parallaxUiSidebar')),
            slider('parallaxUiBubbleDepth', text('用户气泡深度', 'User bubble depth'))
          ] }),
          toggle('parallaxPlugin', text('其他插件前端视差', 'Other plugin surfaces'),
            text('独立于界面视差；默认关闭。', 'Independent of UI parallax; off by default.')),
          config.parallaxPlugin && jsxs('div', { className: 'space-y-2', children: [
            discoveredSlots.length === 0 && jsx('p', { className: 'text-[11px] text-muted-foreground',
              children: text('尚未发现可移动的插件前端组。', 'No movable plugin surface has been discovered yet.') }),
            ...discoveredSlots.map(slot => jsxs('label', {
              className: 'flex items-center justify-between gap-3 rounded-md border border-border bg-background/40 px-2.5 py-2 text-xs',
              children: [
                jsx('span', { className: 'min-w-0 truncate text-foreground', children: slot }),
                jsx('input', {
                  type: 'number', min: 0, max: 10, step: 0.1,
                  value: config.parallaxPluginDepths?.[slot] ?? 1,
                  onChange: event => controller.scheduleConfig({
                    parallaxPluginDepths: {
                      ...config.parallaxPluginDepths,
                      [slot]: Number(event.target.value)
                    }
                  }),
                  onBlur: () => controller.flushConfig(),
                  className: 'w-20 rounded border border-border bg-background px-2 py-1 text-xs'
                })
              ]
            }, slot))
          ] }),
          slider('parallaxSmooth', t('parallaxSmooth'), text('0 = 立刻跟手，越大越柔和。', '0 = instant, higher = softer.'))
        ] })
      ])
    ]
  } else {
    content = [
      section(text('项目简介', 'About this plugin'), null, [
        jsxs('div', { className: 'space-y-2 text-xs leading-6 text-muted-foreground', children: [
          jsx('p', { className: 'text-sm font-medium text-foreground',
            children: text('Hermes 壁纸引擎 · 让 Hermes 的背后动起来', 'Hermes Wallpaper Engine · bring the background to life') }),
          jsx('p', { children: text(
            '把 Wallpaper Engine 的 Scene、Web、视频与图片壁纸放到 Hermes 背后，再配上一整套液态玻璃、字体、点击拖尾与 3D 视差。插件不向 agent 注册工具，也不注入提示文本，因此不增加模型 token 开销。',
            'Bring Wallpaper Engine Scene, Web, video and image wallpapers behind Hermes, with liquid glass, typography, click/trail effects and 3D parallax. The plugin registers no agent tools or prompt text, so it adds no model token overhead.'
          ) })
        ] })
      ]),
      section(text('版本与上游', 'Version and upstream'), null, [
        jsxs('div', { className: 'space-y-2 text-xs text-muted-foreground', children: [
          jsx('div', { children: `Hermes Wallpaper Engine 2.0.0` }),
          jsx('div', { children: text('适配上游 dsh-wallpaper-engine 1.4.2（fd3e01f）', 'Adapted from dsh-wallpaper-engine 1.4.2 (fd3e01f)') }),
          jsx('div', { children: 'WebWallGL 3.0.1 · MIT · oneincase' }),
          jsx('p', { className: 'leading-5', children: text(
            '本项目按 MIT 及其随附的第三方许可分发。壁纸、角色与字体素材的授权可能与代码不同；再分发或商用前请核对来源。',
            'Distributed under MIT and the accompanying third-party licences. Wallpaper, character and font assets may use different terms; check their sources before redistribution or commercial use.'
          ) })
        ] }),
        jsxs('div', { className: 'flex flex-wrap gap-2', children: [
          jsx('a', {
            href: 'https://github.com/CaptainMusX/hermes-skins',
            target: '_blank', rel: 'noopener noreferrer',
            className: 'rounded-md border border-border px-3 py-1.5 text-xs text-foreground hover:bg-accent/50',
            children: text('Hermes 插件仓库', 'Hermes plugin repository')
          }),
          jsx('a', {
            href: 'https://github.com/elysia395/dsh-wallpaper-engine',
            target: '_blank', rel: 'noopener noreferrer',
            className: 'rounded-md border border-border px-3 py-1.5 text-xs text-foreground hover:bg-accent/50',
            children: text('上游 DSH 项目', 'Upstream DSH project')
          })
        ] })
      ]),
      section(text('许可与致谢', 'Licences and credits'), null, [
        jsx('ul', { className: 'list-disc space-y-1 pl-5 text-[11px] leading-5 text-muted-foreground', children: [
          jsx('li', { children: text('dsh-wallpaper-engine：壁纸渲染生命周期、设置与交互设计参考（MIT）', 'dsh-wallpaper-engine: renderer lifecycle, settings and interaction reference (MIT)') }),
          jsx('li', { children: text('WebWallGL：Scene / Web 实时渲染引擎（MIT，oneincase）', 'WebWallGL: live Scene / Web renderer (MIT, oneincase)') }),
          jsx('li', { children: text('dsh-skins：早期 Scene 解包兼容层（MIT）', 'dsh-skins: legacy scene extraction compatibility (MIT)') })
        ] })
      ])
    ]
  }

  return jsxs('div', {
    'data-hermes-skins-page': '',
    className: 'mx-auto flex w-full max-w-6xl flex-col gap-4 p-2 md:p-4',
    children: [
      jsx('header', { className: 'space-y-1', children: [
        jsx('h1', { className: 'text-lg font-semibold text-foreground', children: t('pluginName') }),
        jsx('p', { className: 'text-xs text-muted-foreground', children: t('pluginDesc') })
      ] }),
      tabBar,
      jsx('div', { role: 'tabpanel', className: 'flex flex-col gap-4', children: content }),
      tabFooter
    ]
  })
}
