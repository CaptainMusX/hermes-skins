/**
 * Custom Theme Studio for Hermes Desktop
 * Allows users to craft their own palettes, pick wallpapers, and export/import skin JSON.
 */

import { Button, Input, usePluginI18n } from '@hermes/plugin-sdk'
import { useRef, useState } from 'react'
import { jsx, jsxs } from 'react/jsx-runtime'
import { normalizeMediaSource } from '../engine/backdrop-manager.js'

export function CustomThemeStudio({ store, onApplySkin }) {
  const t = usePluginI18n('hermes-skins')

  const [name, setName] = useState('')
  const [accent, setAccent] = useState('#6366f1')
  const [background, setBackground] = useState('#0b0f19')
  const [foreground, setForeground] = useState('#f8fafc')
  const [card, setCard] = useState('#111827')
  const [wallpaperUrl, setWallpaperUrl] = useState('')
  const [importError, setImportError] = useState('')
  const fileInputRef = useRef(null)
  const validColor = value => /^#[0-9a-f]{6}$/i.test(value)
  const valid = name.trim() && [accent, background, foreground, card].every(validColor) &&
    (!wallpaperUrl || normalizeMediaSource(wallpaperUrl, 'image'))
  const ink = parseInt(accent.slice(1, 3), 16) * 0.299 +
    parseInt(accent.slice(3, 5), 16) * 0.587 + parseInt(accent.slice(5, 7), 16) * 0.114 > 150
    ? '#111827' : '#ffffff'

  function handleSave() {
    if (!valid) return

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
        primaryForeground: ink,
        secondary: card,
        secondaryForeground: foreground,
        accent,
        accentForeground: ink,
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
        primaryForeground: ink,
        secondary: card,
        secondaryForeground: foreground,
        accent,
        accentForeground: ink,
        border: '#1f2937',
        input: card,
        ring: accent,
        userBubble: card
      }
    }

    store.addCustomSkin(customSkin)
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

  // Import fills the form only; saving still registers the skin explicitly.
  function handleImportJson(file) {
    file.text().then(text => {
      const parsed = JSON.parse(text)
      const colors = parsed.colors || {}
      const color = value => {
        if (typeof value !== 'string' || !validColor(value)) throw new Error('invalid color')
        return value
      }
      const wallpaper = typeof parsed.wallpaper === 'string' ? parsed.wallpaper : ''
      if (wallpaper && !normalizeMediaSource(wallpaper, 'image')) throw new Error('invalid wallpaper')
      setName(typeof parsed.name === 'string' ? parsed.name : '')
      setAccent(color(parsed.accent ?? colors.accent))
      setBackground(color(colors.background))
      setForeground(color(colors.foreground))
      setCard(color(colors.card ?? colors.background))
      setWallpaperUrl(wallpaper)
      setImportError('')
    }).catch(() => setImportError(t('skinJsonInvalid')))
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
        'data-hermes-skins-surface': '',
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
        className: 'flex items-center justify-between gap-3',
        children: [
          jsxs('div', {
            className: 'flex items-center gap-2',
            children: [
              jsx(Button, {
                variant: 'outline',
                onClick: handleExportJson,
                children: t('exportSkinJson')
              }),
              jsx(Button, {
                variant: 'outline',
                onClick: () => fileInputRef.current?.click(),
                children: t('importSkinJson')
              }),
              jsx('input', {
                ref: fileInputRef, type: 'file', accept: '.json,application/json', style: { display: 'none' },
                onChange: event => {
                  const file = event.target.files?.[0]
                  if (file) handleImportJson(file)
                  event.target.value = ''
                }
              }),
              importError && jsx('span', { className: 'text-xs text-destructive', children: importError })
            ]
          }),
          jsx(Button, {
            onClick: handleSave,
            disabled: !valid,
            children: t('saveCustomSkin')
          })
        ]
      })
    ]
  })
}
