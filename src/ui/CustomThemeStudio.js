/**
 * Custom Theme Studio for Hermes Desktop
 * Allows users to craft their own palettes, pick wallpapers, and export/import skin JSON.
 */

import { Button, Input, usePluginI18n, useValue } from '@hermes/plugin-sdk'
import { useState } from 'react'
import { jsx, jsxs } from 'react/jsx-runtime'

export function CustomThemeStudio({ store, onApplySkin, onTryOnSkin }) {
  const t = usePluginI18n('hermes-skins')
  const config = useValue(store.$config)

  const [name, setName] = useState('')
  const [accent, setAccent] = useState('#6366f1')
  const [background, setBackground] = useState('#0b0f19')
  const [foreground, setForeground] = useState('#f8fafc')
  const [card, setCard] = useState('#111827')
  const [wallpaperUrl, setWallpaperUrl] = useState('')

  function handleSave() {
    if (!name.trim()) return

    const customSkin = {
      id: `custom-${Date.now()}`,
      name: name.trim(),
      nameEn: name.trim(),
      author: 'You (Custom)',
      tagline: 'User-created bespoke palette & backdrop',
      description: 'Crafted in Hermes Theme Studio.',
      tags: ['art'],
      accent,
      wallpaper: wallpaperUrl || undefined,
      wallpaperType: 'image',
      defaultBlur: 4,
      defaultOcclusion: 30,
      colors: {
        background,
        foreground,
        card,
        cardForeground: foreground,
        muted: background,
        mutedForeground: '#94a3b8',
        popover: card,
        popoverForeground: foreground,
        primary: accent,
        primaryForeground: '#ffffff',
        secondary: card,
        secondaryForeground: foreground,
        accent,
        accentForeground: '#ffffff',
        border: '#1f2937',
        input: card,
        ring: accent,
        userBubble: card
      },
      darkColors: {
        background,
        foreground,
        card,
        cardForeground: foreground,
        muted: background,
        mutedForeground: '#94a3b8',
        popover: card,
        popoverForeground: foreground,
        primary: accent,
        primaryForeground: '#ffffff',
        secondary: card,
        secondaryForeground: foreground,
        accent,
        accentForeground: '#ffffff',
        border: '#1f2937',
        input: card,
        ring: accent,
        userBubble: card
      }
    }

    store.saveConfig(prev => ({
      ...prev,
      customSkins: [customSkin, ...(prev.customSkins || [])]
    }))

    onApplySkin(customSkin)
    setName('')
  }

  function handleExportJson() {
    const exportData = {
      skinManifestVersion: 2,
      id: name ? name.toLowerCase().replace(/\s+/g, '-') : 'custom-skin',
      name: name || 'Custom Skin',
      accent,
      colors: { background, foreground, card, accent },
      wallpaper: wallpaperUrl
    }
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${exportData.id}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return jsxs('div', {
    className: 'flex flex-col gap-6 max-w-2xl',
    children: [
      jsxs('div', {
        className: 'flex flex-col gap-1',
        children: [
          jsx('h2', { className: 'text-lg font-semibold text-foreground', children: t('themeStudioTitle') }),
          jsx('p', { className: 'text-xs text-muted-foreground', children: t('themeStudioDesc') })
        ]
      }),
      jsxs('div', {
        className: 'grid grid-cols-1 md:grid-cols-2 gap-4 rounded-xl border border-border/60 bg-card/60 p-4 backdrop-blur-md',
        children: [
          jsxs('div', {
            className: 'flex flex-col gap-2',
            children: [
              jsx('label', { className: 'text-xs font-medium text-foreground', children: t('customSkinName') }),
              jsx(Input, {
                value: name,
                onChange: e => setName(e.target.value),
                placeholder: t('customSkinNamePlaceholder')
              })
            ]
          }),
          jsxs('div', {
            className: 'flex flex-col gap-2',
            children: [
              jsx('label', { className: 'text-xs font-medium text-foreground', children: t('accentColor') }),
              jsxs('div', {
                className: 'flex items-center gap-2',
                children: [
                  jsx('input', {
                    type: 'color',
                    value: accent,
                    onChange: e => setAccent(e.target.value),
                    className: 'h-8 w-10 cursor-pointer rounded border border-border bg-transparent'
                  }),
                  jsx(Input, {
                    value: accent,
                    onChange: e => setAccent(e.target.value),
                    className: 'font-mono text-xs'
                  })
                ]
              })
            ]
          }),
          jsxs('div', {
            className: 'flex flex-col gap-2',
            children: [
              jsx('label', { className: 'text-xs font-medium text-foreground', children: t('backgroundColor') }),
              jsxs('div', {
                className: 'flex items-center gap-2',
                children: [
                  jsx('input', {
                    type: 'color',
                    value: background,
                    onChange: e => setBackground(e.target.value),
                    className: 'h-8 w-10 cursor-pointer rounded border border-border bg-transparent'
                  }),
                  jsx(Input, {
                    value: background,
                    onChange: e => setBackground(e.target.value),
                    className: 'font-mono text-xs'
                  })
                ]
              })
            ]
          }),
          jsxs('div', {
            className: 'flex flex-col gap-2',
            children: [
              jsx('label', { className: 'text-xs font-medium text-foreground', children: t('foregroundColor') }),
              jsxs('div', {
                className: 'flex items-center gap-2',
                children: [
                  jsx('input', {
                    type: 'color',
                    value: foreground,
                    onChange: e => setForeground(e.target.value),
                    className: 'h-8 w-10 cursor-pointer rounded border border-border bg-transparent'
                  }),
                  jsx(Input, {
                    value: foreground,
                    onChange: e => setForeground(e.target.value),
                    className: 'font-mono text-xs'
                  })
                ]
              })
            ]
          }),
          jsxs('div', {
            className: 'flex flex-col gap-2 md:col-span-2',
            children: [
              jsx('label', { className: 'text-xs font-medium text-foreground', children: t('wallpaperSource') }),
              jsx(Input, {
                value: wallpaperUrl,
                onChange: e => setWallpaperUrl(e.target.value),
                placeholder: t('wallpaperSourcePlaceholder')
              })
            ]
          })
        ]
      }),
      jsxs('div', {
        className: 'flex items-center justify-between',
        children: [
          jsx(Button, {
            variant: 'outline',
            onClick: handleExportJson,
            children: t('exportSkinJson')
          }),
          jsxs('div', {
            className: 'flex items-center gap-2',
            children: [
              jsx(Button, {
                variant: 'secondary',
                onClick: () => {
                  onTryOnSkin({
                    id: 'custom-preview',
                    name: name || 'Preview',
                    accent,
                    wallpaper: wallpaperUrl,
                    colors: { background, foreground, card, accent }
                  })
                },
                children: t('tryOnButton')
              }),
              jsx(Button, {
                onClick: handleSave,
                disabled: !name.trim(),
                children: t('saveCustomSkin')
              })
            ]
          })
        ]
      })
    ]
  })
}
