/**
 * State & Persistence Manager for Hermes Skin Center
 * Powered by nanostores atoms and ctx.storage.
 */

import { atom } from 'nanostores'

export const DEFAULT_CONFIG = {
  activeSkinId: 'blue-fantasy',
  wallpaperEnabled: true,
  wallpaperType: 'image',
  wallpaperSource: '',
  wallpaperBlur: 4,
  maskOcclusion: 32,
  panelGlass: 80,
  bubbleOpacity: 90,
  composerFrost: 12,
  customSkins: []
}

export function createSkinStore(ctx) {
  const stored = ctx.storage.get('config', {})
  const initial = { ...DEFAULT_CONFIG, ...stored }

  // Core state atoms
  const $config = atom(initial)
  const $tryOnSkin = atom(null) // null if not trying on
  const $tryOnBackup = atom(null) // backup config to restore on exit

  function saveConfig(updater) {
    const prev = $config.get()
    const next = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater }
    $config.set(next)
    ctx.storage.set('config', next)
  }

  function startTryOn(skin) {
    if (!$tryOnBackup.get()) {
      $tryOnBackup.set({
        config: $config.get()
      })
    }
    $tryOnSkin.set(skin)
  }

  function exitTryOn() {
    const backup = $tryOnBackup.get()
    if (backup) {
      $config.set(backup.config)
      ctx.storage.set('config', backup.config)
      $tryOnBackup.set(null)
    }
    $tryOnSkin.set(null)
  }

  function applyTryOn() {
    const skin = $tryOnSkin.get()
    if (skin) {
      saveConfig(prev => ({
        ...prev,
        activeSkinId: skin.id,
        wallpaperEnabled: true,
        wallpaperType: skin.wallpaperType || 'image',
        wallpaperSource: skin.wallpaper || prev.wallpaperSource,
        wallpaperBlur: skin.defaultBlur !== undefined ? skin.defaultBlur : prev.wallpaperBlur,
        maskOcclusion: skin.defaultOcclusion !== undefined ? skin.defaultOcclusion : prev.maskOcclusion
      }))
    }
    $tryOnBackup.set(null)
    $tryOnSkin.set(null)
  }

  return {
    $config,
    $tryOnSkin,
    $tryOnBackup,
    saveConfig,
    startTryOn,
    exitTryOn,
    applyTryOn
  }
}
