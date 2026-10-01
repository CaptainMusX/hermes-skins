/**
 * Build script to generate standalone single-file ESM plugin.js
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')

const i18nCode = fs.readFileSync(path.join(rootDir, 'src/i18n.js'), 'utf8')
const catalogCode = fs.readFileSync(path.join(rootDir, 'src/catalog/builtin-skins.js'), 'utf8')
const backdropCode = fs.readFileSync(path.join(rootDir, 'src/engine/backdrop-manager.js'), 'utf8')
const glassCode = fs.readFileSync(path.join(rootDir, 'src/engine/glass-controller.js'), 'utf8')
const rangeCode = fs.readFileSync(path.join(rootDir, 'src/engine/range-controller.js'), 'utf8')
const configCode = fs.readFileSync(path.join(rootDir, 'src/engine/config.js'), 'utf8')
const contrastCode = fs.readFileSync(path.join(rootDir, 'src/engine/color-contrast.js'), 'utf8')
const storageCode = fs.readFileSync(path.join(rootDir, 'src/engine/storage-manager.js'), 'utf8')
const controllerCode = fs.readFileSync(path.join(rootDir, 'src/engine/skin-controller.js'), 'utf8')
const watcherCode = fs.readFileSync(path.join(rootDir, 'src/engine/theme-watcher.js'), 'utf8')
const weLibraryCode = fs.readFileSync(path.join(rootDir, 'src/engine/we-library.js'), 'utf8')
const sceneCode = fs.readFileSync(path.join(rootDir, 'src/engine/scene-player.js'), 'utf8')
const webCode = fs.readFileSync(path.join(rootDir, 'src/engine/web-player.js'), 'utf8')
const playerCode = fs.readFileSync(path.join(rootDir, 'third_party/dsh-skins/we-player-source.ts'), 'utf8')
const shimCode = fs.readFileSync(path.join(rootDir, 'third_party/dsh-skins/we-shim-source.ts'), 'utf8')
const tryOnBannerCode = fs.readFileSync(path.join(rootDir, 'src/ui/TryOnBanner.js'), 'utf8')
const studioCode = fs.readFileSync(path.join(rootDir, 'src/ui/CustomThemeStudio.js'), 'utf8')
const wePanelCode = fs.readFileSync(path.join(rootDir, 'src/ui/WallpaperEnginePanel.js'), 'utf8')
const pageCode = fs.readFileSync(path.join(rootDir, 'src/ui/SkinCenterPage.js'), 'utf8')

// Clean internal imports & exports from submodules
function stripImportsAndExports(code) {
  return code
    .replace(/^import\s+[\s\S]*?from\s+['"][^'"]+['"];?/gm, '')
    .replace(/^export\s+(async\s+)?(const|class|function|let|var)\s+/gm, '$1$2 ')
    .replace(/^export\s+default\s+[\s\S]*?;?/gm, '')
    .trim()
}

const bundled = `/**
 * Hermes Skin Center (hermes-skins)
 * Version: ${JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf8')).version}
 * Author: CaptainMusX (inspired by dsh-skins)
 * 
 * Standalone Desktop Plugin for Hermes Desktop.
 * Provides skin gallery, custom wallpaper/video engine, glassmorphism translucency,
 * try-on/apply workflows, and theme studio.
 */

import {
  atom, Badge, Button, host, Input,
  PALETTE_AREA, ROUTES_AREA, SegmentedControl, SIDEBAR_NAV_AREA,
  Switch, THEMES_AREA,
  usePluginI18n, useTheme, useValue
} from '@hermes/plugin-sdk'
import { useState, useEffect, useLayoutEffect, useRef } from 'react'
import { jsx, jsxs } from 'react/jsx-runtime'

// ─── Submodule: i18n ──────────────────────────────────────────
${stripImportsAndExports(i18nCode)}

// ─── Submodule: Catalog ───────────────────────────────────────
${stripImportsAndExports(catalogCode)}

// ─── Submodule: Backdrop Manager ──────────────────────────────
${stripImportsAndExports(backdropCode)}

// ─── Submodule: Glass Controller ──────────────────────────────
${stripImportsAndExports(glassCode)}

// ─── Submodule: Global Range Controller ──────────────────────
${stripImportsAndExports(rangeCode)}

// ─── Submodule: Storage ───────────────────────────────────────
${stripImportsAndExports(configCode)}

${stripImportsAndExports(contrastCode)}

${stripImportsAndExports(storageCode)}

// ─── Submodule: Skin Controller ───────────────────────────────
${stripImportsAndExports(controllerCode)}

// ─── Submodule: Root-Theme Watcher ────────────────────────────
${stripImportsAndExports(watcherCode)}

// ─── Submodule: Wallpaper Engine Library ─────────────────────
${stripImportsAndExports(weLibraryCode)}

// ─── Third-party MIT WebGL player from dsh-skins ─────────────
${stripImportsAndExports(playerCode)}

