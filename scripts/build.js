/**
 * Build script to generate standalone single-file ESM plugin.js
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')

const i18nCode = fs.readFileSync(path.join(rootDir, 'src/i18n.js'), 'utf8')
const backdropCode = fs.readFileSync(path.join(rootDir, 'src/engine/backdrop-manager.js'), 'utf8')
const glassCode = fs.readFileSync(path.join(rootDir, 'src/engine/glass-controller.js'), 'utf8')
const rangeCode = fs.readFileSync(path.join(rootDir, 'src/engine/range-controller.js'), 'utf8')
const configCode = fs.readFileSync(path.join(rootDir, 'src/engine/config.js'), 'utf8')
const storageCode = fs.readFileSync(path.join(rootDir, 'src/engine/storage-manager.js'), 'utf8')
const appearanceControllerCode = fs.readFileSync(path.join(rootDir, 'src/engine/appearance-controller.js'), 'utf8')
const fontControllerCode = fs.readFileSync(path.join(rootDir, 'src/engine/font-controller.js'), 'utf8')
const fxOverlayCode = fs.readFileSync(path.join(rootDir, 'src/engine/fx-overlay.js'), 'utf8')
const parallaxCode = fs.readFileSync(path.join(rootDir, 'src/engine/parallax-controller.js'), 'utf8')
const themeFollowCode = fs.readFileSync(path.join(rootDir, 'src/engine/theme-follow-controller.js'), 'utf8')
const watcherCode = fs.readFileSync(path.join(rootDir, 'src/engine/theme-watcher.js'), 'utf8')
const weLibraryCode = fs.readFileSync(path.join(rootDir, 'src/engine/we-library.js'), 'utf8')
const wallpaperApplyCode = fs.readFileSync(path.join(rootDir, 'src/engine/wallpaper-apply.js'), 'utf8')
const rotationCode = fs.readFileSync(path.join(rootDir, 'src/engine/rotation-controller.js'), 'utf8')
const sceneBackendCode = fs.readFileSync(path.join(rootDir, 'src/engine/scene-backend.js'), 'utf8')
const sceneLiveCode = fs.readFileSync(path.join(rootDir, 'src/engine/scene-live.js'), 'utf8')
const wePanelCode = fs.readFileSync(path.join(rootDir, 'src/ui/WallpaperEnginePanel.js'), 'utf8')
const rotationEditorCode = fs.readFileSync(path.join(rootDir, 'src/ui/RotationGroupEditor.js'), 'utf8')
const fontSettingsCode = fs.readFileSync(path.join(rootDir, 'src/ui/FontSettingsPanel.js'), 'utf8')
const appearanceSettingsCode = fs.readFileSync(path.join(rootDir, 'src/ui/AppearanceSettingsPanel.js'), 'utf8')
const appearanceEntryCode = fs.readFileSync(path.join(rootDir, 'src/ui/appearance-entry.js'), 'utf8')

// Clean internal imports & exports from submodules
function stripImportsAndExports(code) {
  return code
    .replace(/^import\s+[\s\S]*?from\s+['"][^'"]+['"];?/gm, '')
    .replace(/^export\s+(async\s+)?(const|class|function|let|var)\s+/gm, '$1$2 ')
    .replace(/^export\s+default\s+[\s\S]*?;?/gm, '')
    .trim()
}

function moduleScope(code, exportNames) {
  const names = exportNames.join(', ')
  return `const { ${names} } = (() => {\n${stripImportsAndExports(code)}\nreturn { ${names} }\n})()`
}

const bundled = `/**
 * Hermes Wallpaper Engine (hermes-skins)
 * Version: ${JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf8')).version}
 * Author: CaptainMusX
 * 
 * Standalone Desktop Plugin for Hermes Desktop.
 * Provides the Wallpaper Engine library, Scene/Web/video/image rendering and
 * liquid-glass surfaces, exposed from Settings ▸ Appearance.
 *
 * Third-party portions: WebWallGL 3.0.1 (MIT, oneincase), the renderer page and
 * layer/pointer/pause lifecycle adapted from dsh-wallpaper-engine (MIT, elysia395),
 * and the legacy dsh-skins parser vendored for compatibility (82f42bd3).
 * Changes in this generated file: third-party imports/exports removed and modules
 * concatenated; scene rendering moved to the signed WebWallGL media origin.
 * See LICENSING.md, THIRD-PARTY-NOTICES.md and the accompanying complete license texts.
 */

