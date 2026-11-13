/**
 * Hermes WebWallGL renderer page.
 *
 * Adapted from elysia395/dsh-wallpaper-engine (MIT) and reduced to the
 * host-agnostic surface this plugin needs: project sources, fit/fps/quality,
 * pointer forwarding, media properties and an explicit parent message channel.
 * The rendering engine itself is oneincase/webwallgl 3.0.1 (MIT).
 */
if (!globalThis.WebWallGL) throw new Error("WebWallGL engine was not loaded")

const { createScene, httpSource, createMediaSource } = globalThis.WebWallGL
const params = new URLSearchParams(location.search)
const FITS = new Set(["cover", "contain", "stretch"])
const fitOf = value => (FITS.has(value) ? value : "cover")
const host = document.getElementById("wp")
const pageType = (params.get("type") || "scene").toLowerCase()
const pageSrc = params.get("src") || ""
const pageMediaBase = params.get("mediaBase") || ""
let current = { type: pageType, src: pageSrc, mediaBase: pageMediaBase }
let generation = 0
let loadSettled = false
let loadWatchdog = null
let volume = params.get("muted") === "false" ? 1 : 0
let mediaInit = null
let mediaControls = null
let mediaSource = null

function send(type, detail = {}) {
  try {
    window.parent?.postMessage({ source: "hermes-skins-scene", type, ...detail }, "*")
  } catch {}
}

function reportDiag(message, level = "info") {
  const text = `scene ${current.src || "?"}: ${String(message ?? "").slice(0, 500)}`
  send("diag", { level, message: text })
}

