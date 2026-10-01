import { Badge, Button, Input, SegmentedControl, Switch, usePluginI18n, useTheme, useValue } from '@hermes/plugin-sdk'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { jsx, jsxs } from 'react/jsx-runtime'
import { BUILTIN_SKINS } from '../catalog/builtin-skins.js'
import { normalizeMediaSource } from '../engine/backdrop-manager.js'
import { PARAM_RANGES } from '../engine/config.js'
import { CustomThemeStudio } from './CustomThemeStudio.js'
import { TryOnBanner } from './TryOnBanner.js'
import { WallpaperEnginePanel } from './WallpaperEnginePanel.js'

/** Browse position per tab plus the active tab itself, kept outside the
 *  component so leaving /skins for a conversation and coming back resumes
 *  where the user was. The page unmounts on route switches and the host gives
 *  no scroll restoration, so the memory has to outlive it (plugin lifetime). */
const viewMemory = { tab: 'gallery', gallery: 0, wallpaper: 0, studio: 0 }

export function SkinCenterPage({ store, controller, prepareScene }) {
  const t = usePluginI18n('hermes-skins')
  const theme = useTheme()
  const config = useValue(store.$config)
  const preview = useValue(store.$tryOnSkin)
  const [tab, setTabState] = useState(viewMemory.tab)
  const setTab = id => { viewMemory.tab = id; setTabState(id) }
  const [tag, setTag] = useState('all')
  const [sourceDraft, setSourceDraft] = useState(config.wallpaperSource)
  const scrollRef = useRef(null)
  const skins = [...BUILTIN_SKINS, ...config.customSkins]
  const active = preview || controller.findSkin(theme.themeName)
  const customSourceValid = !sourceDraft || Boolean(normalizeMediaSource(sourceDraft, config.wallpaperType))

  useEffect(() => controller.sync(theme.themeName, theme.renderedMode),
    [controller, theme.themeName, theme.renderedMode, config, preview])
  useEffect(() => setSourceDraft(config.wallpaperSource), [config.wallpaperSource])
  useLayoutEffect(() => {
    const el = scrollRef.current
    const desired = viewMemory[tab] || 0
    if (!el || desired <= 0) return undefined
    el.scrollTop = desired
    // Wallpaper thumbnails grow the page asynchronously after mount, so the
    // first restore can be clamped by a still-short document. Re-apply for a
    // short window; the moment the user scrolls on their own, back off.
    if (el.scrollTop >= desired - 1) return undefined
    let cancelled = false
    let frames = 120
    const cancel = () => { cancelled = true }
    el.addEventListener('wheel', cancel, { passive: true, once: true })
    el.addEventListener('touchmove', cancel, { passive: true, once: true })
    const tick = () => {
      if (cancelled || !frames) return
      frames -= 1
      if (el.scrollTop >= desired - 1) return
      el.scrollTop = desired
      requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
    return cancel
  }, [tab])

  const commitSource = () => {
    if (customSourceValid && sourceDraft !== config.wallpaperSource) {
      controller.changeConfig({ wallpaperSource: sourceDraft, weSelection: null })
    }
  }

  // Slider bounds come from the single parameter contract in config.js, so the
  // UI can never offer a narrower range than normalization and rendering honor.
  const slider = (key, label, description, extraDisabled = false) => {
    const { min, max, unit } = PARAM_RANGES[key]
    return jsxs('label', {
      className: 'flex flex-col gap-1.5',
      children: [
        jsxs('span', { className: 'flex justify-between text-xs text-foreground', children: [
          jsx('span', { children: label }),
          jsx('span', { className: 'font-mono text-muted-foreground', children: `${config[key]}${unit}` })
        ] }),
        jsx('input', {
          type: 'range', min, max, step: 1, value: config[key],
          disabled: !(active || config.wallpaperSource) || Boolean(preview) || extraDisabled,
          onChange: event => controller.changeConfig({ [key]: Number(event.target.value) }),
          className: 'w-full accent-primary'
        }),
        jsx('span', { className: 'text-[11px] text-muted-foreground', children: description })
      ]
    })
  }

  const gallery = jsxs('div', { className: 'flex flex-col gap-5', children: [
    jsxs('div', { className: 'flex flex-wrap items-center gap-2', children: [
      jsx('span', { className: 'text-xs text-muted-foreground', children: t('filterByTag') }),
      ['all', 'art', 'anime', 'dark', 'light', 'cyber'].map(value => jsx('button', {
        key: value, type: 'button', onClick: () => setTag(value),
        'aria-pressed': tag === value,
        className: `rounded-full px-3 py-1 text-xs ${tag === value ? 'bg-primary text-primary-foreground' : 'bg-background text-foreground hover:bg-accent/50'}`,
        children: t(`tags${value[0].toUpperCase()}${value.slice(1)}`)
      }))
    ] }),
    jsxs('div', { className: 'grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3', children: [
      jsxs('section', { 'data-hermes-skins-surface': '', className: 'flex flex-col justify-between gap-4 rounded-xl border border-border bg-card p-5', children: [
        jsxs('div', { className: 'space-y-2', children: [
          jsx('h2', { className: 'font-semibold text-foreground', children: t('resetToDefault') }),
          jsx('p', { className: 'text-xs text-muted-foreground', children: t('officialDefaultDesc') })
        ] }),
        jsx(Button, { variant: 'outline', onClick: () => controller.restore(theme),
          disabled: !active && !preview, children: t('resetToDefault') })
      ] }),
      skins.filter(s => tag === 'all' || s.tags?.includes(tag)).map(skin => {
        const isActive = theme.themeName === skin.id && !preview
        const isPreview = preview?.id === skin.id
        return jsxs('section', {
          key: skin.id,
          'data-hermes-skins-surface': '',
          className: 'flex flex-col overflow-hidden rounded-xl border border-border bg-card',
          children: [
            skin.wallpaper
              ? jsx('img', { src: skin.wallpaper, alt: '', className: 'h-32 w-full object-cover' })
              : jsx('div', { className: 'h-32', style: { background: skin.colors?.background || '#111827' } }),
            jsxs('div', { className: 'flex flex-1 flex-col gap-3 p-4', children: [
              jsxs('div', { className: 'flex items-center justify-between gap-2', children: [
                jsx('h2', { className: 'font-semibold text-foreground', children: skin.name }),
                isActive ? jsx(Badge, { children: t('activeBadge') }) :
                  isPreview ? jsx(Badge, { variant: 'secondary', children: t('tryOnBadge') }) : null
              ] }),
              jsx('p', { className: 'flex-1 text-xs text-muted-foreground', children: skin.tagline || skin.description }),
              jsxs('div', { className: 'flex gap-2', children: [
                jsx(Button, { size: 'sm', variant: 'secondary', className: 'flex-1',
                  onClick: () => controller.tryOn(skin, theme), children: t('tryOnButton') }),
                jsx(Button, { size: 'sm', className: 'flex-1', disabled: isActive,
                  onClick: () => controller.apply(skin, theme), children: t('applyButton') })
              ] })
            ] })
          ]
        })
      })
    ] })
  ] })

  const wallpaper = jsxs('div', { className: 'flex flex-col gap-5', children: [
    jsxs('section', { 'data-hermes-skins-surface': '', className: 'flex max-w-2xl flex-col gap-5 rounded-xl border border-border bg-card p-5', children: [
    jsxs('div', { className: 'flex items-center justify-between gap-4', children: [
      jsxs('div', { className: 'space-y-1', children: [
        jsx('h2', { className: 'font-semibold text-foreground', children: t('wallpaperControls') }),
        jsx('p', { className: 'text-xs text-muted-foreground', children: active || config.wallpaperSource ? t('enableWallpaperDesc') : t('selectSkinFirst') })
      ] }),
      jsx(Switch, { checked: Boolean((active || config.wallpaperSource) && (preview ? preview.wallpaper : config.wallpaperEnabled)), disabled: !(active || config.wallpaperSource) || Boolean(preview),
        'aria-label': t('enableWallpaper'), onCheckedChange: value => controller.changeConfig({ wallpaperEnabled: value }) })
    ] }),
    jsxs('label', { className: 'flex flex-col gap-2 text-xs text-foreground', children: [
      t('wallpaperType'),
      jsx(SegmentedControl, { value: config.wallpaperType, disabled: Boolean(preview),
        onChange: value => controller.changeConfig({ wallpaperType: value }),
        options: [
          { id: 'image', label: t('wallpaperTypeImage') },
          { id: 'video', label: t('wallpaperTypeVideo') },
          ...(config.wallpaperType === 'scene' ? [{ id: 'scene', label: t('weTypeScene') }] : []),
          ...(config.wallpaperType === 'web' ? [{ id: 'web', label: t('weTypeWeb') }] : [])
        ] })
    ] }),
    jsxs('label', { className: 'flex flex-col gap-2 text-xs text-foreground', children: [
      t('wallpaperMode'),
      jsx(SegmentedControl, { value: config.wallpaperMode, disabled: Boolean(preview),
        onChange: value => controller.changeConfig({ wallpaperMode: value }), options: [
          { id: 'live', label: t('wallpaperModeLive') },
          { id: 'frame', label: t('wallpaperModeFrame') }
        ] })
    ] }),
    jsxs('label', { className: 'flex flex-col gap-2 text-xs text-foreground', children: [
      t('wallpaperFit'),
      jsx(SegmentedControl, { value: config.wallpaperFit, disabled: Boolean(preview),
        onChange: value => controller.changeConfig({ wallpaperFit: value }), options: [
          { id: 'cover', label: t('wallpaperFitCover') },
          { id: 'contain', label: t('wallpaperFitContain') },
          { id: 'fill', label: t('wallpaperFitFill') }
        ] })
    ] }),
    jsxs('label', { className: 'flex flex-col gap-2 text-xs text-foreground', children: [
      t('wallpaperSource'),
      jsx(Input, { value: sourceDraft, disabled: Boolean(preview),
        onChange: event => setSourceDraft(event.target.value), onBlur: commitSource,
        onKeyDown: event => { if (event.key === 'Enter') commitSource() },
        placeholder: t('wallpaperSourcePlaceholder'), 'aria-invalid': !customSourceValid }),
      jsx('span', { className: 'text-[11px] text-muted-foreground', children: t('sourceCommitHint') }),
      !customSourceValid && jsx('span', { className: 'text-destructive', children: t('invalidWallpaperSource') })
    ] }),
    slider('wallpaperBlur', t('wallpaperBlur'), t('wallpaperBlurDesc')),
    slider('maskOcclusion', t('maskOcclusion'), t('maskOcclusionDesc')),
    slider('wallpaperOpacity', t('wallpaperOpacity'), t('wallpaperOpacityDesc')),
    slider('panelGlass', t('panelGlass'), t('panelGlassDesc')),
    slider('bubbleOpacity', t('bubbleOpacity'), t('bubbleOpacityDesc')),
    slider('composerFrost', t('composerFrost'), t('composerFrostDesc')),
    slider('surfaceFrost', t('surfaceFrost'), t('surfaceFrostDesc')),
    jsxs('label', { className: 'flex items-center justify-between gap-3 text-xs text-foreground', children: [
      t('pauseOnHidden'),
      jsx(Switch, { checked: config.pauseOnHidden, disabled: Boolean(preview),
        'aria-label': t('pauseOnHidden'), onCheckedChange: value => controller.changeConfig({ pauseOnHidden: value }) })
    ] }),
    config.wallpaperType === 'video' && jsxs('div', { className: 'flex flex-col gap-3', children: [
      jsxs('label', { className: 'flex items-center justify-between gap-3 text-xs text-foreground', children: [
        t('wallpaperSound'),
        jsx(Switch, { checked: config.wallpaperSound, disabled: Boolean(preview),
          'aria-label': t('wallpaperSound'), onCheckedChange: value => controller.changeConfig({ wallpaperSound: value }) })
      ] }),
      slider('wallpaperVolume', t('wallpaperVolume'), t('wallpaperVolumeDesc'), !config.wallpaperSound)
    ] })
    ] }),
    jsx(WallpaperEnginePanel, { store, controller, preview, prepareScene })
  ] })

  return jsxs('div', {
    'data-hermes-skins-page': '',
    ref: scrollRef,
    className: 'h-full w-full overflow-y-auto p-5 md:p-8',
    onScroll: event => { viewMemory[tab] = event.currentTarget.scrollTop },
    children: [
    jsxs('header', { className: 'mb-5 flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4', children: [
      jsxs('div', { children: [
        jsx('h1', { className: 'text-2xl font-bold text-foreground', children: t('pluginName') }),
        jsx('p', { className: 'text-xs text-muted-foreground', children: t('pluginDesc') })
      ] }),
      jsx(SegmentedControl, { value: tab, onChange: setTab, options: [
        { id: 'gallery', label: t('tabGallery') },
        { id: 'wallpaper', label: t('tabWallpaper') },
        { id: 'studio', label: t('tabStudio') }
      ] })
    ] }),
    jsx(TryOnBanner, { store, onApply: () => preview && controller.apply(preview, theme),
      onExit: () => controller.exitTryOn(theme) }),
    tab === 'gallery' ? gallery : tab === 'wallpaper' ? wallpaper :
      jsx(CustomThemeStudio, { store, onApplySkin: skin => controller.apply(skin, theme) })
  ] })
}
