import test from 'node:test'
import assert from 'node:assert/strict'
import { BUILTIN_SKINS } from '../src/catalog/builtin-skins.js'
import { contrastRatio, ensurePaletteContrast } from '../src/engine/color-contrast.js'

test('all built-in theme text pairs meet normal-size contrast after registration', () => {
  for (const skin of BUILTIN_SKINS) {
    for (const palette of [skin.colors, skin.darkColors]) {
      const colors = ensurePaletteContrast({ destructive: '#dc2626', destructiveForeground: '#ffffff', ...palette })
      for (const [ink, surface] of [
        ['foreground', 'background'], ['cardForeground', 'card'],
        ['mutedForeground', 'muted'], ['popoverForeground', 'popover'],
        ['primaryForeground', 'primary'], ['secondaryForeground', 'secondary'],
        ['accentForeground', 'accent'], ['destructiveForeground', 'destructive']
      ]) {
        assert.ok(contrastRatio(colors[ink], colors[surface]) >= 4.5,
          `${skin.id} ${ink} on ${surface}`)
      }
    }
  }
})

test('well-contrasted author colors are preserved', () => {
  const palette = { background: '#111827', foreground: '#f8fafc', primary: '#1d4ed8', primaryForeground: '#ffffff' }
  assert.deepEqual(ensurePaletteContrast(palette), palette)
})