import {
  APPEARANCE_AREAS, atom, Button, host, Input, pluginSettingsHref, SegmentedControl, Switch,
  setAccentOverride, usePluginI18n, useValue
} from '@hermes/plugin-sdk'
import { useEffect, useRef, useState } from 'react'
import { jsx, jsxs } from 'react/jsx-runtime'

// ─── Submodule: i18n ──────────────────────────────────────────
${stripImportsAndExports(i18nCode)}

// ─── Submodule: Backdrop Manager ──────────────────────────────
${stripImportsAndExports(sceneLiveCode)}

${stripImportsAndExports(backdropCode)}

// ─── Submodule: Glass Controller ──────────────────────────────
${stripImportsAndExports(glassCode)}

// ─── Submodule: Global Range Controller ──────────────────────
${stripImportsAndExports(rangeCode)}

// ─── Submodule: Storage ───────────────────────────────────────
${stripImportsAndExports(configCode)}

${stripImportsAndExports(storageCode)}

// ─── Submodule: Appearance Controller ─────────────────────────
${stripImportsAndExports(appearanceControllerCode)}

${stripImportsAndExports(fontControllerCode)}

${stripImportsAndExports(fxOverlayCode)}

${stripImportsAndExports(parallaxCode)}

${stripImportsAndExports(themeFollowCode)}

// ─── Submodule: Root-Theme Watcher ────────────────────────────
${stripImportsAndExports(watcherCode)}

// ─── Submodule: Wallpaper Engine Library ─────────────────────
${stripImportsAndExports(weLibraryCode)}

${stripImportsAndExports(wallpaperApplyCode)}

${stripImportsAndExports(sceneBackendCode)}

// ─── Submodule: Wallpaper rotation ───────────────────────────
${stripImportsAndExports(rotationCode)}

// ─── Submodule: Wallpaper Engine Panel ───────────────────────
${moduleScope(wePanelCode, ['WallpaperEnginePanel'])}

// ─── Submodule: Rotation group editor ────────────────────────
${moduleScope(rotationEditorCode, ['RotationGroupEditor'])}

// ─── Submodule: Font settings ────────────────────────────────
${moduleScope(fontSettingsCode, ['FontSettingsPanel'])}

// ─── Submodule: Appearance Settings Panel ─────────────────────
${moduleScope(appearanceSettingsCode, ['AppearanceSettingsPanel'])}

// ─── Submodule: Appearance settings entry ─────────────────────
${moduleScope(appearanceEntryCode, ['mountAppearanceEntry'])}

// ─── Plugin Registration Entry ────────────────────────────────
const PLUGIN_ID = 'hermes-skins'

