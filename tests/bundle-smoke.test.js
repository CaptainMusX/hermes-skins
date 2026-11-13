import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'

function loadPlugin() {
  const code = fs.readFileSync(new URL('../plugin.js', import.meta.url), 'utf8')
    .replace(/^import\s+[\s\S]*?from\s+['"][^'"]+['"];?\s*$/gm, '')
    .replace('export default {', 'return {')
  const names = [
    'APPEARANCE_AREAS', 'atom', 'Button', 'host', 'Input', 'pluginSettingsHref', 'SegmentedControl', 'Switch',
    'setAccentOverride', 'usePluginI18n', 'useValue', 'useState', 'useEffect', 'useRef', 'jsx', 'jsxs'
  ]
  const atom = initial => ({ value: initial, get() { return this.value }, set(value) { this.value = value } })
  const component = () => null
  const jsx = (type, props) => ({ type, props })
  const values = {
    APPEARANCE_AREAS: { extra: 'appearance.extra' },
    atom, Button: component, host: { navigate() {} }, Input: component,
    pluginSettingsHref: (plugin, page) => `/settings?tab=plugins&plugin=${plugin}${page ? `&ppage=${page}` : ''}`,
    SegmentedControl: component, Switch: component,
    setAccentOverride: () => {},
    usePluginI18n: () => key => key, useValue: value => value.get(),
    useState: value => [value, () => {}], useEffect: effect => effect(),
    useRef: value => ({ current: value }), jsx, jsxs: jsx
  }
  return { plugin: new Function(...names, code)(...names.map(name => values[name])), values }
}

function walk(node, found = []) {
  if (Array.isArray(node)) node.forEach(child => walk(child, found))
  else if (node && typeof node === 'object' && 'type' in node) {
    found.push(node)
    walk(node.props?.children, found)
  }
  return found
}

test('generated plugin contributes exactly one Appearance settings panel', () => {
  const { plugin } = loadPlugin()
  const contributions = []
  const settingsPages = []
  plugin.register({
    storage: { get: (_key, fallback) => fallback, set() {} },
    i18n: { register() {} },
    rest: async () => ({ ok: false, fonts: [], items: [] }),
    register: item => { contributions.push(item); return () => {} },
    registerSettingsPage: item => { settingsPages.push(item); return () => {} },
    onDispose() {}
  })
  assert.equal(contributions.length, 1)
  assert.equal(contributions[0].id, 'appearance-panel')
  assert.equal(contributions[0].area, 'appearance.extra')
  assert.equal(settingsPages.length, 1)
  assert.equal(settingsPages[0].id, 'wallpaper')
  assert.equal(settingsPages[0].title, '壁纸引擎')
  assert.equal(typeof settingsPages[0].render, 'function')
  const panel = contributions[0].render()
  const tree = walk(panel.type(panel.props))
  assert.ok(tree.some(item => item.type?.name === 'WallpaperEnginePanel'))
  assert.ok(tree.some(item => item.props?.children === 'wallpaperEngineTitle'))
  assert.ok(tree.some(item => item.props?.children === '壁纸库'))
})

test('the removed skin gallery and theme studio do not survive in the bundle', () => {
  const bundle = fs.readFileSync(new URL('../plugin.js', import.meta.url), 'utf8')
  for (const retired of [
    'BUILTIN_SKINS', 'SkinCenterPage', 'CustomThemeStudio', 'TryOnBanner',
    'THEMES_AREA', 'SIDEBAR_NAV_AREA', 'PALETTE_AREA', 'ROUTES_AREA',
    '皮肤中心', 'Skin Gallery'
  ]) {
    assert.equal(bundle.includes(retired), false, `${retired} must not be bundled`)
  }
  assert.ok(bundle.includes('appearance.extra'))
})
