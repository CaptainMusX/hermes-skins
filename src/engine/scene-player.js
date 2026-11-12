/** Feed the DSH WebGL player through a sandboxed srcdoc instead of its DSH HTTP routes. */
export function scenePlayerHtml(sound = false, volume = 100) {
  const audioSettings = `window.__hermesSceneSound=${Boolean(sound)};window.__hermesSceneVolume=${Math.min(100, Math.max(0, Number.isFinite(Number(volume)) ? Number(volume) : 100)) / 100};`
  const shim = `<script>
    (() => {
      let deliver;
      const manifest = new Promise(resolve => { deliver = resolve; });
      window.addEventListener('message', event => {
        if (event.source === window.parent && event.data?.type === 'hermes-scene-manifest') deliver(event.data.manifest);
      });
      const originalFetch = window.fetch.bind(window);
      window.fetch = (input, options) => String(input).startsWith('/api/skin-center/we/scene-manifest/')
        ? manifest.then(value => new Response(JSON.stringify({ ok: true, manifest: value }),
            { headers: { 'content-type': 'application/json' } }))
        : originalFetch(input, options);
    })();
  </script>`
  return WE_SCENE_PLAYER_HTML
    .replace('video.muted = true;', 'video.muted = !window.__hermesSceneSound; video.volume = window.__hermesSceneVolume;')
    .replace("} else if (msg.type === 'dsh-recover-renderer') {", `} else if (msg.type === 'dsh-set-audio') {
      window.__hermesSceneSound = !!msg.sound;
      window.__hermesSceneVolume = Math.max(0, Math.min(1, Number(msg.volume) / 100));
      for (const record of videoTextureCache.values()) {
        record.video.muted = !window.__hermesSceneSound;
        record.video.volume = window.__hermesSceneVolume;
      }
    } else if (msg.type === 'dsh-recover-renderer') {`)
    .replace('<script>', `<script>${audioSettings}</script>` + shim + '<script>')
}

function replaceResources(value, URLs) {
  if (typeof value === 'string') return URLs[value] || value
  if (Array.isArray(value)) return value.map(item => replaceResources(item, URLs))
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, replaceResources(item, URLs)]))
  }
  return value
}

export function sceneResourceFileUrl(path) {
  if (typeof path !== 'string' || !/^[A-Za-z]:[\\/]/.test(path) || !/\.(png|mp4)$/i.test(path)) return null
  return `file:///${path.replace(/\\/g, '/').split('/').map((part, index) => index ? encodeURIComponent(part) : part).join('/')}`
}

export async function loadSceneManifest(bridge, manifestPath, prepareScene = null, signal = null) {
  if (!bridge?.readFileText || !bridge?.readFileDataUrl) throw new Error('Hermes local file bridge unavailable')
  const readManifest = async path => {
    signal?.throwIfAborted()
    const file = await bridge.readFileText(path)
    signal?.throwIfAborted()
    if (file?.truncated || !file?.text) throw new Error('Scene manifest is missing or truncated')
    const data = JSON.parse(file.text)
    if (!data.manifest || typeof data.resources !== 'object') throw new Error('Scene manifest is invalid')
    return data
  }
  let data = await readManifest(manifestPath)
  // A saved selection points directly at its old cache. Upgrading the backend
  // key alone cannot migrate it: prepare it before loading any obsolete assets.
  if (Number(data.parserVersion || 0) < 6 && prepareScene && typeof data.scenePath === 'string') {
    const dir = data.scenePath.replace(/[\\/][^\\/]+$/, '')
    const prepared = await prepareScene(dir)
    if (!prepared?.ok || !prepared.manifest || !prepared.manifestPath) {
      throw new Error(prepared?.error || 'Scene cache refresh failed')
    }
    data = await readManifest(prepared.manifestPath)
  }
  const paths = Object.entries(data.resources)
  const URLs = {}
  const objectUrls = []
  let totalBytes = 0
  const loadedPaths = new Map()
  // The Electron file-origin player can decode cache files directly. Verify
  // access with HEAD and retain the bridge path on restricted/older hosts.
  // In particular, videos stay native media streams instead of whole-file
  // base64 IPC strings + decoded buffers + resident Blob copies.
  const nativeFiles = typeof window !== 'undefined' && window.location?.protocol === 'file:' && window.hermesDesktop === bridge
  try {
    // Read sequentially: several 100 MiB video layers can otherwise multiply
    // transient base64 and decoded buffers until the Hermes renderer runs OOM.
    for (const [url, path] of paths) {
      signal?.throwIfAborted()
      if (typeof path !== 'string') continue
      const pathKey = path.replace(/\\/g, '/').toLowerCase()
      if (loadedPaths.has(pathKey)) { URLs[url] = loadedPaths.get(pathKey); continue }
      const fileUrl = nativeFiles ? sceneResourceFileUrl(path) : null
      if (fileUrl) {
        try {
          const response = await fetch(fileUrl, { method: 'HEAD', signal })
          signal?.throwIfAborted()
          if (response.ok) {
            URLs[url] = fileUrl
            loadedPaths.set(pathKey, fileUrl)
            continue
          }
        } catch { signal?.throwIfAborted() }
      }
      let data
      try { data = await bridge.readFileDataUrl(path) }
      catch {
        if (!bridge.readFileDataUrlForAttach) throw new Error('Scene resource exceeds the Hermes file-read limit')
        data = await bridge.readFileDataUrlForAttach(path)
      }
      signal?.throwIfAborted()
      const blob = await fetch(data, { signal }).then(response => response.blob())
      signal?.throwIfAborted()
      totalBytes += blob.size
      if (totalBytes > 512 * 1024 * 1024) throw new Error('Scene resources exceed the 512 MiB renderer budget')
      const objectUrl = URL.createObjectURL(blob)
      objectUrls.push(objectUrl)
      URLs[url] = objectUrl
      loadedPaths.set(pathKey, objectUrl)
    }
    return { manifest: replaceResources(data.manifest, URLs), framePath: data.framePath,
      missing: data.missing || [], resourceCount: Object.keys(URLs).length,
      scripted: Boolean(data.scripted), objectUrls }
  } catch (error) {
    objectUrls.forEach(url => URL.revokeObjectURL(url))
    throw error
  }
}
