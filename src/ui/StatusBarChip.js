/**
 * Status Bar Chip & Quick Popover for Hermes Desktop
 * Area: statusBar.right
 */

import {
  Button, haptic, host, Popover, PopoverContent, PopoverTrigger,
  Switch, Tip, usePluginI18n, useTheme, useValue
} from '@hermes/plugin-sdk'
import { jsx, jsxs } from 'react/jsx-runtime'
import { BUILTIN_SKINS } from '../catalog/builtin-skins.js'

export function StatusBarChip({ store, backdropManager, glassController }) {
  const t = usePluginI18n('hermes-skins')
  const { setTheme } = useTheme()
  const config = useValue(store.$config)
  const tryOnSkin = useValue(store.$tryOnSkin)

  const activeId = tryOnSkin ? tryOnSkin.id : config.activeSkinId
  const allSkins = [...BUILTIN_SKINS, ...(config.customSkins || [])]
  const currentSkin = allSkins.find(s => s.id === activeId)
  const skinName = currentSkin ? (currentSkin.name || currentSkin.nameEn) : t('resetToDefault')
  const skinAccent = currentSkin ? currentSkin.accent : 'var(--ui-accent)'

  function handleQuickSwitch(e) {
    const targetId = e.target.value
    if (targetId === 'default') {
      store.saveConfig({ activeSkinId: 'default', wallpaperEnabled: false })
      setTheme('default')
      backdropManager.update({ enabled: false })
      glassController.update({ enabled: false })
      return
    }
    const skin = allSkins.find(s => s.id === targetId)
    if (skin) {
      store.saveConfig(prev => ({
        ...prev,
        activeSkinId: skin.id,
        wallpaperEnabled: true,
        wallpaperType: skin.wallpaperType || 'image',
        wallpaperSource: skin.wallpaper || prev.wallpaperSource,
        wallpaperBlur: skin.defaultBlur !== undefined ? skin.defaultBlur : prev.wallpaperBlur,
        maskOcclusion: skin.defaultOcclusion !== undefined ? skin.defaultOcclusion : prev.maskOcclusion
      }))
      setTheme(skin.id)
      backdropManager.update({
        enabled: true,
        type: skin.wallpaperType || 'image',
        src: skin.wallpaper,
        blur: skin.defaultBlur !== undefined ? skin.defaultBlur : config.wallpaperBlur,
        occlusion: skin.defaultOcclusion !== undefined ? skin.defaultOcclusion : config.maskOcclusion
      })
      glassController.update({
        enabled: true,
        glassTransparency: config.panelGlass,
        bubbleOpacity: config.bubbleOpacity,
        composerFrost: config.composerFrost,
        customCSS: skin.customCSS
      })
    }
  }

  return jsx(Popover, {
    children: [
      jsx(PopoverTrigger, {
        asChild: true,
        children: jsx(Tip, {
          label: t('statusBarTooltip'),
          children: jsxs('button', {
            type: 'button',
            onClick: () => haptic('tap'),
            className: 'inline-flex h-full items-center gap-1.5 px-2 text-[0.6875rem] font-medium transition-colors text-muted-foreground hover:bg-muted/60 hover:text-foreground',
            children: [
              jsx('span', {
                className: 'h-2 w-2 rounded-full shadow-xs',
                style: { backgroundColor: skinAccent }
              }),
              jsx('span', {
                className: 'max-w-[80px] truncate',
                children: skinName
              })
            ]
          })
        })
      }),
      jsx(PopoverContent, {
        align: 'end',
        side: 'top',
        className: 'w-72 p-4 shadow-xl border border-border/70 bg-popover/95 backdrop-blur-xl',
        children: jsxs('div', {
          className: 'flex flex-col gap-3',
          children: [
            // Top Bar
            jsxs('div', {
              className: 'flex items-center justify-between border-b border-border/40 pb-2',
              children: [
                jsx('span', {
                  className: 'text-xs font-semibold text-foreground',
                  children: t('quickSwitchSkin')
                }),
                jsx('button', {
                  type: 'button',
                  onClick: () => host.navigate('/skins'),
                  className: 'text-[11px] text-primary hover:underline font-medium',
                  children: '→ ' + t('tabGallery')
                })
              ]
            }),

            // Skin Select dropdown
            jsxs('div', {
              className: 'flex flex-col gap-1',
              children: [
                jsx('label', { className: 'text-[11px] text-muted-foreground', children: t('tabGallery') }),
                jsx('select', {
                  value: activeId,
                  onChange: handleQuickSwitch,
                  className: 'h-8 w-full rounded border border-border bg-card px-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary',
                  children: [
                    jsx('option', { value: 'default', children: `⚪ ${t('resetToDefault')}` }),
                    allSkins.map(s => (
                      jsx('option', { key: s.id, value: s.id, children: `🎨 ${s.name || s.nameEn}` })
                    ))
                  ]
                })
              ]
            }),

            // Quick Wallpaper Switch
            jsxs('div', {
              className: 'flex items-center justify-between pt-1',
              children: [
                jsx('span', { className: 'text-xs text-foreground', children: t('enableWallpaper') }),
                jsx(Switch, {
                  checked: config.wallpaperEnabled,
                  onCheckedChange: val => {
                    store.saveConfig({ wallpaperEnabled: val })
                    backdropManager.update({
                      enabled: val,
                      type: config.wallpaperType,
                      src: config.wallpaperSource,
                      blur: config.wallpaperBlur,
                      occlusion: config.maskOcclusion
                    })
                    glassController.update({
                      enabled: val,
                      glassTransparency: config.panelGlass,
                      bubbleOpacity: config.bubbleOpacity,
                      composerFrost: config.composerFrost
                    })
                  }
                })
              ]
            }),

            // Quick Blur Slider
            jsxs('div', {
              className: 'flex flex-col gap-1 pt-1',
              children: [
                jsxs('div', {
                  className: 'flex items-center justify-between text-[11px] text-muted-foreground',
                  children: [
                    jsx('span', { children: t('wallpaperBlur') }),
                    jsx('span', { className: 'font-mono', children: `${config.wallpaperBlur}px` })
                  ]
                }),
                jsx('input', {
                  type: 'range',
                  min: 0,
                  max: 20,
                  step: 1,
                  value: config.wallpaperBlur,
                  onChange: e => {
                    const val = parseInt(e.target.value, 10)
                    store.saveConfig({ wallpaperBlur: val })
                    backdropManager.update({
                      enabled: config.wallpaperEnabled,
                      type: config.wallpaperType,
                      src: config.wallpaperSource,
                      blur: val,
                      occlusion: config.maskOcclusion
                    })
                  },
                  className: 'w-full accent-primary h-1.5 cursor-pointer'
                })
              ]
            }),

            // Full Settings Button
            jsx(Button, {
              size: 'sm',
              variant: 'outline',
              className: 'mt-1 w-full text-xs',
              onClick: () => host.navigate('/skins'),
              children: t('pluginName')
            })
          ]
        })
      })
    ]
  })
}
