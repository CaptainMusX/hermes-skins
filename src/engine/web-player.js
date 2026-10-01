/** Build a sandboxed, self-contained Web Wallpaper document from local files. */
export async function loadWebWallpaper(bridge, mainPath, shimSource = WE_SHIM_JS) {
  if (!bridge?.readDir || !bridge?.readFileText || !bridge?.readFileDataUrl) {
    throw new Error('Hermes local file bridge unavailable')
  }
  const root = mainPath.replace(/[\\/][^\\/]+$/, '')
  let count = 0
  const files = new Map()
  const queue = [{ dir: root, depth: 0 }]
  while (queue.length && count < 400) {
    const { dir, depth } = queue.shift()
    const listing = await bridge.readDir(dir)
    if (listing?.error) continue
    for (const entry of listing?.entries || []) {
      if (count >= 400) break
      const relative = entry.path.slice(root.length).replace(/^[\\/]+/, '').replace(/\\/g, '/')
      if (!relative || relative.includes('..') || !entry.path.toLowerCase().startsWith(root.toLowerCase())) continue
      if (entry.isDirectory) {
        if (depth < 4) queue.push({ dir: entry.path, depth: depth + 1 })
      } else {
        files.set(relative, entry.path)
        count++
      }
    }
  }
  const readText = async path => {
    let result = await bridge.readFileText(path)
    if (result?.truncated && bridge.readPluginSource) result = await bridge.readPluginSource(path)
    return result?.truncated ? null : result?.text || null
  }
  let html = await readText(mainPath)
  if (!html) throw new Error('Web Wallpaper HTML unavailable')
  const assets = new Map()
  const scripts = new Map()
  const styles = new Map()
  let dataBytes = 0
  for (const [relative, absolute] of files) {
    if (absolute.toLowerCase() === mainPath.toLowerCase()) continue
    if (/\.(js|mjs|json)$/i.test(relative)) {
      const text = await readText(absolute)
      if (text !== null) scripts.set(relative, text)
    } else if (/\.css$/i.test(relative)) {
      const text = await readText(absolute)
      if (text !== null) styles.set(relative, text)
    } else {
      try {
        const data = await bridge.readFileDataUrl(absolute)
        dataBytes += data.length
        if (dataBytes > 64 * 1024 * 1024) throw new Error('web wallpaper assets exceed 64 MiB')
        assets.set(relative, data)
      } catch { /* A decorative asset can be absent; the page still loads. */ }
    }
  }
  const basenameCounts = new Map()
  for (const key of assets.keys()) {
    const base = key.split('/').at(-1)
    basenameCounts.set(base, (basenameCounts.get(base) || 0) + 1)
  }
  const replaceAssets = source => {
    let result = source
    for (const [relative, data] of assets) {
      result = result.replaceAll(relative, data)
      const base = relative.split('/').at(-1)
      if (basenameCounts.get(base) === 1) result = result.replaceAll(base, data)
    }
    return result
  }
  for (const [relative, code] of scripts) {
    const escaped = replaceAssets(code).replace(/<\/script/gi, '<\\/script')
    const pattern = new RegExp(`<script([^>]*?)src=["'](?:\\./)?${relative.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["']([^>]*)><\\/script>`, 'gi')
    html = html.replace(pattern, (_match, before, after) => `<script${before}${after}>${escaped}</script>`)
  }
  for (const [relative, css] of styles) {
    const escaped = replaceAssets(css).replace(/<\/style/gi, '<\\/style')
    const pattern = new RegExp(`<link([^>]*?)href=["'](?:\\./)?${relative.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["']([^>]*)>`, 'gi')
    html = html.replace(pattern, () => `<style>${escaped}</style>`)
  }
  html = replaceAssets(html)
  let defaults = {}
  try {
    const projectPath = root + '\\project.json'
    const project = JSON.parse(await readText(projectPath))
    for (const [name, property] of Object.entries(project?.general?.properties || {})) {
      defaults[name] = { value: property?.value }
    }
  } catch { /* No editable project properties. */ }
  const seed = JSON.stringify(defaults).replace(/</g, '\\u003c')
  const prelude = `<script>window.__dshWeDefaultProps=${seed};</script><script>${shimSource}</script>`
  return /<head[^>]*>/i.test(html) ? html.replace(/<head[^>]*>/i, match => match + prelude) : prelude + html
}
