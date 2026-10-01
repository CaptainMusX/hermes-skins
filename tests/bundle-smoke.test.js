import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'

function loadPlugin(pageTab = 'gallery') {
  const code = fs.readFileSync(new URL('../plugin.js', import.meta.url), 'utf8')
    .replace(/^import\s+[\s\S]*?from\s+['"][^'"]+['"];?\s*$/gm, '')
    .replace('export default {', 'return {')
  const names = [
    'atom', 'Badge', 'Button', 'host', 'Input', 'PALETTE_AREA',
    'ROUTES_AREA', 'SegmentedControl', 'SIDEBAR_NAV_AREA', 'Switch',
    'THEMES_AREA', 'usePluginI18n', 'useTheme', 'useValue',
    'useState', 'useEffect', 'useLayoutEffect', 'useRef', 'jsx', 'jsxs'
  ]
  const atom = initial => ({ value: initial, get() { return this.value }, set(value) { this.value = value } })
  const component = () => null
  const jsx = (type, props) => ({ type, props })
  const theme = { themeName: 'nous-alt', renderedMode: 'dark', setTheme() {}, previewTheme() {}, clearThemePreview() {} }
  const values = {
    atom, Badge: component, Button: component,
    host: { navigate() {}, notify() {} }, Input: component, PALETTE_AREA: 'palette',
    ROUTES_AREA: 'routes', SegmentedControl: component, SIDEBAR_NAV_AREA: 'sidebar',
    Switch: component, THEMES_AREA: 'themes',
    usePluginI18n: () => key => key, useTheme: () => theme, useValue: value => value.get(),
    useState: value => [value === 'gallery' ? pageTab : value, () => {}],
    useEffect: effect => effect(), useLayoutEffect: effect => effect(), useRef: value => ({ current: value }), jsx, jsxs: jsx
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

test('generated plugin registers valid themes and usable page controls', () => {
  const { plugin, values } = loadPlugin()
  const contributions = []
  const storage = new Map()
  plugin.register({
    storage: { get: (key, fallback) => storage.get(key) ?? fallback, set: (key, value) => storage.set(key, value) },
    i18n: { register() {} },
    register: item => { contributions.push(item); return () => {} },
    onDispose() {}
  })
  const themes = contributions.filter(item => item.area === 'themes')
  assert.equal(themes.length, 6)
  for (const item of themes) {
    assert.equal(typeof item.data.colors.destructive, 'string')
    assert.equal(typeof item.data.colors.destructiveForeground, 'string')
  }
  const route = contributions.find(item => item.id === 'page')
  const page = route.render()
  const custom = { id: 'custom-smoke', name: 'Smoke', colors: themes[0].data.colors }
  page.props.store.addCustomSkin(custom)
  assert.ok(contributions.some(item => item.id === 'theme-custom-smoke'))
  assert.ok(storage.get('config').customSkins.some(item => item.id === 'custom-smoke'))
  const tree = walk(page.type(page.props))
  const tabs = tree.find(item => item.type === values.SegmentedControl)
  assert.equal(typeof tabs.props.onChange, 'function')
  assert.equal(tree.some(item => item.type === values.Button && typeof item.props.onClick === 'function'), true)
  // The status bar carries no skin entry at all: no chip registration and no
  // status-bar packaging references survive in the bundle.
  assert.equal(contributions.some(item => item.id === 'status-chip'), false)
  const bundle = fs.readFileSync(new URL('../plugin.js', import.meta.url), 'utf8')
  assert.equal(bundle.includes('STATUSBAR_AREAS'), false)
  assert.equal(bundle.includes('StatusBarChip'), false)
  // The theme watcher runs the sync the chip used to own, and dispose releases it.
  const disposals = []
  plugin.register({
    storage: { get: (key, fallback) => storage.get(key) ?? fallback, set: (key, value) => storage.set(key, value) },
    i18n: { register() {} }, register: item => { contributions.push(item); return () => {} },
    onDispose: fn => disposals.push(fn)
  })
  assert.ok(disposals.length > 0)
  for (const dispose of disposals) dispose()

  const onReload = []
  plugin.register({
    storage: { get: (key, fallback) => storage.get(key) ?? fallback, set: (key, value) => storage.set(key, value) },
    i18n: { register() {} }, register: item => { onReload.push(item); return () => {} }, onDispose() {}
  })
  assert.ok(onReload.some(item => item.id === 'theme-custom-smoke'))
})

test('generated wallpaper tab exposes the Wallpaper Engine browser', () => {
  const { plugin } = loadPlugin('wallpaper')
  const contributions = []
  plugin.register({
    storage: { get: (_key, fallback) => fallback, set() {} },
    i18n: { register() {} }, register: item => { contributions.push(item); return () => {} }, onDispose() {}
  })
  const page = contributions.find(item => item.id === 'page').render()
  const tree = walk(page.type(page.props))
  assert.ok(tree.some(item => item.type?.name === 'WallpaperEnginePanel'))
})

test('generated theme studio exposes JSON import and export controls', () => {
  const { plugin, values } = loadPlugin('studio')
  const contributions = []
  plugin.register({
    storage: { get: (_key, fallback) => fallback, set() {} },
    i18n: { register() {} }, register: item => { contributions.push(item); return () => {} }, onDispose() {}
  })
  const page = contributions.find(item => item.id === 'page').render()
  // walk() does not invoke function components; render the studio element first.
  const studio = walk(page.type(page.props)).find(item => item.type?.name === 'CustomThemeStudio')
  const tree = walk(studio.type(studio.props))
  const buttons = tree.filter(item => item.type === values.Button)
  assert.ok(buttons.some(item => item.props.children === 'exportSkinJson'))
  assert.ok(buttons.some(item => item.props.children === 'importSkinJson'))
  const fileInput = tree.find(item => item.type === 'input' && item.props.type === 'file')
  assert.equal(typeof fileInput?.props.onChange, 'function')
})
