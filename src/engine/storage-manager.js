import { atom } from 'nanostores'
import { normalizeConfig } from './config.js'
import { ensurePaletteContrast } from './color-contrast.js'

export function toThemeContribution(skin) {
  const complete = colors => ensurePaletteContrast({
    ...colors,
    destructive: colors.destructive || '#dc2626',
    destructiveForeground: colors.destructiveForeground || '#ffffff'
  })
  return {
    name: skin.id,
    label: skin.name || skin.nameEn || skin.id,
    description: skin.tagline || skin.description || '',
    colors: complete(skin.colors),
    darkColors: complete(skin.darkColors || skin.colors)
  }
}

export function createSkinStore(ctx) {
  const $config = atom(normalizeConfig(ctx.storage.get('config', {})))
  const $tryOnSkin = atom(null)
  const $tryOnBaseTheme = atom(null)
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

  function startTryOn(skin, themeName) {
    if (!$tryOnSkin.get()) $tryOnBaseTheme.set(themeName)
    $tryOnSkin.set(skin)
  }

  function exitTryOn() {
    $tryOnSkin.set(null)
    $tryOnBaseTheme.set(null)
  }

  function addCustomSkin(skin) {
    ctx.register({ id: `theme-${skin.id}`, area: 'themes', data: toThemeContribution(skin) })
    saveConfig(prev => ({ ...prev, customSkins: [skin, ...prev.customSkins] }))
  }

  if (typeof window !== 'undefined') window.addEventListener('pagehide', flushPersistence)
  function destroy() {
    flushPersistence()
    if (typeof window !== 'undefined') window.removeEventListener('pagehide', flushPersistence)
  }
  return { $config, $tryOnSkin, $tryOnBaseTheme, saveConfig, startTryOn, exitTryOn, addCustomSkin,
    flushPersistence, destroy }
}
