// Browser acceptance for material layering and native Chromium range painting.
const fs = require('node:fs')
const path = require('node:path')
const assert = require('node:assert/strict')
let chromium
try { ({ chromium } = require('playwright')) } catch {
  ({ chromium } = require(path.join(process.env.LOCALAPPDATA, 'hermes/hermes-agent/node_modules/playwright')))
}

const root = path.resolve(__dirname, '..')
const out = path.join(root, 'verification/material-range')
fs.mkdirSync(out, { recursive: true })

;(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true })
  try {
    const page = await browser.newPage({ viewport: { width: 1000, height: 600 } })
    await page.setContent(`<!doctype html><html data-hermes-glass data-hermes-glass-scope="sidebar"><head><style>
      :root { --ui-bg-chrome:#f9fafb; --ui-bg-sidebar:#f3f4f6; --ui-text-primary:#1f2937;
        --theme-primary:#267544; --dt-primary-solid:#267544; --ui-bg-elevated:#f9fafb; }
      * { box-sizing:border-box } body { margin:0;font:16px system-ui;background:var(--ui-bg-chrome) }
      #wallpaper { position:fixed;inset:0;background:linear-gradient(135deg,#f4dcae,#c5dfcd 38%,#b3c7e8 72%,#dea79a) }
      [data-slot="sidebar-wrapper"] { background:var(--ui-bg-chrome) }
      [data-contrib-shell] { height:600px;display:flex;flex-direction:column;background:var(--ui-bg-chrome) }
      main { display:flex;flex:1;min-height:0 } aside { width:200px;padding:20px }
      .editor { flex:1;padding:24px;background:var(--ui-editor-surface-background) }
      [data-slot="sidebar"] { background:var(--ui-sidebar-surface-background) }
      [data-panel-header] { height:44px;padding:12px;background:var(--ui-sidebar-surface-background) }
      [data-hermes-skins-surface] { border:1px solid #80808060;border-radius:12px;padding:20px;background:var(--ui-bg-editor) }
      [data-hermes-skins-page] > header { padding:10px;margin-bottom:16px }
      label { display:flex;flex-direction:column;gap:8px;margin:18px 0 } input { width:100% }
      footer { height:30px;padding:4px 12px;background:var(--ui-sidebar-surface-background) }
      :root[data-hermes-glass][data-hermes-glass-scope="sidebar"] [data-slot="statusbar"] { --ui-sidebar-surface-background:var(--ui-bg-chrome) }
      .chip { background:var(--ui-sidebar-surface-background) }
    </style></head><body><div id="wallpaper"></div><div data-slot="sidebar-wrapper" class="bg-background"><div data-contrib-shell>
      <div data-panel-header>Hermes · Shared material</div><main>
      <aside data-slot="sidebar">Sidebar</aside><div class="editor bg-(--ui-editor-surface-background)"><div data-hermes-skins-page>
      <header>Interface transparency</header><section data-hermes-skins-surface>
      <label>Minimum · 0%<input id="minimum" type="range" min="0" max="100" value="0"></label>
      <label>Nonzero range · 50%<input id="middle" type="range" min="0.5" max="2" step="0.05" value="1.25"></label>
      <label>Maximum · 100%<input id="maximum" type="range" value="100"></label>
      <label>Disabled · 50%<input id="disabled" type="range" value="50" disabled></label>
      </section></div></div></main><footer data-slot="statusbar"><span class="chip bg-(--ui-sidebar-surface-background)">Status bar</span></footer>
      </div></div></body></html>`)
    for (const file of ['glass-controller.js', 'range-controller.js']) {
      const code = fs.readFileSync(path.join(root, 'src/engine', file), 'utf8').replace(/^export /gm, '')
      await page.addScriptTag({ content: code })
    }
    await page.evaluate(() => {
      window.material = new GlassController()
      window.ranges = new RangeController()
      material.update({ enabled: true, glassTransparency: 80, surfaceFrost: 8 })
      ranges.start()
    })
    const inspect = async () => page.evaluate(() => {
      const surface = selector => {
        const s = getComputedStyle(document.querySelector(selector))
        return { background: s.backgroundColor, blur: s.backdropFilter, token: s.getPropertyValue('--ui-sidebar-surface-background') }
      }
      return {
        sidebar: surface('[data-slot="sidebar"]'), editor: surface('.editor'), footer: surface('footer'),
        wrapper: surface('[data-slot="sidebar-wrapper"]'), card: surface('section'), heading: surface('[data-hermes-skins-page] > header'),
        chip: surface('.chip'),
        progress: [...document.querySelectorAll('input')].map(e => e.style.getPropertyValue('--hermes-range-progress')),
        accent: getComputedStyle(document.querySelector('#middle')).getPropertyValue('--hermes-range-accent'),
        disabledOpacity: getComputedStyle(document.querySelector('#disabled')).opacity
      }
    })
    const light = await inspect()
    assert.equal(light.sidebar.background, light.footer.background)
    assert.equal(light.editor.background, light.footer.background)
    for (const s of [light.sidebar, light.editor, light.footer]) assert.equal(s.blur, 'blur(8px)')
    assert.equal(light.footer.token, light.sidebar.token, 'native sidebar Glass cannot leave an opaque footer token')
    for (const s of [light.card, light.heading, light.chip]) {
      assert.equal(s.background, 'rgba(0, 0, 0, 0)')
      assert.equal(s.blur, 'none')
    }
    assert.equal(light.wrapper.blur, 'none', 'the full-window wrapper must not add a second blur')
    assert.deepEqual(light.progress, ['0%', '50%', '100%', '50%'])
    assert.equal(light.disabledOpacity, '0.55')
    await page.keyboard.press('Tab')
    assert.equal(await page.locator('#minimum').evaluate(e => getComputedStyle(e).outlineStyle), 'solid')
    const trackPixels = async screenshot => {
      const box = await page.locator('#middle').boundingBox()
      return page.evaluate(async ({ data, box }) => {
        const image = new Image()
        image.src = data
        await image.decode()
        const canvas = document.createElement('canvas')
        canvas.width = image.width; canvas.height = image.height
        const ctx = canvas.getContext('2d')
        ctx.drawImage(image, 0, 0)
        return [0.25, 0.75].map(ratio => [...ctx.getImageData(Math.round(box.x + box.width * ratio), Math.round(box.y + box.height / 2), 1, 1).data])
      }, { data: `data:image/png;base64,${screenshot.toString('base64')}`, box })
    }
    const lightPixels = await trackPixels(await page.screenshot({ path: path.join(out, 'browser-light.png') }))
    assert.deepEqual(lightPixels[0].slice(0, 3), [38, 117, 68], 'selected half is painted in the theme accent')
    assert.notDeepEqual(lightPixels[0], lightPixels[1], 'remaining half has a visibly different color')
    await page.evaluate(() => {
      document.documentElement.style.setProperty('--ui-bg-chrome', '#182126')
      document.documentElement.style.setProperty('--ui-text-primary', '#e5e7eb')
      document.documentElement.style.setProperty('--dt-primary-solid', '#68bf82')
    })
    const dark = await inspect()
    assert.equal(dark.sidebar.background, dark.footer.background)
    assert.notEqual(light.accent, dark.accent, 'theme colors repaint without rebuilding progress')
    const darkPixels = await trackPixels(await page.screenshot({ path: path.join(out, 'browser-dark.png') }))
    assert.deepEqual(darkPixels[0].slice(0, 3), [104, 191, 130])
    assert.notDeepEqual(darkPixels[0], darkPixels[1])
    await page.evaluate(() => document.documentElement.dir = 'rtl')
    const rtlPixels = await trackPixels(await page.screenshot())
    assert.deepEqual(rtlPixels[1].slice(0, 3), [104, 191, 130], 'RTL paints the selected half on the right')
    assert.notDeepEqual(rtlPixels[0], rtlPixels[1])
    await page.evaluate(() => {
      const input = document.querySelector('#middle')
      input.value = '2'
      input.dispatchEvent(new Event('input', { bubbles: true }))
    })
    assert.equal(await page.locator('#middle').evaluate(e => e.style.getPropertyValue('--hermes-range-progress')), '100%')
    await page.locator('#middle').evaluate(e => e.setAttribute('value', '0.5'))
    // A controlled React range writes both value/defaultValue; verify the
    // observer reads the live property after such an attribute repaint.
    await page.locator('#middle').evaluate(e => { e.value = '0.5'; e.setAttribute('max', '3.5') })
    assert.equal(await page.locator('#middle').evaluate(e => e.style.getPropertyValue('--hermes-range-progress')), '0%')
    await page.evaluate(() => {
      const input = document.createElement('input')
      input.type = 'range'; input.id = 'dynamic'; input.min = '10'; input.max = '30'; input.value = '15'
      input.style.setProperty('--hermes-range-progress', '37%', 'important')
      document.querySelector('section').appendChild(input)
    })
    assert.equal(await page.locator('#dynamic').evaluate(e => e.style.getPropertyValue('--hermes-range-progress')), '25%')
    await page.evaluate(() => material.update({ enabled: false }))
    assert.equal(await page.locator('#dynamic').evaluate(e => getComputedStyle(e).appearance), 'none', 'wallpaper off retains global range styling')
    await page.evaluate(() => ranges.destroy())
    assert.equal(await page.locator('#dynamic').evaluate(e => e.style.getPropertyValue('--hermes-range-progress')), '37%')
    assert.equal(await page.locator('#dynamic').evaluate(e => e.style.getPropertyPriority('--hermes-range-progress')), 'important')
    assert.equal(await page.locator('#middle').evaluate(e => e.style.getPropertyValue('--hermes-range-progress')), '')
    assert.equal(await page.locator('#hermes-skins-range-css').count(), 0)
    fs.writeFileSync(path.join(out, 'browser-checks.json'), JSON.stringify({ light, dark, lightPixels, darkPixels, rtlPixels, result: 'PASS' }, null, 2))
    console.log('Chromium material, endpoints, theme, RTL, focus, dynamic updates, wallpaper-off and teardown: PASS')
  } finally { await browser.close() }
})().catch(error => { console.error(error); process.exitCode = 1 })
