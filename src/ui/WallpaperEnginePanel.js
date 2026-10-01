import { Button, Input, usePluginI18n, useValue } from '@hermes/plugin-sdk'
import { useEffect, useRef, useState } from 'react'
import { jsx, jsxs } from 'react/jsx-runtime'
import { scanWallpaperEngine, wallpaperMediaUrl } from '../engine/we-library.js'

const PAGE_SIZE = 12

export function WallpaperEnginePanel({ store, controller, preview, prepareScene }) {
  const t = usePluginI18n('hermes-skins')
  const config = useValue(store.$config)
  const [items, setItems] = useState([])
  const [libraries, setLibraries] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('all')
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(0)
  const [previews, setPreviews] = useState({})
  const [importingId, setImportingId] = useState(null)
  const scanRevision = useRef(0)
  const bridge = typeof window !== 'undefined' ? window.hermesDesktop : null
  const rootsKey = config.weRoots.join('|')

  async function refresh() {
    const revision = ++scanRevision.current
    setLoading(true)
    setError('')
    try {
      const result = await scanWallpaperEngine(bridge, config.weRoots)
      if (revision !== scanRevision.current) return
      setItems(result.items)
      setLibraries(result.libraries)
      setPage(0)
      if (result.error) setError(result.error)
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

  const filtered = items.filter(item => (filter === 'all' || item.kind === filter) &&
    (!query || item.title.toLocaleLowerCase().includes(query.toLocaleLowerCase())))
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const visible = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)
  const visiblePaths = visible.map(item => item.previewPath).join('|')

  useEffect(() => {
    if (!bridge?.readFileDataUrl) return
    let cancelled = false
    const fetchPreviews = async () => {
      for (let start = 0; start < visible.length && !cancelled; start += 4) {
        await Promise.all(visible.slice(start, start + 4).map(async item => {
          if (previews[item.previewPath]) return
          try {
            const data = await bridge.readFileDataUrl(item.previewPath)
            if (!cancelled && typeof data === 'string' && data.startsWith('data:image/')) {
              setPreviews(current => ({ ...current, [item.previewPath]: data }))
            }
          } catch { /* A missing thumbnail must not block the inventory. */ }
        }))
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
    const paths = await bridge.selectPaths({ directories: true, multiple: false,
      defaultPath: libraries[0] || config.weRoots[0], title: t('weChooseFolder') })
    const selected = paths?.[0]
    if (selected && !config.weRoots.includes(selected)) {
      controller.changeConfig({ weRoots: [...config.weRoots, selected] })
    }
  }

  async function useWallpaper(item) {
    setError('')
    setImportingId(item.id)
    try {
      let source = wallpaperMediaUrl(item.mediaPath, item.mediaType)
      let type = item.mediaType
      let framePath = null
      let staticFallback = item.staticFallback
      if (item.kind === 'scene') {
        // Re-selecting the already-prepared scene must not depend on the
        // gateway: its unpacked manifest and preview frame are already on
        // disk and referenced by the current config.
        if (config.wallpaperType === 'scene' &&
            config.weSelection?.id === item.id && config.wallpaperSource &&
            !config.wallpaperSource.startsWith('data:')) {
          controller.changeConfig({ wallpaperEnabled: true })
          return
        }
        if (!prepareScene) throw new Error(t('weSceneBackendUnavailable'))
        const result = await prepareScene(item.dir)
        if (!result?.ok) throw new Error(result?.error || t('weSceneBackendUnavailable'))
        framePath = result.framePath || null
        if (result.manifest && result.manifestPath) {
          source = result.manifestPath
          type = 'scene'
          staticFallback = false
        } else if (result.videoPath) {
          source = wallpaperMediaUrl(result.videoPath, 'video')
          type = 'video'
          staticFallback = false
        } else if (framePath) {
          source = framePath
          type = 'image'
          staticFallback = true
        } else {
          throw new Error(t('weSceneUnsupported'))
        }
      }
      controller.changeConfig({
        wallpaperEnabled: true,
        wallpaperType: type,
        wallpaperSource: source,
        weSelection: { id: item.id, title: item.title, kind: item.kind, staticFallback,
          framePath, previewPath: item.previewPath }
      })
    } catch (cause) {
      // A blocked backend surfaces as an ipc 404 "Plugin not found" — map it
      // to the recovery action instead of the raw electron error text.
      const message = String(cause?.message || cause)
      setError(/Plugin not found|\b404\b/.test(message) ? t('weSceneBackendMissing') : message)
    } finally {
      setImportingId(null)
    }
  }

  const kindLabel = kind => t({ video: 'weTypeVideo', scene: 'weTypeScene', image: 'weTypeImage', web: 'weTypeWeb' }[kind] || 'weTypeOther')
  return jsxs('section', { 'data-hermes-skins-surface': '', className: 'rounded-xl border border-border bg-card p-5', children: [
    jsxs('div', { className: 'flex flex-wrap items-start justify-between gap-3', children: [
      jsxs('div', { className: 'space-y-1', children: [
        jsx('h2', { className: 'font-semibold text-foreground', children: t('weTitle') }),
        jsx('p', { className: 'text-xs text-muted-foreground', children: t('weDescription') })
      ] }),
      jsxs('div', { className: 'flex gap-2', children: [
        jsx(Button, { size: 'sm', variant: 'outline', onClick: chooseFolder, children: t('weChooseFolder') }),
        jsx(Button, { size: 'sm', variant: 'outline', onClick: refresh, disabled: loading,
          children: loading ? t('weScanning') : t('weRefresh') })
      ] })
    ] }),
    jsx('p', { className: 'mt-3 text-xs text-muted-foreground', children: loading ? t('weScanning') : t('weFound', items.length) }),
    error && jsx('p', { className: 'mt-2 text-xs text-destructive', children: error }),
    !loading && config.weSelection && items.length > 0 && !items.some(item => item.id === config.weSelection.id) &&
      jsx('p', { className: 'mt-2 text-xs text-amber-600', children: t('weMissing') }),
    jsxs('div', { className: 'mt-4 flex flex-wrap items-center gap-2', children: [
      jsx(Input, { value: query, onChange: event => { setQuery(event.target.value); setPage(0) },
        placeholder: t('weSearch'), className: 'max-w-64', 'aria-label': t('weSearch') }),
      ['all', 'video', 'scene', 'image', 'web'].map(value => jsx('button', {
        key: value, type: 'button', 'aria-pressed': filter === value,
        onClick: () => { setFilter(value); setPage(0) },
        className: `rounded-full px-2.5 py-1 text-xs ${filter === value ? 'bg-primary text-primary-foreground' : 'bg-background text-foreground'}`,
        children: value === 'all' ? t('tagsAll') : kindLabel(value)
      }))
    ] }),
    !loading && items.length === 0 && jsx('p', { className: 'mt-4 text-sm text-muted-foreground', children: t('weEmpty') }),
    jsxs('div', { className: 'mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3', children: visible.map(item => {
      const selected = config.weSelection?.id === item.id
      return jsxs('article', { key: item.id, 'data-hermes-skins-surface': '', className: `overflow-hidden rounded-lg border bg-background ${selected ? 'border-primary' : 'border-border'}`, children: [
        previews[item.previewPath]
          ? jsx('img', { src: previews[item.previewPath], alt: '', loading: 'lazy', className: 'h-36 w-full object-cover' })
          : jsx('div', { className: 'h-36 bg-muted/40' }),
        jsxs('div', { className: 'space-y-2 p-3', children: [
          jsx('h3', { className: 'line-clamp-2 min-h-8 text-sm font-medium text-foreground', title: item.title, children: item.title }),
          jsx('p', { className: 'text-xs text-muted-foreground', children: item.kind === 'scene'
            ? `${kindLabel(item.kind)} · ${t('weSceneLive')}`
            : item.staticFallback ? `${kindLabel(item.kind)} · ${t('weStaticFallback')}` : kindLabel(item.kind) }),
          jsx(Button, { size: 'sm', className: 'w-full', disabled: Boolean(preview) || Boolean(importingId),
            variant: selected ? 'secondary' : 'default', onClick: () => void useWallpaper(item),
            children: importingId === item.id ? t('wePreparing') : selected ? t('weSelected') : t('weUse') })
        ] })
      ] })
    }) }),
    pages > 1 && jsxs('div', { className: 'mt-4 flex items-center justify-end gap-2 text-xs text-muted-foreground', children: [
      jsx(Button, { size: 'sm', variant: 'outline', disabled: page === 0,
        onClick: () => setPage(page - 1), children: '←' }),
      jsx('span', { children: `${page + 1} / ${pages}` }),
      jsx(Button, { size: 'sm', variant: 'outline', disabled: page + 1 >= pages,
        onClick: () => setPage(page + 1), children: '→' })
    ] })
  ] })
}
