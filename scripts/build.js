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
const storageCode = fs.readFileSync(path.join(rootDir, 'src/engine/storage-manager.js'), 'utf8')
const tryOnBannerCode = fs.readFileSync(path.join(rootDir, 'src/ui/TryOnBanner.js'), 'utf8')
const studioCode = fs.readFileSync(path.join(rootDir, 'src/ui/CustomThemeStudio.js'), 'utf8')
const pageCode = fs.readFileSync(path.join(rootDir, 'src/ui/SkinCenterPage.js'), 'utf8')
const chipCode = fs.readFileSync(path.join(rootDir, 'src/ui/StatusBarChip.js'), 'utf8')

// Clean internal imports & exports from submodules
function stripImportsAndExports(code) {
  return code
    .replace(/^import\s+[\s\S]*?from\s+['"][^'"]+['"];?/gm, '')
    .replace(/^export\s+(const|class|function|let|var)\s+/gm, '$1 ')
    .replace(/^export\s+default\s+[\s\S]*?;?/gm, '')
    .trim()
}

const bundled = `/**
 * Hermes Skin Center (hermes-skins)
 * Version: 1.0.0
 * Author: CaptainMusX (inspired by dsh-skins)
 * 
 * Standalone Desktop Plugin for Hermes Desktop.
 * Provides skin gallery, custom wallpaper/video engine, glassmorphism translucency,
 * try-on/apply workflows, and theme studio.
 */

import {
  atom, Badge, Button, Codicon, haptic, host, Input,
  PALETTE_AREA, Popover, PopoverContent, PopoverTrigger,
  ROUTES_AREA, SegmentedControl, SIDEBAR_NAV_AREA,
  STATUSBAR_AREAS, Switch, THEMES_AREA, Tip,
  usePluginI18n, useTheme, useValue
} from '@hermes/plugin-sdk'
import { useState, useEffect } from 'react'
import { jsx, jsxs } from 'react/jsx-runtime'

// ─── Submodule: i18n ──────────────────────────────────────────
${stripImportsAndExports(i18nCode)}

// ─── Submodule: Catalog ───────────────────────────────────────
${stripImportsAndExports(catalogCode)}

// ─── Submodule: Backdrop Manager ──────────────────────────────
${stripImportsAndExports(backdropCode)}

// ─── Submodule: Glass Controller ──────────────────────────────
${stripImportsAndExports(glassCode)}

// ─── Submodule: Storage ───────────────────────────────────────
${stripImportsAndExports(storageCode)}

// ─── Submodule: Try-On Banner ─────────────────────────────────
${stripImportsAndExports(tryOnBannerCode)}

// ─── Submodule: Custom Theme Studio ───────────────────────────
${stripImportsAndExports(studioCode)}

// ─── Submodule: Skin Center Page ──────────────────────────────
${stripImportsAndExports(pageCode)}

// ─── Submodule: Status Bar Chip ───────────────────────────────
${stripImportsAndExports(chipCode)}

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

    // 3. Register themes to core THEMES_AREA
    for (const skin of BUILTIN_SKINS) {
      ctx.register({
        id: \`theme-\${skin.id}\`,
        area: THEMES_AREA,
        data: {
          name: skin.id,
          label: skin.name,
          description: skin.tagline || skin.description,
          colors: skin.colors,
          darkColors: skin.darkColors,
          customCSS: skin.customCSS
        }
      })
    }

    // 4. Register Full Page Route (/skins)
    ctx.register({
      id: 'page',
      area: ROUTES_AREA,
      data: { path: '/skins' },
      render: () => jsx(SkinCenterPage, { store, backdropManager, glassController })
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

    // 6. Register Status Bar Chip
    ctx.register({
      id: 'status-chip',
      area: STATUSBAR_AREAS.right,
      order: 140,
      render: () => jsx(StatusBarChip, { store, backdropManager, glassController })
    })

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
          const conf = store.$config.get()
          const next = !conf.wallpaperEnabled
          store.saveConfig({ wallpaperEnabled: next })
          backdropManager.update({
            enabled: next,
            type: conf.wallpaperType,
            src: conf.wallpaperSource,
            blur: conf.wallpaperBlur,
            occlusion: conf.maskOcclusion
          })
          glassController.update({
            enabled: next,
            glassTransparency: conf.panelGlass,
            bubbleOpacity: conf.bubbleOpacity,
            composerFrost: conf.composerFrost
          })
          host.notify({
            kind: 'info',
            message: next ? 'Custom wallpaper enabled' : 'Custom wallpaper disabled'
          })
        }
      }
    })

    // 8. Boot-time restoration (Anti-FOUC)
    const initialConfig = store.$config.get()
    if (initialConfig.activeSkinId && initialConfig.activeSkinId !== 'default') {
      const activeSkin = BUILTIN_SKINS.find(s => s.id === initialConfig.activeSkinId)
      if (activeSkin) {
        backdropManager.update({
          enabled: initialConfig.wallpaperEnabled,
          type: initialConfig.wallpaperType,
          src: initialConfig.wallpaperSource || activeSkin.wallpaper,
          blur: initialConfig.wallpaperBlur,
          occlusion: initialConfig.maskOcclusion,
          isDark: true
        })
        glassController.update({
          enabled: true,
          glassTransparency: initialConfig.panelGlass,
          bubbleOpacity: initialConfig.bubbleOpacity,
          composerFrost: initialConfig.composerFrost,
          customCSS: activeSkin.customCSS,
          isDark: true
        })
      }
    }

    // 9. Teardown on plugin reload / dispose
    if (typeof ctx.onDispose === 'function') {
      ctx.onDispose(() => {
        backdropManager.destroy()
        glassController.destroy()
      })
    }
  }
}
`

const outPath = path.join(rootDir, 'plugin.js')
fs.writeFileSync(outPath, bundled, 'utf8')
console.log(`[build] Successfully compiled standalone plugin to ${outPath} (${bundled.length} bytes)`)
