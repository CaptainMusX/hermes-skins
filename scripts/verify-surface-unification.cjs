// Regression: the actual PaneBody -> chat/sidebar nesting and portaled SDK surfaces.
const fs = require('node:fs')
const path = require('node:path')
const assert = require('node:assert/strict')
let chromium
try { ({ chromium } = require('playwright')) } catch {
  ({ chromium } = require(path.join(process.env.LOCALAPPDATA, 'hermes/hermes-agent/node_modules/playwright')))
}
const root = path.resolve(__dirname, '..')
const out = path.join(root, 'verification/surface-unification')
fs.mkdirSync(out, { recursive: true })

;(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true })
  try {
    const page = await browser.newPage({ viewport: { width: 1000, height: 720 } })
    await page.setContent(`<!doctype html><html data-hermes-glass data-hermes-glass-scope="sidebar"><head><style>
      :root { --ui-bg-chrome:#fff; --ui-bg-sidebar:#f5f5f5; --ui-text-primary:#20242a;
        --ui-bg-elevated:#fafafa; --dt-popover:#fafafa; --dt-card:#fff; --dt-primary-solid:#267544; }
      * { box-sizing:border-box } body { margin:0;font:15px system-ui }
      #wallpaper { position:fixed;inset:0;background:#29425b;z-index:0 }
      [data-slot="sidebar-wrapper"] { background:#fff }
      [data-contrib-shell] { height:720px;display:flex;flex-direction:column;background:#fff }
      main { display:flex;flex:1;min-height:0 } .pane { flex:1;min-width:0 }
      .pane-body { height:100%;background:var(--ui-editor-surface-background) }
      .view { height:100%;padding:16px }
      [data-slot="sidebar"], .files { background:var(--ui-sidebar-surface-background) }
      [data-chat-surface], .mask-fill, .raised-fill { background:var(--ui-chat-surface-background) }
      [data-panel-header] { height:34px;padding:8px;background:var(--ui-sidebar-surface-background) }
      footer { height:34px;padding:8px;background:var(--ui-sidebar-surface-background) }
      :root[data-hermes-glass][data-hermes-glass-scope="sidebar"] footer { --ui-sidebar-surface-background:var(--ui-bg-chrome) }
      .chip { background:var(--ui-sidebar-surface-background) }
      .floating { position:fixed;top:100px;left:350px;width:300px;padding:16px;border:1px solid #80808080;border-radius:10px;background:#fafafa;color:#20242a }
      .bg-popover { background:var(--dt-popover) } .bg-card { background:var(--dt-card) }
      .tooltip-bubble { position:fixed;top:60px;left:40px;padding:8px;background:#20242a;color:white }
      .tooltip-bubble svg { fill:#20242a }
      #dialog { top:430px;left:30px;width:260px } #nested-select { position:relative;top:0;left:0;width:220px }
      #accent { position:fixed;top:20px;right:20px;background:#267544;color:white;padding:8px }
      .swatch { display:inline-block;width:12px;height:12px;background:#4477ff }
      .mask-fill, .raised-fill { padding:8px;margin-top:8px }
    </style></head><body><div id="wallpaper"></div><div data-slot="sidebar-wrapper" class="bg-background"><div data-contrib-shell>
      <div data-panel-header>Shared pane chrome</div><main>
        <div class="pane"><div id="sidebar-owner" class="pane-body bg-(--ui-editor-surface-background)"><aside data-slot="sidebar" class="view bg-(--ui-sidebar-surface-background)">Sidebar</aside></div></div>
        <div class="pane"><div id="chat-owner" class="pane-body bg-(--ui-editor-surface-background)"><div data-chat-surface class="view bg-(--ui-chat-surface-background)">Conversation
          <div data-glass-opaque><div id="mask" class="mask-fill bg-(--ui-chat-surface-background)">Opaque sibling mask</div></div>
          <div data-glass-raised style="--ui-chat-surface-background:#fff"><div id="raised" class="raised-fill bg-(--ui-chat-surface-background)">Raised content</div></div>
        </div></div></div>
        <div class="pane"><div id="file-owner" class="pane-body bg-(--ui-editor-surface-background)"><div id="files" class="files view bg-(--ui-sidebar-surface-background)">Files</div></div></div>
      </main><footer data-slot="statusbar"><span class="chip bg-(--ui-sidebar-surface-background)">Status</span></footer>
    </div></div>
    <div id="menu" class="floating bg-popover" role="menu" data-slot="dropdown-menu-content"><b>上下文用量</b><p>~79.4k / 1M Tokens</p><div data-slot="context-usage-panel"><span class="swatch"></span> 系统提示词</div><div id="command" data-slot="command" class="bg-popover">Nested picker</div></div>
    <div class="tooltip-bubble" data-slot="tooltip-content">Tooltip<svg width="12" height="6" data-slot="tooltip-arrow"><path d="M0 0L6 6L12 0Z"/></svg></div>
    <div id="dialog" role="dialog" data-slot="dialog-content" class="floating bg-popover">Dialog<div id="nested-select" role="listbox" data-slot="select-content" class="floating bg-popover">Nested select</div></div>
    <div id="accent" data-slot="popover-content" class="dt-primary-solid">Accent notification</div>
    </body></html>`)
    await page.addScriptTag({ content: fs.readFileSync(path.join(root, 'src/engine/glass-controller.js'), 'utf8').replace(/^export /gm, '') })
    await page.evaluate(() => { window.material = new GlassController(); material.update({ enabled: true, glassTransparency: 80, surfaceFrost: 8 }) })
    const inspect = async () => page.evaluate(() => {
      const read = selector => {
        const style = getComputedStyle(document.querySelector(selector))
        return { background: style.backgroundColor, blur: style.backdropFilter, color: style.color }
      }
      return Object.fromEntries([
        ['chatOwner', '#chat-owner'], ['sidebarOwner', '#sidebar-owner'], ['fileOwner', '#file-owner'],
        ['chat', '[data-chat-surface]'], ['sidebar', '[data-slot="sidebar"]'], ['files', '#files'], ['footer', 'footer'],
        ['menu', '#menu'], ['command', '#command'], ['tooltip', '.tooltip-bubble'], ['dialog', '#dialog'], ['select', '#nested-select'],
        ['mask', '#mask'], ['raised', '#raised'], ['swatch', '.swatch'], ['accent', '#accent']
      ].map(([key, selector]) => [key, read(selector)]))
    })
    const readPixels = async screenshot => page.evaluate(async data => {
      const image = new Image(); image.src = data; await image.decode()
      const canvas = document.createElement('canvas'); canvas.width = image.width; canvas.height = image.height
      const ctx = canvas.getContext('2d'); ctx.drawImage(image, 0, 0)
      return [[160, 640], [500, 640], [840, 640], [500, 704]].map(([x, y]) => [...ctx.getImageData(x, y, 1, 1).data])
    }, `data:image/png;base64,${screenshot.toString('base64')}`)
    const checkLayers = (state, maskColor = 'rgb(255, 255, 255)') => {
      for (const key of ['chat', 'sidebar', 'files', 'command']) {
        assert.equal(state[key].background, 'rgba(0, 0, 0, 0)', `${key} cannot stack another fill`)
        assert.equal(state[key].blur, 'none')
      }
      for (const key of ['chatOwner', 'sidebarOwner', 'fileOwner']) assert.equal(state[key].background, state.footer.background)
      for (const key of ['menu', 'tooltip', 'dialog', 'select']) {
        assert.equal(state[key].background, state.menu.background, `${key} uses the shared floating material`)
        assert.match(state[key].background, /\/ 0\.7\)/, `${key} is translucent`)
        assert.equal(state[key].blur, 'blur(8px)')
      }
      assert.equal(state.mask.background, maskColor)
      assert.equal(state.raised.background, 'rgb(255, 255, 255)')
      assert.equal(state.swatch.background, 'rgb(68, 119, 255)', 'category markers retain meaning')
      assert.equal(state.accent.background, 'rgb(38, 117, 68)', 'accent surfaces retain meaning')
    }
    const light = await inspect(); checkLayers(light)
    const lightPixels = await readPixels(await page.screenshot({ path: path.join(out, 'browser-nested-light.png') }))
    const sameTint = pixels => {
      // Different compositor surfaces round premultiplied color by at most one
      // byte. This still rejects the 30+ byte brightening of a duplicated veil.
      for (const pixel of pixels) {
        pixel.forEach((channel, i) => assert.ok(Math.abs(channel - pixels[3][i]) <= 1, 'pane and footer pixels have the same effective tint'))
      }
    }
    sameTint(lightPixels)
    assert.deepEqual(lightPixels[3].slice(0, 3), [84, 104, 124], 'one 20% white tint, not two layers totaling 36%')
    await page.evaluate(() => {
      document.documentElement.style.setProperty('--ui-bg-chrome', '#182126')
      document.documentElement.style.setProperty('--ui-text-primary', '#e5e7eb')
    })
    const dark = await inspect(); checkLayers(dark, 'rgb(24, 33, 38)')
    const darkPixels = await readPixels(await page.screenshot({ path: path.join(out, 'browser-nested-dark.png') }))
    sameTint(darkPixels)
    await page.evaluate(() => material.update({ enabled: true, glassTransparency: 100, surfaceFrost: 0 }))
    const transparent = await inspect()
    assert.match(transparent.footer.background, /\/ 0\)/)
    assert.equal(transparent.menu.blur, 'none', '0px is honored on floating surfaces too')
    const transparentPixels = await readPixels(await page.screenshot())
    for (const pixel of transparentPixels) assert.deepEqual(pixel.slice(0, 3), [41, 66, 91])
    await page.evaluate(() => material.update({ enabled: true, glassTransparency: 0, surfaceFrost: 0 }))
    const opaque = await inspect()
    assert.equal(opaque.menu.background, opaque.footer.background)
    await page.evaluate(() => material.destroy())
    const restored = await inspect()
    assert.equal(restored.menu.background, 'rgb(250, 250, 250)')
    assert.equal(restored.tooltip.color, 'rgb(255, 255, 255)', 'host tooltip color returns after unload')
    fs.writeFileSync(path.join(out, 'browser-results.json'), JSON.stringify({ light, dark, lightPixels, darkPixels, transparentPixels, result: 'PASS' }, null, 2))
    console.log('Real nested pane/footbar pixels, translucent SDK surfaces, protected masks, semantic colors, endpoints and unload: PASS')
  } finally { await browser.close() }
})().catch(error => { console.error(error); process.exitCode = 1 })
