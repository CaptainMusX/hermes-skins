import { Button, Input, usePluginI18n, useValue } from '@hermes/plugin-sdk'
import { useEffect, useRef, useState } from 'react'
import { jsx, jsxs } from 'react/jsx-runtime'
import { CONTENT_RATINGS, ORIENTATION_FILTERS, WALLPAPER_TYPES } from '../engine/config.js'
import { scanWallpaperEngine } from '../engine/we-library.js'
import { normalizeMediaSource } from '../engine/backdrop-manager.js'
import { enableSceneBackend, isSceneBackendMissing } from '../engine/scene-backend.js'
import { resolveWallpaperSelection } from '../engine/wallpaper-apply.js'

const isZh = () => String(typeof document !== 'undefined'
  ? (document.documentElement?.lang || navigator.language || '')
  : (typeof navigator !== 'undefined' ? navigator.language : '')).toLowerCase().startsWith('zh')
const text = (zh, en) => isZh() ? zh : en

function ratingOf(item) {
  const value = String(item?.contentrating || '').toLowerCase()
  if (value.includes('mature')) return 'mature'
  if (value.includes('pg13') || value.includes('pg-13')) return 'pg13'
  if (value.includes('everyone')) return 'everyone'
  return 'unrated'
}

function orientationOf(item) {
  const width = Number(item?.width) || 0
  const height = Number(item?.height) || 0
  if (!width || !height) return 'all'
  return width > height ? 'landscape' : width < height ? 'portrait' : 'all'
}

function Chips({ values, selected, onToggle, label }) {
  return jsxs('div', { className: 'flex flex-wrap items-center gap-1.5', 'aria-label': label, children: values.map(value => {
    const active = selected.includes(value)
    return jsx('button', {
      type: 'button',
      'aria-pressed': active,
      onClick: () => onToggle(value),
      className: `rounded-full px-2.5 py-1 text-[11px] transition ${active
        ? 'bg-primary text-primary-foreground'
        : 'border border-border bg-background/60 text-muted-foreground hover:text-foreground'}`,
      children: value
    }, value)
  }) })
}

function WallpaperThumb({ item, bridge }) {
  const path = item.previewPath || (item.mediaType === 'image' ? item.mediaPath : null)
  const [src, setSrc] = useState(() => path ? normalizeMediaSource(path) : null)
  const [failed, setFailed] = useState(false)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    setSrc(path ? normalizeMediaSource(path) : null)
    setFailed(false)
    setLoaded(false)
  }, [path])

  const fallback = async () => {
    if (!path || !bridge?.readFileDataUrl || failed) {
      setFailed(true)
      return
    }
    try {
      const data = await bridge.readFileDataUrl(path)
      if (typeof data === 'string' && data.startsWith('data:image/')) {
        setSrc(data)
        return
      }
    } catch { /* Keep the no-preview placeholder. */ }
    setFailed(true)
  }

  if (!src || failed) {
    return jsx('span', {
      className: 'absolute inset-0 grid place-items-center text-[10px] text-muted-foreground',
      children: text('无预览', 'No preview')
    })
  }
  return jsx('img', {
    src,
    alt: item.title,
    loading: 'lazy',
    decoding: 'async',
    onLoad: () => setLoaded(true),
    onError: () => void fallback(),
    className: `absolute inset-0 size-full object-cover transition duration-300 group-hover:scale-[1.06] ${loaded ? 'opacity-100' : 'opacity-0'}`
  })
}