function webSource(entryUrl) {
  const dir = entryUrl.replace(/[?#].*$/, "").replace(/\/[^/]*$/, "")
  let project = null
  return {
    key: dir,
    project() {
      project ??= fetch(`${dir}/project.json`)
        .then(response => (response.ok ? response.json() : null))
        .catch(() => null)
        .then(value => ({ ...(value && typeof value === "object" ? value : {}), type: "web" }))
      return project
    },
    async webEntry() {
      return { url: entryUrl }
    },
    scenePkg() {
      return Promise.reject(new Error("web wallpaper has no scene.pkg"))
    }
  }
}

function sourceOf(config) {
  if (config.type === "web") return config.src ? webSource(config.src) : null
  if (!config.mediaBase || !config.src) return null
  return httpSource(`${config.mediaBase.replace(/\/+$/, "")}/${config.src}`)
}

const instance = createScene(host, {
  fit: fitOf(params.get("fit")),
  fps: Number(params.get("sceneFps")) || 60,
  volume,
  renderDpr: Number(params.get("renderDpr")) || 0,
  videoTexScale: Number(params.get("vidscale")) || 0,
  ...(params.get("autoq") === "0" ? { autoQuality: false } : {}),
  ...(params.get("bake") === "0" ? { bake: false } : {}),
  onDiagnostic: reportDiag
})

function clearFallback() {
  host.querySelector("iframe.we-fallback")?.remove()
  window.frameElement?.classList.remove("we-live-fallback-ready")
}

function showFallback() {
  if (host.querySelector("iframe.we-fallback")) return
  const frame = document.createElement("iframe")
  frame.className = "we-fallback"
  frame.setAttribute("sandbox", "allow-scripts")
  frame.srcdoc = '<!doctype html><html><body style="margin:0;background:transparent"></body></html>'
  host.appendChild(frame)
}

function fail(error) {
  if (current.type === "web") webState.error = String(error?.message ?? error)
  reportDiag(`load failed: ${error?.message ?? error}`, "error")
  showFallback()
  send("error", { message: String(error?.message ?? error) })
}

const webState = { loaded: false, error: null }
function watchWebFrame(frame) {
  if (frame.dataset.hermesWatched) return
  frame.dataset.hermesWatched = "1"
  frame.addEventListener("load", () => { webState.loaded = true })
  frame.addEventListener("error", () => { webState.error = "iframe error" })
}
new MutationObserver(() => {
  for (const frame of host.querySelectorAll("iframe:not(.we-fallback)")) watchWebFrame(frame)
}).observe(host, { childList: true, subtree: true })

instance.on("error", error => {
  if (loadSettled) fail(error)
})

function loadCurrent(source) {
  const thisGeneration = ++generation
  loadSettled = false
  clearFallback()
  webState.loaded = false
  webState.error = null
  if (loadWatchdog !== null) clearTimeout(loadWatchdog)
  const next = source ?? sourceOf(current)
  if (!next) {
    fail(new Error(current.type === "web" ? "web wallpaper is missing src" : "scene wallpaper is missing mediaBase/src"))
    return
  }
  loadWatchdog = setTimeout(() => {
    loadWatchdog = null
    if (thisGeneration !== generation || loadSettled) return
    fail(new Error("load() did not settle within 30s"))
  }, 30000)
  instance.load(next)
    .then(() => {
      if (thisGeneration !== generation) return
      if (loadWatchdog !== null) clearTimeout(loadWatchdog)
      loadWatchdog = null
      loadSettled = true
      instance.setVolume(volume)
      send("ready", { type: current.type })
    })
    .catch(error => {
      if (thisGeneration !== generation) return
      if (loadWatchdog !== null) clearTimeout(loadWatchdog)
      loadWatchdog = null
      fail(error)
    })
}

function applyMedia(rebuild) {
  if (!mediaInit && !mediaControls) {
    mediaSource = null
    instance.setMedia(null)
    return
  }
  const init = mediaInit ?? { hasMedia: false }
  if (mediaSource && !rebuild) {
    mediaSource.set(init)
    return
  }
  mediaSource = createMediaSource(init, mediaControls ?? undefined)
  instance.setMedia(mediaSource)
}

window.__wpStats = { frame: () => instance.stats }

window.__wp = {
  setWallpaper(config) {
    current = {
      type: String(config?.type || "scene").toLowerCase(),
      src: config?.src || "",
      mediaBase: config?.mediaBase ?? current.mediaBase
    }
    if (config?.fit) instance.setFit(fitOf(config.fit))
    if (config?.sceneFps) instance.setFps(Number(config.sceneFps))
    loadCurrent()
  },
  pause() { instance.pause() },
  resume() { instance.resume() },
  restore() { instance.restore() },
  setFit(fit) { instance.setFit(fitOf(fit)) },
  setVolume(value) {
    volume = Math.max(0, Math.min(1, Number(value) || 0))
    instance.setVolume(volume)
  },
  setRenderDpr(value) { instance.setRenderDpr(Number(value) || 0) },
  setSceneFps(value) { instance.setFps(Number(value) || 60) },
  setQuality(patch) { instance.setQuality(patch ?? {}) },
  getQuality() { return instance.getQuality() },
  pushPointer(u, v, buttons, mods) { instance.pushPointer(u, v, buttons, mods) },
  pointerLeave() { instance.pointerLeave() },
  pushWheel(dx, dy, mode, mods) { instance.pushWheel(dx, dy, mode, mods) },
  setMedia(init) {
    mediaInit = init && typeof init === "object" ? init : null
    applyMedia(false)
  },
  setMediaControl(controls) {
    mediaControls = controls && typeof controls === "object" ? controls : null
    applyMedia(true)
  },
  updateWebProps(wire) {
    const flat = {}
    for (const [key, value] of Object.entries(wire ?? {})) flat[key] = value && typeof value === "object" ? value.value : value
    instance.setProperties(flat)
  },
  setOcclusion(payload) { instance.setOcclusion(payload ?? null) },
  getState() {
    const isWeb = current.type === "web"
    return {
      type: current.type || null,
      iframeLoaded: isWeb ? webState.loaded : null,
      webError: isWeb ? webState.error : null,
      paused: instance.paused === true,
      webFps: isWeb ? Math.round(instance.stats?.fps || 0) : null
    }
  },
  release() {
    generation++
    loadSettled = false
    if (loadWatchdog !== null) clearTimeout(loadWatchdog)
    loadWatchdog = null
    instance.release()
  },
  destroy() {
    generation++
    loadSettled = false
    if (loadWatchdog !== null) clearTimeout(loadWatchdog)
    loadWatchdog = null
    instance.destroy()
  }
}

window.addEventListener("message", event => {
  if (event.source !== window.parent) return
  const data = event.data
  if (!data || data.source !== "hermes-skins-host") return
  try {
    if (data.type === "command" && data.command && typeof window.__wp[data.command] === "function") {
      window.__wp[data.command](...(data.args || []))
    } else if (data.type === "pointer") {
      window.__wp.pushPointer(data.u, data.v, data.buttons, data.mods)
    } else if (data.type === "pointer-leave") {
      window.__wp.pointerLeave()
    } else if (data.type === "wheel") {
      window.__wp.pushWheel(data.dx, data.dy, data.mode, data.mods)
    }
  } catch (error) {
    reportDiag(`control failed: ${error?.message ?? error}`, "warn")
  }
})

setInterval(() => {
  if (document.visibilityState !== "visible") return
  const stats = instance.stats || {}
  send("stats", {
    fps: Math.round(stats.fps || 0),
    paused: instance.paused === true,
    type: current.type
  })
}, 1000)

document.addEventListener("contextmenu", event => event.preventDefault())
window.addEventListener("pagehide", () => {
  try { instance.destroy() } catch {}
})

loadCurrent()
