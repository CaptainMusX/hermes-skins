/**
 * Floating Try-On Banner
 * Shows status when user is currently trying on a skin.
 */

import { Button, usePluginI18n, useValue } from '@hermes/plugin-sdk'
import { jsx, jsxs } from 'react/jsx-runtime'

export function TryOnBanner({ store, onApply, onExit }) {
  const t = usePluginI18n('hermes-skins')
  const tryOnSkin = useValue(store.$tryOnSkin)

  if (!tryOnSkin) return null

  const skinName = tryOnSkin.name || tryOnSkin.nameEn || tryOnSkin.id

  return jsxs('div', {
    className: 'mb-4 flex items-center justify-between rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 shadow-lg backdrop-blur-md',
    children: [
      jsxs('div', {
        className: 'flex items-center gap-3',
        children: [
          jsx('div', {
            className: 'flex h-8 w-8 items-center justify-center rounded-full bg-amber-500/20 text-amber-500 font-bold',
            children: '✨'
          }),
          jsxs('div', {
            children: [
              jsx('div', {
                className: 'text-sm font-semibold text-foreground',
                children: t('tryOnBannerTitle', { name: skinName })
              }),
              jsx('div', {
                className: 'text-xs text-muted-foreground',
                children: t('tryOnBannerDesc')
              })
            ]
          })
        ]
      }),
      jsxs('div', {
        className: 'flex items-center gap-2',
        children: [
          jsx(Button, {
            size: 'sm',
            variant: 'secondary',
            onClick: onExit,
            children: t('exitTryOnButton')
          }),
          jsx(Button, {
            size: 'sm',
            onClick: onApply,
            children: t('applyButton')
          })
        ]
      })
    ]
  })
}