export function WallpaperEnginePanel({
  store, controller, openScene, loadUploads, importUploads, importUrl, importBing, compact = false
}) {
  const t = usePluginI18n('hermes-skins')
  const config = useValue(store.$config)
  const [items, setItems] = useState([])
  const [libraries, setLibraries] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [showHidden, setShowHidden] = useState(false)
  const [importingId, setImportingId] = useState(null)
  const [backendMissing, setBackendMissing] = useState(false)
  const [recoveringBackend, setRecoveringBackend] = useState(false)
  const [urlDraft, setUrlDraft] = useState('')
  const [busyAction, setBusyAction] = useState('')
  const pendingScene = useRef(null)
  const scanRevision = useRef(0)
  const bridge = typeof window !== 'undefined' ? window.hermesDesktop : null
  const rootsKey = config.weRoots.join('|')

  async function refresh() {
    const revision = ++scanRevision.current
    setLoading(true)
    setError('')
    try {
      const [scan, uploads] = await Promise.all([
        scanWallpaperEngine(bridge, config.weRoots).catch(cause => ({
          items: [], libraries: [], error: String(cause?.message || cause)
        })),
        typeof loadUploads === 'function'
          ? loadUploads().catch(() => ({ items: [] }))
          : Promise.resolve({ items: [] })
      ])
      if (revision !== scanRevision.current) return
      const merged = [...(uploads?.items || []), ...(scan.items || [])]
      setItems(merged)
      store.setWeItems?.(merged)
      setLibraries(scan.libraries || [])
      if (scan.error) setError(scan.error)
    } catch (cause) {
      if (revision === scanRevision.current) setError(String(cause?.message || cause))
    } finally {
      if (revision === scanRevision.current) setLoading(false)
    }
  }

  useEffect(() => {
    void refresh()
    return () => { scanRevision.current += 1 }
  }, [rootsKey])

  const hiddenIds = new Set(config.hiddenWallpaperIds || [])
  const typeFilter = Array.isArray(config.typeFilter) ? config.typeFilter : WALLPAPER_TYPES
  const ratingFilter = Array.isArray(config.contentRatingFilter) ? config.contentRatingFilter : ['everyone']
  const hiddenCount = items.filter(item => hiddenIds.has(item.id)).length
  const filtered = items.filter(item => {
    if (showHidden !== hiddenIds.has(item.id)) return false
    if (!typeFilter.includes(item.kind)) return false
    const rating = ratingOf(item)
    if (item.contentrating && !ratingFilter.includes(rating)) return false
    const orientationFilter = config.orientationFilter || 'all'
    if (orientationFilter !== 'all' && orientationOf(item) !== 'all' &&
      orientationOf(item) !== orientationFilter) return false
    if (config.folderFilter !== 'all' && item.source !== config.folderFilter) return false
    return !query || item.title.toLocaleLowerCase().includes(query.toLocaleLowerCase())
  })

  async function chooseFolder() {
    if (!bridge?.selectPaths) {
      setError(t('weBridgeUnavailable'))
      return
    }
    const paths = await bridge.selectPaths({
      directories: true, multiple: false,
      defaultPath: libraries[0] || config.weRoots[0], title: t('weChooseFolder')
    })
    const selected = paths?.[0]
    if (selected && !config.weRoots.includes(selected)) {
      controller.changeConfig({ weRoots: [...config.weRoots, selected] })
    }
  }

  async function addFiles() {
    if (!bridge?.selectPaths || typeof importUploads !== 'function') {
      setError(t('weBridgeUnavailable'))
      return
    }
    setBusyAction('files')
    setError('')
    try {
      const paths = await bridge.selectPaths({
        directories: false, multiple: true,
        title: text('选择图片或视频', 'Choose images or videos')
      })
      if (!paths?.length) return
      const result = await importUploads(paths)
      if (result?.rejected?.length) setError(result.rejected.map(row => row.error).join(' · '))
      await refresh()
    } catch (cause) {
      setError(String(cause?.message || cause))
    } finally {
      setBusyAction('')
    }
  }

  async function addUrl() {
    if (!urlDraft.trim() || typeof importUrl !== 'function') return
    setBusyAction('url')
    setError('')
    try {
      const result = await importUrl(urlDraft.trim())
      if (!result?.ok) throw new Error(result?.error || 'URL import failed')
      setUrlDraft('')
      await refresh()
    } catch (cause) {
      setError(String(cause?.message || cause))
    } finally {
      setBusyAction('')
    }
  }

  async function addBing() {
    if (typeof importBing !== 'function') return
    setBusyAction('bing')
    setError('')
    try {
      const result = await importBing()
      if (!result?.ok) throw new Error(result?.error || 'Bing download failed')
      await refresh()
    } catch (cause) {
      setError(String(cause?.message || cause))
    } finally {
      setBusyAction('')
    }
  }

  async function useWallpaper(item) {
    setError('')
    setBackendMissing(false)
    setImportingId(item.id)
    try {
      if (hiddenIds.has(item.id)) {
        const next = new Set(hiddenIds)
        next.delete(item.id)
        controller.changeConfig({ hiddenWallpaperIds: [...next] })
      }
      if ((item.kind === 'scene' || item.kind === 'web') &&
          config.weSelection?.id === item.id && config.weSelection?.dir === item.dir) {
        controller.changeConfig({ wallpaperEnabled: true })
        return
      }
      controller.changeConfig(await resolveWallpaperSelection(item, openScene))
    } catch (cause) {
      const message = String(cause?.message || cause)
      const missing = isSceneBackendMissing(cause)
      pendingScene.current = missing ? item : null
      setBackendMissing(missing)
      setError(missing ? t('weSceneBackendMissing') : message)
    } finally {
      setImportingId(null)
    }
  }

  function toggleHidden(item, hidden) {
    const next = new Set(config.hiddenWallpaperIds || [])
    if (hidden) next.add(item.id)
    else next.delete(item.id)
    controller.changeConfig({ hiddenWallpaperIds: [...next] })
  }

  async function recoverBackend() {
    setRecoveringBackend(true)
    try {
      const result = await enableSceneBackend(bridge)
      setBackendMissing(false)
      if (result.ready) {
        setError('')
        const item = pendingScene.current
        pendingScene.current = null
        if (item) await useWallpaper(item)
      } else setError(t('weSceneBackendRestartRequired'))
    } catch (cause) {
      setError(String(cause?.message || cause))
    } finally { setRecoveringBackend(false) }
  }

  const kindLabel = kind => t({ video: 'weTypeVideo', scene: 'weTypeScene', image: 'weTypeImage', web: 'weTypeWeb' }[kind] || 'weTypeOther')
  const toggleArray = (key, value) => {
    const current = Array.isArray(config[key])
      ? config[key]
      : key === 'typeFilter' ? WALLPAPER_TYPES : ['everyone']
    const next = current.includes(value) ? current.filter(item => item !== value) : [...current, value]
    if (next.length) controller.changeConfig({ [key]: next })
  }
  const classic = config.pickerLayout === 'classic'

  return jsxs('section', {
    'data-hermes-skins-surface': '',
    className: `rounded-xl border border-border bg-card ${compact ? 'p-3' : 'p-5'}`,
    children: [
      jsxs('div', { className: 'flex flex-wrap items-start justify-between gap-3', children: [
        jsxs('div', { className: 'space-y-1', children: [
          jsx('h2', { className: 'font-semibold text-foreground', children: t('weTitle') }),
          jsx('p', { className: 'text-xs text-muted-foreground', children: t('weDescription') })
        ] }),
        jsxs('div', { className: 'flex flex-wrap gap-2', children: [
          jsx(Button, { size: 'sm', variant: 'outline', onClick: chooseFolder, children: t('weChooseFolder') }),
          jsx(Button, { size: 'sm', variant: 'outline', onClick: () => void addFiles(),
            disabled: Boolean(busyAction), children: busyAction === 'files' ? '…' : text('添加文件', 'Add files') }),
          jsx(Button, { size: 'sm', variant: 'outline', onClick: refresh, disabled: loading,
            children: loading ? t('weScanning') : t('weRefresh') })
        ] })
      ] }),
      jsxs('div', { className: 'mt-3 flex flex-wrap gap-2', children: [
        jsx(Input, {
          value: urlDraft, onChange: event => setUrlDraft(event.target.value),
          onKeyDown: event => { if (event.key === 'Enter') void addUrl() },
          placeholder: text('粘贴图片 / 视频 URL', 'Paste an image or video URL'),
          className: 'min-w-52 flex-1'
        }),
        jsx(Button, { size: 'sm', variant: 'outline', disabled: Boolean(busyAction) || !urlDraft.trim(),
          onClick: () => void addUrl(), children: busyAction === 'url' ? '…' : text('导入 URL', 'Import URL') }),
        jsx(Button, { size: 'sm', variant: 'outline', disabled: Boolean(busyAction),
          onClick: () => void addBing(), children: busyAction === 'bing' ? '…' : 'Bing 每日一图' })
      ] }),
      jsx('p', { className: 'mt-3 text-xs text-muted-foreground',
        children: loading ? t('weScanning')
          : `${t('weFound', items.length)} · ${text('点击卡片即应用，悬停显示隐藏按钮', 'Click a card to apply; hover to hide')}` }),
      error && jsx('p', { className: 'mt-2 text-xs text-destructive', children: error }),
      backendMissing && bridge?.api && jsx(Button, {
        size: 'sm', variant: 'outline', className: 'mt-2',
        disabled: recoveringBackend, onClick: () => void recoverBackend(),
        children: recoveringBackend ? t('weSceneBackendEnabling') : t('weSceneBackendEnable')
      }),
      !loading && config.weSelection && items.length > 0 &&
        !items.some(item => item.id === config.weSelection.id) &&
        jsx('p', { className: 'mt-2 text-xs text-amber-600', children: t('weMissing') }),
      jsxs('div', { className: 'mt-4 flex flex-col gap-2', children: [
        jsxs('div', { className: 'flex flex-wrap items-center gap-2', children: [
          jsx(Input, {
            value: query, onChange: event => setQuery(event.target.value),
            placeholder: t('weSearch'), className: 'max-w-64', 'aria-label': t('weSearch')
          }),
          jsxs('select', {
            value: config.orientationFilter,
            onChange: event => controller.changeConfig({ orientationFilter: event.target.value }),
            className: 'rounded-md border border-border bg-background px-2 py-1.5 text-xs',
            'aria-label': text('方向筛选', 'Orientation filter'),
            children: ORIENTATION_FILTERS.map(value => jsx('option', { value,
              children: value === 'all' ? text('全部方向', 'All orientations')
                : value === 'landscape' ? text('横屏', 'Landscape') : text('竖屏', 'Portrait')
            }, value))
          }),
          jsx(Button, {
            size: 'sm', variant: 'outline',
            onClick: () => setShowHidden(value => !value),
            children: showHidden ? t('weShowVisible', hiddenCount) : t('weShowHidden', hiddenCount)
          })
        ] }),
        jsxs('div', { className: 'flex flex-wrap items-center gap-2', children: [
          jsx('span', { className: 'text-[11px] text-muted-foreground', children: text('类型', 'Type') }),
          jsx(Chips, {
            values: WALLPAPER_TYPES, selected: config.typeFilter,
            onToggle: value => toggleArray('typeFilter', value), label: text('类型筛选', 'Type filter')
          })
        ] }),
        jsxs('div', { className: 'flex flex-wrap items-center gap-2', children: [
          jsx('span', { className: 'text-[11px] text-muted-foreground', children: text('分级', 'Rating') }),
          jsx(Chips, {
            values: CONTENT_RATINGS, selected: config.contentRatingFilter,
            onToggle: value => toggleArray('contentRatingFilter', value), label: text('内容分级筛选', 'Rating filter')
          })
        ] })
      ] }),
      !loading && items.length === 0 && jsx('p', { className: 'mt-4 text-sm text-muted-foreground', children: t('weEmpty') }),
      jsxs('div', {
        className: `mt-4 grid gap-2 overflow-y-auto overflow-x-hidden p-0.5 ${classic
          ? 'max-h-[min(58vh,560px)] pb-10'
          : 'max-h-[min(58vh,560px)]'}`,
        style: {
          gridTemplateColumns: classic
            ? 'repeat(auto-fill, minmax(100px, 1fr))'
            : 'repeat(auto-fill, minmax(120px, 1fr))',
          scrollbarGutter: 'stable'
        },
        children: filtered.map(item => {
          const selected = config.weSelection?.id === item.id
          const hidden = hiddenIds.has(item.id)
          const busy = importingId === item.id
          const cardStyle = classic
            ? { aspectRatio: '16 / 9', marginBottom: '-36px' }
            : { height: '92px' }
          return jsxs('div', {
            key: item.id,
            'data-wallpaper-id': item.id,
            'data-hermes-skins-surface': '',
            role: 'button',
            tabIndex: 0,
            'aria-pressed': selected,
            'aria-label': hidden ? text(`恢复并应用 ${item.title}`, `Restore and apply ${item.title}`) : item.title,
            title: item.title,
            onClick: () => { if (!busy && !recoveringBackend) void useWallpaper(item) },
            onKeyDown: event => {
              if ((event.key === 'Enter' || event.key === ' ') && !busy && !recoveringBackend) {
                event.preventDefault()
                void useWallpaper(item)
              }
            },
            className: `group relative cursor-pointer overflow-hidden rounded-lg border bg-muted/30 shadow-sm transition duration-150 ${classic
              ? 'hover:z-10 hover:scale-[1.12] hover:shadow-xl'
              : ''} ${selected
              ? 'border-primary ring-2 ring-primary/55 shadow-[0_4px_16px_color-mix(in_srgb,var(--dt-primary)_30%,transparent)]'
              : 'border-border hover:border-primary/50'} ${hidden ? 'opacity-75' : ''}`,
            style: cardStyle,
            children: [
              jsx(WallpaperThumb, { item, bridge }),
              jsx('span', {
                className: 'pointer-events-none absolute left-1 top-1 z-[2] rounded bg-black/65 px-1.5 py-0.5 text-[10px] leading-4 text-white',
                children: kindLabel(item.kind)
              }),
              (item.kind === 'scene' || item.kind === 'web') && !item.staticFallback && jsx('span', {
                className: 'pointer-events-none absolute right-1 top-1 z-[1] rounded bg-sky-700/85 px-1.5 py-0.5 text-[9px] leading-4 text-white',
                children: text('实时', 'Live')
              }),
              jsx('span', {
                className: 'pointer-events-none absolute inset-x-0 bottom-0 z-[1] truncate bg-gradient-to-t from-black/85 via-black/55 to-transparent px-1.5 pb-1 pt-5 text-[11px] leading-4 text-white',
                children: item.title
              }),
              jsx('button', {
                type: 'button',
                className: `absolute right-1 top-1 z-[3] rounded bg-black/70 px-1.5 py-0.5 text-[10px] text-white transition hover:bg-red-700/90 focus-visible:opacity-100 ${hidden ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 group-focus-within:opacity-100'}`,
                title: hidden ? text('恢复此壁纸', 'Restore this wallpaper') : text('隐藏此壁纸，可在“已隐藏”中恢复', 'Hide this wallpaper; restore it from the hidden view'),
                onClick: event => {
                  event.stopPropagation()
                  toggleHidden(item, !hidden)
                },
                children: hidden ? t('weRestore') : t('weHide')
              }),
              busy && jsx('span', {
                className: 'absolute inset-0 z-[4] grid place-items-center bg-black/55 text-[11px] text-white',
                children: t('wePreparing')
              }),
              selected && jsx('span', {
                className: 'pointer-events-none absolute bottom-1 right-1 z-[2] rounded bg-primary px-1.5 py-0.5 text-[9px] font-medium leading-4 text-primary-foreground',
                children: t('weSelected')
              })
            ]
          })
        })
      }),
      filtered.length === 0 && !loading && jsxs('div', {
        className: 'mt-4 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-dashed border-border px-3 py-2 text-xs text-muted-foreground',
        children: [
          jsx('span', { children: query
            ? text(`没有匹配「${query}」的壁纸`, `No wallpaper matches “${query}”`)
            : showHidden ? text('没有已隐藏的壁纸', 'No hidden wallpapers')
              : text('当前筛选条件下没有壁纸', 'No wallpapers match the current filters') }),
          jsx('button', {
            type: 'button',
            className: 'text-foreground underline underline-offset-2',
            onClick: () => { setQuery(''); setShowHidden(false) },
            children: text('清除搜索与视图', 'Clear search and view')
          })
        ]
      })
    ]
  })
}
