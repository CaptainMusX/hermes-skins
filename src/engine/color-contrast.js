const rgb = hex => [1, 3, 5].map(index => parseInt(hex.slice(index, index + 2), 16) / 255)
const channel = value => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
const luminance = hex => rgb(hex).map(channel).reduce((sum, value, index) => sum + value * [0.2126, 0.7152, 0.0722][index], 0)

export function contrastRatio(first, second) {
  const values = [luminance(first), luminance(second)].sort((a, b) => b - a)
  return (values[0] + 0.05) / (values[1] + 0.05)
}

function readable(foreground, background) {
  if (contrastRatio(foreground, background) >= 4.5) return foreground
  const light = '#ffffff'
  const dark = '#000000'
  return contrastRatio(light, background) >= contrastRatio(dark, background) ? light : dark
}

/** Correct only text colors that fail normal-size WCAG AA contrast. */
export function ensurePaletteContrast(colors) {
  const result = { ...colors }
  const pairs = [
    ['foreground', 'background'], ['cardForeground', 'card'],
    ['mutedForeground', 'muted'], ['popoverForeground', 'popover'],
    ['primaryForeground', 'primary'], ['secondaryForeground', 'secondary'],
    ['accentForeground', 'accent'], ['destructiveForeground', 'destructive']
  ]
  for (const [foreground, background] of pairs) {
    if (result[foreground] && result[background]) {
      result[foreground] = readable(result[foreground], result[background])
    }
  }
  return result
}