export default {
  id: PLUGIN_ID,
  name: 'Hermes Wallpaper Engine',
  defaultEnabled: true,

  register(ctx) {
    const rest = typeof ctx.rest === 'function'
      ? (path, options) => ctx.rest(path, options)
      : async () => ({ ok: false, error: 'plugin backend unavailable' })
    // 1. Register I18N
    ctx.i18n.register(I18N_DICTIONARY)

    // 2. Initialize engines & state
    const store = createAppearanceStore(ctx)
    const openScene = payload => rest('/scene/open', { method: 'POST', body: payload })
    const backdropManager = new BackdropManager({ openScene })
    const glassController = new GlassController()
    const rangeController = new RangeController()
    rangeController.start()
    const fontController = new FontController({ setAccentOverride })
    const fxOverlay = new FxOverlay()
    const parallax = new ParallaxController()
    const themeFollow = new ThemeFollowController()
    const controller = new AppearanceController(store, backdropManager, glassController,
      [fontController, fxOverlay, parallax, themeFollow])
    const rotation = new WallpaperRotation(store, openScene, controller, backdropManager)

    const loadFonts = () => rest('/fonts')
    const loadUploads = () => rest('/uploads')
    const importUploads = paths => rest('/uploads/import', { method: 'POST', body: { paths } })
    const importUrl = url => rest('/uploads/url', { method: 'POST', body: { url } })
    const importBing = () => rest('/uploads/bing', { method: 'POST', body: { index: 0 } })
    const loadDiagnostics = () => rest('/system/diagnostics')
    const clearSceneCache = () => rest('/system/cache/clear', { method: 'POST', body: { scope: 'scene' } })
    const loadNowPlaying = () => rest('/now-playing')
    let nowPlayingBusy = false
    const refreshNowPlaying = async () => {
      const current = store.$config.get()
      if (!['scene', 'web'].includes(current.wallpaperType)) {
        backdropManager.setMediaSnapshot(null)
        return
      }
      if (nowPlayingBusy) return
      nowPlayingBusy = true
      try {
        backdropManager.setMediaSnapshot(await loadNowPlaying())
      } catch {
        backdropManager.setMediaSnapshot(null)
      } finally {
        nowPlayingBusy = false
      }
    }
    const stopNowPlayingPoll = typeof ctx.setInterval === 'function'
      ? ctx.setInterval(() => void refreshNowPlaying(), 5000)
      : null
    void refreshNowPlaying()
    const panel = () => jsx(AppearanceSettingsPanel, {
      store, controller, openScene, loadFonts, loadUploads, importUploads, importUrl,
      importBing, loadDiagnostics, clearSceneCache, loadNowPlaying
    })
    const openPanel = () => {
      try { host.navigate(pluginSettingsHref('hermes-skins:wallpaper')) }
      catch { host.navigate('/settings?tab=plugins') }
    }

    // 3. The full page lives in Settings ▸ Plugins; the Appearance rail shows
    //    a small door at the end of its General section. Both are removed with
    //    the plugin. appearance.extra remains for hosts that render the
    //    Appearance root view.
    if (typeof ctx.registerSettingsPage === 'function') {
      ctx.registerSettingsPage({
        id: 'wallpaper',
        title: '壁纸引擎',
        icon: 'symbol-color',
        order: 20,
        render: panel
      })
    }
    ctx.register({
      id: 'appearance-panel',
      area: APPEARANCE_AREAS.extra,
      render: panel
    })
    const disposeAppearanceEntry = mountAppearanceEntry({
      getSummary: () => {
        const config = store.$config.get()
        return config.weSelection?.title ||
          config.wallpaperSource.split(/[\\\\/]/).filter(Boolean).at(-1) ||
          'Scene / Web / 视频 / 图片壁纸与液态玻璃。'
      },
      open: openPanel
    })

    // 4. Runtime theme watcher keeps the veil/surface mode in sync with Hermes.
    const disposeThemeWatcher = watchRootTheme(controller)
    controller.sync()

    // 5. Teardown on plugin reload / dispose.
    if (typeof ctx.onDispose === 'function') {
      ctx.onDispose(() => {
        disposeThemeWatcher()
        disposeAppearanceEntry()
        if (typeof stopNowPlayingPoll === 'function') stopNowPlayingPoll()
        rotation.destroy()
        rangeController.destroy()
        controller.destroy()
        store.destroy()
      })
    }
  }
}
`

const outPath = path.join(rootDir, 'plugin.js')
const cleanBundle = bundled.replace(/[ \t]+$/gm, '')
fs.writeFileSync(outPath, cleanBundle, 'utf8')
console.log(`[build] Successfully compiled standalone plugin to ${outPath} (${Buffer.byteLength(cleanBundle)} bytes)`)
