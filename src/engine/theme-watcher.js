/**
 * Root-theme runtime sync.
 *
 * The removed status-bar chip used to keep a React effect mounted at all times
 * so theme repaints re-synced the backdrop. This watcher replaces that with a
 * runtime that runs whether or not a plugin page is open and regardless of the
 * status bar's visibility. It observes ONLY the root theme attributes the host
 * repaints (themes/context.tsx applyTheme rewrites data-hermes-theme,
 * data-hermes-mode and the .dark class on every paint), coalesces a burst of
 * mutations into one sync via a microtask, dedupes no-op repaints, never
 * polls, and disconnects completely on dispose.
 *
 * Committed vs try-on themes: applyTheme stamps data-hermes-theme with the
 * PAINTED name — during a try-on that is the previewed skin, not the committed
 * one. sync() compares its theme-name argument against the try-on base theme
 * to decide the preview went stale, so forwarding the painted name here would
 * tear the try-on down on every repaint. While a preview is active the
 * committed name therefore stays whatever sync last recorded and only the mode
 * is refreshed; the try-on lifecycle itself syncs explicitly.
 */
const THEME_ATTRS = ['class', 'data-hermes-mode', 'data-hermes-theme', 'data-hermes-terminal-alpha']

export function watchRootTheme(store, controller) {
  if (typeof document === 'undefined' || typeof MutationObserver !== 'function') return () => {}
  const root = document.documentElement
  const stateKey = () => {
    const previewing = Boolean(store.$tryOnSkin.get())
    const themeName = previewing ? '~preview' : (root.dataset.hermesTheme || null)
    return `${themeName}:${root.dataset.hermesMode || 'dark'}:${root.dataset.hermesTerminalAlpha || 'false'}`
  }

  let queued = false
  let disposed = false
  let lastKey = stateKey()

  const flush = () => {
    queued = false
    if (disposed) return
    const key = stateKey()
    if (key === lastKey) return
    lastKey = key
    const previewing = Boolean(store.$tryOnSkin.get())
    controller.sync(previewing ? undefined : (root.dataset.hermesTheme || null),
      root.dataset.hermesMode || 'dark')
  }

  const observer = new MutationObserver(() => {
    if (queued || disposed) return
    queued = true
    queueMicrotask(flush)
  })
  observer.observe(root, { attributes: true, attributeFilter: THEME_ATTRS })

  return () => {
    disposed = true
    observer.disconnect()
    queued = false
  }
}