${stripImportsAndExports(shimCode)}

// ─── Scene Player Bridge ─────────────────────────────────────
${stripImportsAndExports(sceneCode)}

// ─── Sandboxed Web Wallpaper Bridge ──────────────────────────
${stripImportsAndExports(webCode)}

// ─── Submodule: Try-On Banner ─────────────────────────────────
${stripImportsAndExports(tryOnBannerCode)}

// ─── Submodule: Custom Theme Studio ───────────────────────────
${stripImportsAndExports(studioCode)}

// ─── Submodule: Wallpaper Engine Panel ───────────────────────
${stripImportsAndExports(wePanelCode)}

// ─── Submodule: Skin Center Page ──────────────────────────────
${stripImportsAndExports(pageCode)}

// ─── Plugin Registration Entry ────────────────────────────────
const PLUGIN_ID = 'hermes-skins'

export default {
  id: PLUGIN_ID,
  name: 'Hermes Skin Center',
  defaultEnabled: true,

  register(ctx) {
    // 1. Register I18N
    ctx.i18n.register(I18N_DICTIONARY)

    // 2. Initialize engines & state
    const store = createSkinStore(ctx)
    const backdropManager = new BackdropManager()
    const glassController = new GlassController()
    const rangeController = new RangeController()
    rangeController.start()
    const controller = new SkinController(store, BUILTIN_SKINS, backdropManager, glassController)

    // 3. Register themes to core THEMES_AREA
    for (const skin of BUILTIN_SKINS) {
      ctx.register({
        id: \`theme-\${skin.id}\`,
        area: THEMES_AREA,
        data: toThemeContribution(skin)
      })
    }
    for (const skin of store.$config.get().customSkins) {
      ctx.register({ id: \`theme-\${skin.id}\`, area: THEMES_AREA, data: toThemeContribution(skin) })
    }

    // 4. Register Full Page Route (/skins)
    ctx.register({
      id: 'page',
      area: ROUTES_AREA,
      data: { path: '/skins' },
      render: () => jsx(SkinCenterPage, { store, controller,
        prepareScene: dir => ctx.rest('/scene/prepare', { method: 'POST', body: { dir } }) })
    })

    // 5. Register Sidebar Navigation Entry
    ctx.register({
      id: 'sidebar-nav',
      area: SIDEBAR_NAV_AREA,
      order: 85,
      data: {
        path: '/skins',
        label: '皮肤中心',
        codicon: 'symbol-color'
      }
    })

    // 6. Runtime theme watcher. The old status-bar chip carried this sync in a
    //    React effect; the watcher runs independent of any page or status-bar
    //    visibility, watches only the root theme attributes, and is disposed
    //    with the plugin. The bottom bar keeps no skin entry at all — the skin
    //    center page and the command palette remain the entries.
    const disposeThemeWatcher = watchRootTheme(store, controller)

    // 7. Register Command Palette actions
    ctx.register({
      id: 'cmd-open-skins',
      area: PALETTE_AREA,
      data: {
        id: 'hermes-skins.open-gallery',
        title: 'Skin Center: Open Gallery / 皮肤中心: 打开画廊',
        keywords: ['skin', 'theme', 'wallpaper', 'gallery', '换肤', '皮肤', '壁纸'],
        run: () => host.navigate('/skins')
      }
    })

    ctx.register({
      id: 'cmd-toggle-wallpaper',
      area: PALETTE_AREA,
      data: {
        id: 'hermes-skins.toggle-wallpaper',
        title: 'Skin Center: Toggle Wallpaper / 皮肤中心: 切换壁纸开关',
        keywords: ['skin', 'wallpaper', 'toggle', '壁纸'],
        run: () => {
          const next = !store.$config.get().wallpaperEnabled
          controller.changeConfig({ wallpaperEnabled: next })
          host.notify({
            kind: 'info',
            message: next ? 'Custom wallpaper enabled' : 'Custom wallpaper disabled'
          })
        }
      }
    })

    // Hermes owns the selected theme. A stored plugin selection never overrides it.
    if (typeof document !== 'undefined') {
      controller.sync(document.documentElement.dataset.hermesTheme || null,
        document.documentElement.dataset.hermesMode || 'dark')
    }

    // 9. Teardown on plugin reload / dispose: backdrop DOM, runtime CSS, the
    //    composer frost layer and the theme watcher all release together.
    if (typeof ctx.onDispose === 'function') {
      ctx.onDispose(() => {
        disposeThemeWatcher()
        rangeController.destroy()
        controller.destroy()
      })
    }
  }
}
`

const outPath = path.join(rootDir, 'plugin.js')
const cleanBundle = bundled.replace(/[ \t]+$/gm, '')
fs.writeFileSync(outPath, cleanBundle, 'utf8')
console.log(`[build] Successfully compiled standalone plugin to ${outPath} (${Buffer.byteLength(cleanBundle)} bytes)`)
