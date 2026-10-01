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

export async function loadSceneManifest(bridge, manifestPath) {
  if (!bridge?.readFileText || !bridge?.readFileDataUrl) throw new Error('Hermes local file bridge unavailable')
  const file = await bridge.readFileText(manifestPath)
  if (file?.truncated || !file?.text) throw new Error('Scene manifest is missing or truncated')
  const data = JSON.parse(file.text)
  if (!data.manifest || typeof data.resources !== 'object') throw new Error('Scene manifest is invalid')
  const paths = Object.entries(data.resources)
  const URLs = {}
  const objectUrls = []
  let totalBytes = 0
  try {
    // Read sequentially: several 100 MiB video layers can otherwise multiply
    // transient base64 and decoded buffers until the Hermes renderer runs OOM.
    for (const [url, path] of paths) {
      if (typeof path !== 'string') continue
      let data
      try { data = await bridge.readFileDataUrl(path) }
      catch {
        if (!bridge.readFileDataUrlForAttach) throw new Error('Scene resource exceeds the Hermes file-read limit')
        data = await bridge.readFileDataUrlForAttach(path)
      }
      const blob = await fetch(data).then(response => response.blob())
      totalBytes += blob.size
      if (totalBytes > 512 * 1024 * 1024) throw new Error('Scene resources exceed the 512 MiB renderer budget')
      const objectUrl = URL.createObjectURL(blob)
      objectUrls.push(objectUrl)
      URLs[url] = objectUrl
    }
    return { manifest: replaceResources(data.manifest, URLs), framePath: data.framePath,
      missing: data.missing || [], resourceCount: Object.keys(URLs).length,
      scripted: Boolean(data.scripted), objectUrls }
  } catch (error) {
    objectUrls.forEach(url => URL.revokeObjectURL(url))
    throw error
  }
}
