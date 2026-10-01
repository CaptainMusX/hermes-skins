/**
 * Main Skin Center Page for Hermes Desktop
 * Route: /skins (or accessible via sidebar nav & palette)
 */

import {
  Badge, Button, Input, SegmentedControl, Switch,
  usePluginI18n, useTheme, useValue
} from '@hermes/plugin-sdk'
import { useState } from 'react'
import { jsx, jsxs } from 'react/jsx-runtime'
import { BUILTIN_SKINS, WALLPAPER_PRESETS } from '../catalog/builtin-skins.js'
import { CustomThemeStudio } from './CustomThemeStudio.js'
import { TryOnBanner } from './TryOnBanner.js'

export function SkinCenterPage({ store, backdropManager, glassController }) {
  const t = usePluginI18n('hermes-skins')
  const { setTheme, themeName } = useTheme()
  const config = useValue(store.$config)
  const tryOnSkin = useValue(store.$tryOnSkin)

  const [activeTab, setActiveTab] = useState('gallery')
  const [selectedTag, setSelectedTag] = useState('all')

  const allSkins = [...BUILTIN_SKINS, ...(config.customSkins || [])]

  const filteredSkins = allSkins.filter(skin => {
    if (selectedTag === 'all') return true
    return skin.tags && skin.tags.includes(selectedTag)
  })

  // Action handlers
  function handleTryOn(skin) {
    store.startTryOn(skin)
    if (skin.id !== 'official-default') {
      setTheme(skin.id)
      backdropManager.update({
        enabled: true,
        type: skin.wallpaperType || 'image',
        src: skin.wallpaper,
        blur: skin.defaultBlur !== undefined ? skin.defaultBlur : config.wallpaperBlur,
        occlusion: skin.defaultOcclusion !== undefined ? skin.defaultOcclusion : config.maskOcclusion,
        isDark: true
      })
      glassController.update({
        enabled: true,
        glassTransparency: config.panelGlass,
        bubbleOpacity: config.bubbleOpacity,
        composerFrost: config.composerFrost,
        customCSS: skin.customCSS,
        isDark: true
      })
    }
  }

  function handleExitTryOn() {
    store.exitTryOn()
    const active = allSkins.find(s => s.id === config.activeSkinId)
    if (active) {
      setTheme(active.id)
      backdropManager.update({
        enabled: config.wallpaperEnabled,
        type: config.wallpaperType,
        src: config.wallpaperSource || active.wallpaper,
        blur: config.wallpaperBlur,
        occlusion: config.maskOcclusion,
        isDark: true
      })
      glassController.update({
        enabled: true,
        glassTransparency: config.panelGlass,
        bubbleOpacity: config.bubbleOpacity,
        composerFrost: config.composerFrost,
        customCSS: active.customCSS,
        isDark: true
      })
    } else {
      setTheme('default')
      backdropManager.update({ enabled: false })
      glassController.update({ enabled: false })
    }
  }

  function handleApply(skin) {
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
      occlusion: skin.defaultOcclusion !== undefined ? skin.defaultOcclusion : config.maskOcclusion,
      isDark: true
    })
    glassController.update({
      enabled: true,
      glassTransparency: config.panelGlass,
      bubbleOpacity: config.bubbleOpacity,
      composerFrost: config.composerFrost,
      customCSS: skin.customCSS,
      isDark: true
    })

    store.$tryOnSkin.set(null)
    store.$tryOnBackup.set(null)
  }

  function handleResetDefault() {
    store.saveConfig(prev => ({
      ...prev,
      activeSkinId: 'default',
      wallpaperEnabled: false
    }))
    setTheme('default')
    backdropManager.update({ enabled: false })
    glassController.update({ enabled: false })
    store.$tryOnSkin.set(null)
    store.$tryOnBackup.set(null)
  }

  return jsxs('div', {
    className: 'flex h-full w-full flex-col overflow-y-auto p-6 md:p-8',
    children: [
      // Header Section
      jsxs('div', {
        className: 'mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border/40 pb-5',
        children: [
          jsxs('div', {
            className: 'flex flex-col gap-1',
            children: [
              jsx('h1', {
                className: 'text-2xl font-bold tracking-tight text-foreground',
                children: t('pluginName')
              }),
              jsx('p', {
                className: 'text-xs text-muted-foreground',
                children: t('pluginDesc')
              })
            ]
          }),
          jsx('div', {
            className: 'w-fit',
            children: jsx(SegmentedControl, {
              value: activeTab,
              onValueChange: setActiveTab,
              options: [
                { id: 'gallery', label: t('tabGallery') },
                { id: 'wallpaper', label: t('tabWallpaper') },
                { id: 'studio', label: t('tabStudio') }
              ]
            })
          })
        ]
      }),

      // Floating Try-On Banner
      jsx(TryOnBanner, {
        store,
        onApply: () => {
          if (tryOnSkin) handleApply(tryOnSkin)
        },
        onExit: handleExitTryOn
      }),

      // TAB 1: Gallery View
      activeTab === 'gallery' && jsxs('div', {
        className: 'flex flex-col gap-6',
        children: [
          // Filter Tags Bar
          jsxs('div', {
            className: 'flex flex-wrap items-center gap-2',
            children: [
              jsx('span', { className: 'text-xs text-muted-foreground mr-1', children: t('filterByTag') + ':' }),
              ['all', 'art', 'anime', 'dark', 'light', 'cyber'].map(tag => (
                jsx('button', {
                  key: tag,
                  type: 'button',
                  onClick: () => setSelectedTag(tag),
                  className: `rounded-full px-3 py-1 text-xs font-medium transition-all ${
                    selectedTag === tag
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`,
                  children: t(`tags${tag.charAt(0).toUpperCase() + tag.slice(1)}`)
                })
              ))
            ]
          }),

          // Cards Grid
          jsxs('div', {
            className: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6',
            children: [
              // Official Default Card
              jsxs('div', {
                className: `group relative flex flex-col justify-between overflow-hidden rounded-xl border bg-card/60 p-5 backdrop-blur-md transition-all hover:border-primary/50 hover:shadow-lg ${
                  config.activeSkinId === 'default' && !tryOnSkin ? 'border-primary ring-1 ring-primary/40' : 'border-border/60'
                }`,
                children: [
                  jsxs('div', {
                    className: 'flex flex-col gap-3',
                    children: [
                      jsxs('div', {
                        className: 'flex items-center justify-between',
                        children: [
                          jsx('div', {
                            className: 'h-10 w-10 rounded-lg bg-muted flex items-center justify-center text-lg font-bold text-foreground',
                            children: '⚪'
                          }),
                          config.activeSkinId === 'default' && !tryOnSkin && (
                            jsx(Badge, { variant: 'default', children: t('activeBadge') })
                          )
                        ]
                      }),
                      jsxs('div', {
                        className: 'flex flex-col gap-1',
                        children: [
                          jsx('h3', { className: 'text-base font-semibold text-foreground', children: t('resetToDefault') }),
                          jsx('p', { className: 'text-xs text-muted-foreground line-clamp-2', children: t('officialDefaultDesc') })
                        ]
                      })
                    ]
                  }),
                  jsx('div', {
                    className: 'mt-5 pt-3 border-t border-border/40',
                    children: jsx(Button, {
                      variant: config.activeSkinId === 'default' ? 'secondary' : 'outline',
                      size: 'sm',
                      className: 'w-full',
                      disabled: config.activeSkinId === 'default' && !tryOnSkin,
                      onClick: handleResetDefault,
                      children: t('resetToDefault')
                    })
                  })
                ]
              }),

              // Built-in & Custom Skins Cards
              filteredSkins.map(skin => {
                const isActive = config.activeSkinId === skin.id && !tryOnSkin
                const isTryingOn = tryOnSkin && tryOnSkin.id === skin.id

                return jsxs('div', {
                  key: skin.id,
                  className: `group relative flex flex-col justify-between overflow-hidden rounded-xl border bg-card/60 backdrop-blur-md transition-all hover:border-primary/50 hover:shadow-xl ${
                    isActive ? 'border-primary ring-2 ring-primary/30 shadow-md' : 'border-border/60'
                  } ${isTryingOn ? 'ring-2 ring-amber-500/50' : ''}`,
                  children: [
                    // Card Top Preview
                    jsxs('div', {
                      className: 'relative h-32 w-full overflow-hidden border-b border-border/40 bg-muted/40',
                      children: [
                        skin.wallpaper ? (
                          jsx('img', {
                            src: skin.wallpaper,
                            alt: skin.name,
                            className: 'h-full w-full object-cover transition-transform duration-500 group-hover:scale-105'
                          })
                        ) : (
                          jsx('div', {
                            className: 'h-full w-full flex items-center justify-center font-mono text-xs text-muted-foreground',
                            style: { background: `linear-gradient(135deg, ${skin.accent}33, ${skin.colors?.background || '#000'})` },
                            children: skin.name
                          })
                        ),
                        // Badges in preview
                        jsx('div', {
                          className: 'absolute top-2 right-2 flex items-center gap-1.5',
                          children: [
                            isActive && jsx(Badge, { key: 'act', variant: 'default', children: t('activeBadge') }),
                            isTryingOn && jsx(Badge, { key: 'try', variant: 'secondary', className: 'bg-amber-500 text-black', children: t('tryOnBadge') })
                          ]
                        }),
                        // Color swatch dot
                        jsx('div', {
                          className: 'absolute bottom-2 left-2 flex items-center gap-1.5 rounded-full bg-background/80 px-2 py-0.5 backdrop-blur-sm',
                          children: [
                            jsx('span', {
                              className: 'h-2.5 w-2.5 rounded-full shadow-sm',
                              style: { backgroundColor: skin.accent }
                            }),
                            jsx('span', {
                              className: 'font-mono text-[10px] text-foreground font-medium',
                              children: skin.accent
                            })
                          ]
                        })
                      ]
                    }),

                    // Card Content
                    jsxs('div', {
                      className: 'flex flex-1 flex-col justify-between p-4',
                      children: [
                        jsxs('div', {
                          className: 'flex flex-col gap-1.5',
                          children: [
                            jsx('h3', {
                              className: 'text-sm font-semibold text-foreground group-hover:text-primary transition-colors',
                              children: skin.name
                            }),
                            jsx('div', {
                              className: 'text-[11px] text-muted-foreground line-clamp-1',
                              children: skin.tagline || skin.description
                            }),
                            jsx('div', {
                              className: 'text-[10px] text-muted-foreground/75 mt-1',
                              children: `${t('author')}: ${skin.author}`
                            })
                          ]
                        }),
                        // Card Action Buttons
                        jsxs('div', {
                          className: 'mt-4 flex items-center gap-2 pt-3 border-t border-border/30',
                          children: [
                            jsx(Button, {
                              variant: 'secondary',
                              size: 'sm',
                              className: 'flex-1 text-xs',
                              onClick: () => handleTryOn(skin),
                              children: t('tryOnButton')
                            }),
                            jsx(Button, {
                              size: 'sm',
                              className: 'flex-1 text-xs',
                              disabled: isActive,
                              onClick: () => handleApply(skin),
                              children: t('applyButton')
                            })
                          ]
                        })
                      ]
                    })
                  ]
                })
              })
            ]
          })
        ]
      }),

      // TAB 2: Wallpaper Controls View
      activeTab === 'wallpaper' && jsxs('div', {
        className: 'flex flex-col gap-6 max-w-2xl',
        children: [
          jsxs('div', {
            className: 'flex flex-col gap-1',
            children: [
              jsx('h2', { className: 'text-lg font-semibold text-foreground', children: t('wallpaperControls') }),
              jsx('p', { className: 'text-xs text-muted-foreground', children: t('enableWallpaperDesc') })
            ]
          }),

          jsxs('div', {
            className: 'flex flex-col gap-5 rounded-xl border border-border/60 bg-card/60 p-5 backdrop-blur-md',
            children: [
              // Toggle Enable Wallpaper
              jsxs('div', {
                className: 'flex items-center justify-between',
                children: [
                  jsxs('div', {
                    className: 'flex flex-col gap-0.5',
                    children: [
                      jsx('span', { className: 'text-sm font-medium text-foreground', children: t('enableWallpaper') }),
                      jsx('span', { className: 'text-xs text-muted-foreground', children: t('enableWallpaperDesc') })
                    ]
                  }),
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

              // Wallpaper Type Selector
              jsxs('div', {
                className: 'flex flex-col gap-2',
                children: [
                  jsx('label', { className: 'text-xs font-medium text-foreground', children: t('wallpaperType') }),
                  jsx(SegmentedControl, {
                    value: config.wallpaperType,
                    onValueChange: val => {
                      store.saveConfig({ wallpaperType: val })
                      backdropManager.update({
                        enabled: config.wallpaperEnabled,
                        type: val,
                        src: config.wallpaperSource,
                        blur: config.wallpaperBlur,
                        occlusion: config.maskOcclusion
                      })
                    },
                    options: [
                      { id: 'image', label: t('wallpaperTypeImage') },
                      { id: 'video', label: t('wallpaperTypeVideo') }
                    ]
                  })
                ]
              }),

              // Wallpaper Source Input
              jsxs('div', {
                className: 'flex flex-col gap-2',
                children: [
                  jsx('label', { className: 'text-xs font-medium text-foreground', children: t('wallpaperSource') }),
                  jsxs('div', {
                    className: 'flex gap-2',
                    children: [
                      jsx(Input, {
                        value: config.wallpaperSource,
                        onChange: e => {
                          const val = e.target.value
                          store.saveConfig({ wallpaperSource: val })
                          backdropManager.update({
                            enabled: config.wallpaperEnabled,
                            type: config.wallpaperType,
                            src: val,
                            blur: config.wallpaperBlur,
                            occlusion: config.maskOcclusion
                          })
                        },
                        placeholder: t('wallpaperSourcePlaceholder'),
                        className: 'flex-1'
                      })
                    ]
                  })
                ]
              }),

              // Sliders Section
              // 1. Backdrop Blur Slider
              jsxs('div', {
                className: 'flex flex-col gap-1.5',
                children: [
                  jsxs('div', {
                    className: 'flex items-center justify-between',
                    children: [
                      jsx('span', { className: 'text-xs font-medium text-foreground', children: t('wallpaperBlur') }),
                      jsx('span', { className: 'text-xs font-mono text-muted-foreground', children: `${config.wallpaperBlur}px` })
                    ]
                  }),
                  jsx('input', {
                    type: 'range',
                    min: 0,
                    max: 30,
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
                    className: 'w-full accent-primary cursor-pointer'
                  }),
                  jsx('span', { className: 'text-[11px] text-muted-foreground', children: t('wallpaperBlurDesc') })
                ]
              }),

              // 2. Occlusion Mask Slider
              jsxs('div', {
                className: 'flex flex-col gap-1.5',
                children: [
                  jsxs('div', {
                    className: 'flex items-center justify-between',
                    children: [
                      jsx('span', { className: 'text-xs font-medium text-foreground', children: t('maskOcclusion') }),
                      jsx('span', { className: 'text-xs font-mono text-muted-foreground', children: `${config.maskOcclusion}%` })
                    ]
                  }),
                  jsx('input', {
                    type: 'range',
                    min: 0,
                    max: 100,
                    step: 2,
                    value: config.maskOcclusion,
                    onChange: e => {
                      const val = parseInt(e.target.value, 10)
                      store.saveConfig({ maskOcclusion: val })
                      backdropManager.update({
                        enabled: config.wallpaperEnabled,
                        type: config.wallpaperType,
                        src: config.wallpaperSource,
                        blur: config.wallpaperBlur,
                        occlusion: val
                      })
                    },
                    className: 'w-full accent-primary cursor-pointer'
                  }),
                  jsx('span', { className: 'text-[11px] text-muted-foreground', children: t('maskOcclusionDesc') })
                ]
              }),

              // 3. Panel Glass Transparency Slider
              jsxs('div', {
                className: 'flex flex-col gap-1.5',
                children: [
                  jsxs('div', {
                    className: 'flex items-center justify-between',
                    children: [
                      jsx('span', { className: 'text-xs font-medium text-foreground', children: t('panelGlass') }),
                      jsx('span', { className: 'text-xs font-mono text-muted-foreground', children: `${config.panelGlass}%` })
                    ]
                  }),
                  jsx('input', {
                    type: 'range',
                    min: 0,
                    max: 100,
                    step: 5,
                    value: config.panelGlass,
                    onChange: e => {
                      const val = parseInt(e.target.value, 10)
                      store.saveConfig({ panelGlass: val })
                      glassController.update({
                        enabled: config.wallpaperEnabled,
                        glassTransparency: val,
                        bubbleOpacity: config.bubbleOpacity,
                        composerFrost: config.composerFrost
                      })
                    },
                    className: 'w-full accent-primary cursor-pointer'
                  }),
                  jsx('span', { className: 'text-[11px] text-muted-foreground', children: t('panelGlassDesc') })
                ]
              }),

              // 4. Bubble Opacity Slider
              jsxs('div', {
                className: 'flex flex-col gap-1.5',
                children: [
                  jsxs('div', {
                    className: 'flex items-center justify-between',
                    children: [
                      jsx('span', { className: 'text-xs font-medium text-foreground', children: t('bubbleOpacity') }),
                      jsx('span', { className: 'text-xs font-mono text-muted-foreground', children: `${config.bubbleOpacity}%` })
                    ]
                  }),
                  jsx('input', {
                    type: 'range',
                    min: 10,
                    max: 100,
                    step: 5,
                    value: config.bubbleOpacity,
                    onChange: e => {
                      const val = parseInt(e.target.value, 10)
                      store.saveConfig({ bubbleOpacity: val })
                      glassController.update({
                        enabled: config.wallpaperEnabled,
                        glassTransparency: config.panelGlass,
                        bubbleOpacity: val,
                        composerFrost: config.composerFrost
                      })
                    },
                    className: 'w-full accent-primary cursor-pointer'
                  }),
                  jsx('span', { className: 'text-[11px] text-muted-foreground', children: t('bubbleOpacityDesc') })
                ]
              }),

              // 5. Composer Frost Blur Slider
              jsxs('div', {
                className: 'flex flex-col gap-1.5',
                children: [
                  jsxs('div', {
                    className: 'flex items-center justify-between',
                    children: [
                      jsx('span', { className: 'text-xs font-medium text-foreground', children: t('composerFrost') }),
                      jsx('span', { className: 'text-xs font-mono text-muted-foreground', children: `${config.composerFrost}px` })
                    ]
                  }),
                  jsx('input', {
                    type: 'range',
                    min: 0,
                    max: 25,
                    step: 1,
                    value: config.composerFrost,
                    onChange: e => {
                      const val = parseInt(e.target.value, 10)
                      store.saveConfig({ composerFrost: val })
                      glassController.update({
                        enabled: config.wallpaperEnabled,
                        glassTransparency: config.panelGlass,
                        bubbleOpacity: config.bubbleOpacity,
                        composerFrost: val
                      })
                    },
                    className: 'w-full accent-primary cursor-pointer'
                  }),
                  jsx('span', { className: 'text-[11px] text-muted-foreground', children: t('composerFrostDesc') })
                ]
              })
            ]
          })
        ]
      }),

      // TAB 3: Theme Studio View
      activeTab === 'studio' && jsx(CustomThemeStudio, {
        store,
        onApplySkin: handleApply,
        onTryOnSkin: handleTryOn
      })
    ]
  })
}
