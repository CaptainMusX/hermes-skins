/**
 * The Appearance page renders plugin extras only on its root view, while the
 * rail always lands on the first subpage (General). Mount a small, plugin-owned
 * entry card at the end of General so Settings ▸ Appearance has a visible door
 * to the full Wallpaper Engine page. The card is removed as soon as the
 * General section leaves the DOM.
 */
const CARD_ID = 'hermes-skins-appearance-entry'

const isChinese = () => {
  const language = typeof document !== 'undefined'
    ? document.documentElement.lang || navigator.language || '' : ''
  return String(language).toLowerCase().startsWith('zh')
}

function isGeneralAppearance() {
  if (typeof location === 'undefined') return false
  const query = location.hash.split('?')[1] || ''
  const params = new URLSearchParams(query)
  return params.get('page') === 'general' && params.get('tab') === 'config:appearance'
}

export function mountAppearanceEntry({ getSummary, open }) {
  if (typeof document === 'undefined' || typeof MutationObserver !== 'function') return () => {}
  let card = null
  let timer = null
  let disposed = false

  const remove = () => {
    card?.remove()
    card = null
  }

  const sync = () => {
    if (disposed) return
    if (!isGeneralAppearance()) {
      remove()
      return
    }
    const container = document.getElementById('setting-field-appearance.language')?.closest('.overflow-y-auto')
    if (!container) {
      remove()
      return
    }
    if (card?.isConnected && card.parentElement === container) return
    remove()
    card = document.createElement('section')
    card.id = CARD_ID
    card.setAttribute('data-hermes-skins-surface', '')
    card.className = 'mt-6 flex flex-col gap-3 rounded-xl border border-border bg-card p-5'

    const title = document.createElement('h3')
    title.className = 'text-sm font-semibold text-foreground'
    title.textContent = isChinese() ? '壁纸引擎' : 'Wallpaper Engine'
    const summary = document.createElement('p')
    summary.className = 'text-xs text-muted-foreground'
    summary.textContent = getSummary?.() ||
      (isChinese() ? 'Scene / Web / 视频 / 图片壁纸与液态玻璃。' : 'Scene, Web, video and image wallpapers with liquid glass.')
    const button = document.createElement('button')
    button.type = 'button'
    button.className = 'w-fit rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90'
    button.textContent = isChinese() ? '打开壁纸引擎' : 'Open Wallpaper Engine'
    button.addEventListener('click', () => open?.())
    card.append(title, summary, button)
    container.appendChild(card)
  }

  const schedule = () => {
    if (timer !== null || disposed) return
    timer = setTimeout(() => {
      timer = null
      sync()
    }, 80)
  }

  const observer = new MutationObserver(schedule)
  observer.observe(document.body, { childList: true, subtree: true })
  schedule()
  return () => {
    disposed = true
    observer.disconnect()
    if (timer !== null) clearTimeout(timer)
    timer = null
    remove()
  }
}
