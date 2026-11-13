import test from 'node:test'
import assert from 'node:assert/strict'
import {
  DEFAULT_CONFIG, normalizeConfig, normalizeRotationGroup, sanitizeFontSets
} from '../src/engine/config.js'

test('schema 7 normalises rotation groups and migrates legacy filters', () => {
  const config = normalizeConfig({
    schemaVersion: 6,
    wallpaperTransition: 'slide',
    typeFilter: 'all',
    rotationGroups: [{
      id: 'grp-a', name: '  Night  ', interval: 9999, order: 'random',
      trigger: 'videoEnd', wallpaperIds: ['a', 'a', 'b', 3]
    }, { id: 'bad id', name: 'x' }],
    rotationGroupId: 'grp-a'
  })
  assert.equal(config.schemaVersion, 7)
  assert.equal(config.wallpaperTransition, 'push')
  assert.deepEqual(config.typeFilter, ['video', 'web', 'image', 'scene'])
  assert.deepEqual(config.rotationGroups, [{
    id: 'grp-a', name: 'Night', interval: 1440,
    order: 'random', trigger: 'videoEnd', wallpaperIds: ['a', 'b']
  }])
  assert.equal(config.rotationGroupId, 'grp-a')
  assert.equal(normalizeRotationGroup({ id: 'x', trigger: 'bad', order: 'bad' }).trigger, 'interval')
})

test('font sets sanitize unsupported roles and keep the seven-value contract', () => {
  const sets = sanitizeFontSets([{
    id: 'reading',
    name: 'Reading',
    values: {
      globalFamily: 'KaiTi',
      themeSize: { 'markdown-base': 16, unknown: 99 },
      themeWeight: { 'markdown-base': 650, unknown: 300 },
      themeFamily: { 'markdown-base': 'SimSun' },
      themeColors: {
        primary: { light: '#112233', dark: '#ddeeff' },
        unknown: { light: '#ffffff', dark: '#000000' }
      },
      componentFonts: {
        table: { size: 15, weight: 600, family: 'SimSun' },
        unknown: { size: 22 }
      }
    }
  }])
  assert.equal(sets.length, 1)
  assert.equal(sets[0].values.globalFamily, 'KaiTi')
  assert.deepEqual(sets[0].values.themeSize, { 'markdown-base': 16 })
  assert.deepEqual(sets[0].values.themeWeight, { 'markdown-base': 650 })
  assert.deepEqual(sets[0].values.themeColors, { primary: { light: '#112233', dark: '#ddeeff' } })
  assert.deepEqual(sets[0].values.componentFonts, {
    table: { size: 15, weight: 600, family: 'SimSun' }
  })
})

test('FX and parallax fields use upstream ranges and legacy style names', () => {
  const config = normalizeConfig({
    fxClickStyle: 'both',
    fxTrailStyle: 'sparkle',
    fxClickSize: 999,
    fxOpacity: 0,
    fxBlend: 'overlay',
    parallaxBg: 50,
    parallaxUiBubbleDepth: 9,
    fontFamily: 'KaiTi',
    fontSize: 16
  })
  assert.equal(config.fxClickStyle, 'both')
  assert.equal(config.fxTrailStyle, 'dust')
  assert.equal(config.fxClickSize, 400)
  assert.equal(config.fxOpacity, 10)
  assert.equal(config.fxBlend, 'overlay')
  assert.equal(config.parallaxBg, 10)
  assert.equal(config.parallaxUiBubbleDepth, 9)
  assert.equal(config.globalFamily, 'KaiTi')
  assert.equal(config.fontSize, undefined)
  assert.equal(DEFAULT_CONFIG.wallpaperTransition, 'cut')
})
