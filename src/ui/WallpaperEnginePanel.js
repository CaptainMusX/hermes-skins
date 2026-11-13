import { Button, Input, usePluginI18n, useValue } from '@hermes/plugin-sdk'
import { useEffect, useRef, useState } from 'react'
import { jsx, jsxs } from 'react/jsx-runtime'
import { CONTENT_RATINGS, ORIENTATION_FILTERS, WALLPAPER_TYPES } from '../engine/config.js'
import { scanWallpaperEngine } from '../engine/we-library.js'
import { normalizeMediaSource } from '../engine/backdrop-manager.js'
import { enableSceneBackend, isSceneBackendMissing } from '../engine/scene-backend.js'
import { resolveWallpaperSelection } from '../engine/wallpaper-apply.js'

const PAGE_SIZE = 12
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
  const [page, setPage] = useState(0)
  const [showHidden, setShowHidden] = useState(false)
  const [previews, setPreviews] = useState({})
  const [importingId, setImportingId] = useState(null)
  const [backendMissing, setBackendMissing] = useState(false)
  const [recoveringBackend, setRecoveringBackend] = useState(false)
  const [urlDraft, setUrlDraft] = useState('')
  const [busyAction, setBusyAction] = useState('')
  const pendingScene = useRef(null)
  const scanRevision = useRef(0)
  const previewCache = useRef(new Map())
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
      setPage(0)
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
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const visible = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)
  const visiblePaths = visible.map(item => item.previewPath || item.mediaPath).join('|')

  useEffect(() => {
    if (!bridge?.readFileDataUrl) return
    let cancelled = false
    const fetchPreviews = async () => {
      const loaded = {}
      const publish = () => { if (!cancelled) setPreviews({ ...loaded }) }
      for (const item of visible) {
        const path = item.previewPath || item.mediaPath
        const cached = previewCache.current.get(path)
        if (cached) {
          loaded[path] = cached
          previewCache.current.delete(path)
          previewCache.current.set(path, cached)
        }
      }
      publish()
      for (let start = 0; start < visible.length && !cancelled; start += 4) {
        await Promise.all(visible.slice(start, start + 4).map(async item => {
          const path = item.previewPath || item.mediaPath
          if (loaded[path] || !/\.(png|jpe?g|webp|gif|bmp)$/i.test(path || '')) return
          try {
            if (window.location?.protocol === 'file:') {
              const url = normalizeMediaSource(path)
              if (url) {
                const response = await fetch(url, { method: 'HEAD' })
                if (response.ok) {
                  loaded[path] = url
                  previewCache.current.set(path, url)
                  return
                }
              }
            }
          } catch { /* Fall through to the local bridge. */ }
          if (cancelled) return
          try {
            const data = await bridge.readFileDataUrl(path)
            if (!cancelled && typeof data === 'string' && data.startsWith('data:image/')) {
              loaded[path] = data
              previewCache.current.set(path, data)
            }
          } catch { /* Keep the inventory usable without a thumbnail. */ }
        }))
        let bytes = 0
        for (const data of previewCache.current.values()) bytes += data.length * 2
        while (previewCache.current.size > 36 || bytes > 24 * 1024 * 1024) {
          const oldest = previewCache.current.keys().next().value
          bytes -= previewCache.current.get(oldest).length * 2
          previewCache.current.delete(oldest)
        }
        publish()
      }
    }
    void fetchPreviews()
    return () => { cancelled = true }
  }, [visiblePaths])

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
  const cardHeight = config.pickerLayout === 'classic' ? 'aspect-video' : 'h-36'

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
        children: loading ? t('weScanning') : t('weFound', items.length) }),
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
            value: query, onChange: event => { setQuery(event.target.value); setPage(0) },
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
            onClick: () => { setShowHidden(value => !value); setPage(0) },
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
      jsx('div', { className: 'mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3', children: visible.map(item => {
        const selected = config.weSelection?.id === item.id
        const hidden = hiddenIds.has(item.id)
        const path = item.previewPath || item.mediaPath
        const preview = previews[path]
        return jsxs('article', {
          key: item.id,
          'data-hermes-skins-surface': '',
          className: `overflow-hidden rounded-lg border bg-background ${selected ? 'border-primary' : 'border-border'}`,
          children: [
            preview
              ? jsx('img', { src: preview, alt: '', loading: 'lazy', decoding: 'async',
                  className: `${cardHeight} w-full object-cover` })
              : item.mediaType === 'video' && normalizeMediaSource(item.mediaPath, 'video')
                ? jsx('video', {
                    src: normalizeMediaSource(item.mediaPath, 'video'), muted: true,
                    preload: 'metadata', playsInline: true,
                    className: `${cardHeight} w-full object-cover`
                  })
                : jsx('div', { className: `${cardHeight} bg-muted/40` }),
            jsxs('div', { className: 'space-y-2 p-3', children: [
              jsx('h3', { className: 'line-clamp-2 min-h-8 text-sm font-medium text-foreground', title: item.title, children: item.title }),
              jsxs('p', { className: 'text-xs text-muted-foreground', children: [
                kindLabel(item.kind),
                item.source ? ` · ${item.source}` : '',
                item.contentrating ? ` · ${item.contentrating}` : '',
                item.staticFallback ? ` · ${t('weStaticFallback')}` : ''
              ].join('') }),
              hidden
                ? jsxs('div', { className: 'flex gap-2', children: [
                    jsx(Button, { size: 'sm', className: 'flex-1', variant: 'outline',
                      onClick: () => toggleHidden(item, false), children: t('weRestore') }),
                    jsx(Button, { size: 'sm', className: 'flex-1',
                      disabled: Boolean(importingId) || recoveringBackend,
                      onClick: () => void useWallpaper(item),
                      children: importingId === item.id ? t('wePreparing') : t('weRestoreAndUse') })
                  ] })
                : jsxs('div', { className: 'flex gap-2', children: [
                    jsx(Button, { size: 'sm', className: 'flex-1',
                      disabled: Boolean(importingId) || recoveringBackend,
                      variant: selected ? 'secondary' : 'default',
                      onClick: () => void useWallpaper(item),
                      children: importingId === item.id ? t('wePreparing') : selected ? t('weSelected') : t('weUse') }),
                    jsx(Button, { size: 'sm', variant: 'outline',
                      onClick: () => toggleHidden(item, true), children: t('weHide') })
                  ] })
            ] })
          ]
        })
      }) }),
      pages > 1 && jsxs('div', {
        className: 'mt-4 flex items-center justify-end gap-2 text-xs text-muted-foreground',
        children: [
          jsx(Button, { size: 'sm', variant: 'outline', disabled: page === 0,
            onClick: () => setPage(page - 1), children: '←' }),
          jsx('span', { children: `${page + 1} / ${pages}` }),
          jsx(Button, { size: 'sm', variant: 'outline', disabled: page + 1 >= pages,
            onClick: () => setPage(page + 1), children: '→' })
        ]
      })
    ]
  })
}
