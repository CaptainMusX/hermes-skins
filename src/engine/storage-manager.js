import { atom } from 'nanostores'
import { normalizeConfig } from './config.js'

const cacheableItem = item => item && typeof item === 'object' &&
  typeof item.id === 'string' && typeof item.title === 'string' &&
  typeof item.dir === 'string' && typeof item.mediaPath === 'string'
  ? {
      id: item.id.slice(0, 1024), title: item.title.slice(0, 120),
      kind: String(item.kind || '').slice(0, 20), source: String(item.source || '').slice(0, 20),
      contentrating: typeof item.contentrating === 'string' ? item.contentrating.slice(0, 20) : null,
      dir: item.dir.slice(0, 1024), mediaPath: item.mediaPath.slice(0, 1024),
      mediaType: String(item.mediaType || '').slice(0, 20),
      previewPath: typeof item.previewPath === 'string' ? item.previewPath.slice(0, 1024) : null,
      slides: Array.isArray(item.slides)
        ? item.slides.filter(path => typeof path === 'string' && path.length <= 1024).slice(0, 200) : [],
      slideIntervalMs: Number.isFinite(Number(item.slideIntervalMs)) ? Number(item.slideIntervalMs) : null,
      staticFallback: Boolean(item.staticFallback),
      workshopId: typeof item.workshopId === 'string' ? item.workshopId.slice(0, 40) : null,
      properties: Array.isArray(item.properties) ? item.properties.slice(0, 100).map(property => ({
        name: String(property?.name || '').slice(0, 120),
        type: String(property?.type || 'other').slice(0, 20),
        text: String(property?.text || '').slice(0, 240),
        order: Number(property?.order) || 0,
        value: property?.value ?? null,
        hidden: property?.hidden === true,
        options: Array.isArray(property?.options) ? property.options.slice(0, 200).map(option => ({
          label: String(option?.label || '').slice(0, 160),
          value: option?.value ?? null
        })) : undefined,
        min: Number.isFinite(Number(property?.min)) ? Number(property.min) : undefined,
        max: Number.isFinite(Number(property?.max)) ? Number(property.max) : undefined,
        step: Number.isFinite(Number(property?.step)) ? Number(property.step) : undefined,
        precision: Number.isFinite(Number(property?.precision)) ? Number(property.precision) : undefined,
        fileType: typeof property?.fileType === 'string' ? property.fileType.slice(0, 20) : undefined
      })) : []
    }
  : null

export function createAppearanceStore(ctx) {
  const $config = atom(normalizeConfig(ctx.storage.get('config', {})))
  const $weItems = atom((Array.isArray(ctx.storage.get('weCache', [])) ? ctx.storage.get('weCache', []) : [])
    .map(cacheableItem).filter(Boolean).slice(0, 1000))
  let saveTimer = null
  let pendingSave = null

  function flushPersistence() {
    if (saveTimer !== null) clearTimeout(saveTimer)
    saveTimer = null
    if (pendingSave) {
      ctx.storage.set('config', pendingSave)
      pendingSave = null
    }
  }

  function saveConfig(updater, { deferPersistence = false } = {}) {
    const prev = $config.get()
    if (typeof updater !== 'function' && Object.entries(updater).every(([key, value]) => Object.is(prev[key], value))) {
      if (!deferPersistence) flushPersistence()
      return prev
    }
    const next = normalizeConfig(typeof updater === 'function' ? updater(prev) : { ...prev, ...updater })
    pendingSave = next
    if (deferPersistence) {
      if (saveTimer !== null) clearTimeout(saveTimer)
      saveTimer = setTimeout(flushPersistence, 200)
    } else flushPersistence()
    $config.set(next)
    return next
  }

  function setWeItems(items) {
    const next = (Array.isArray(items) ? items : []).map(cacheableItem).filter(Boolean).slice(0, 1000)
    $weItems.set(next)
    ctx.storage.set('weCache', next)
  }

  if (typeof window !== 'undefined') window.addEventListener('pagehide', flushPersistence)
  function destroy() {
    flushPersistence()
    if (typeof window !== 'undefined') window.removeEventListener('pagehide', flushPersistence)
  }
  return { $config, $weItems, setWeItems, saveConfig, flushPersistence, destroy }
}
