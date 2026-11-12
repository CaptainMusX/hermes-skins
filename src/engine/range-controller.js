const RANGE_STYLE_ID = 'hermes-skins-range-css'
const RANGE_PROGRESS = '--hermes-range-progress'

/** Read the input's live property, not its sometimes stale value attribute. */
export function rangeProgress(input) {
  const min = input.min === '' ? 0 : Number(input.min)
  const max = input.max === '' ? 100 : Number(input.max)
  const value = input.valueAsNumber
  if (![min, max, value].every(Number.isFinite) || max <= min) return 0
  return Math.min(100, Math.max(0, (value - min) / (max - min) * 100))
}

/** Global range painting has its own lifetime: it does not depend on wallpaper. */
export class RangeController {
  constructor() {
    this.styleEl = null
    this.observer = null
    this.inputs = new Map()
    this.pending = new Set()
    this.queued = false
    this.active = false
    this.frame = null
    this.needsCleanup = false
    this.onInput = event => {
      if (event.target?.matches?.('input[type="range"]')) this.sync(event.target)
    }
  }

  start() {
    if (this.active || typeof document === 'undefined') return
    this.active = true
    this.styleEl = document.createElement('style')
    this.styleEl.id = RANGE_STYLE_ID
    this.styleEl.dataset.plugin = 'hermes-skins'
    this.styleEl.textContent = `
      :root input[type="range"] {
        --hermes-range-accent: var(--dt-primary-solid, var(--theme-primary, var(--ui-accent, #3b82f6)));
        --hermes-range-rest: color-mix(in srgb, var(--ui-bg-chrome, #fff) 80%, var(--ui-text-primary, #64748b));
        --hermes-range-direction: to right;
        appearance: none;
        -webkit-appearance: none;
        min-height: 1.25rem;
        padding: 0;
        border: 0;
        background: transparent !important;
        cursor: pointer;
        vertical-align: middle;
      }
      :root input[type="range"]:dir(rtl) {
        --hermes-range-direction: to left;
      }
      :root input[type="range"]::-webkit-slider-runnable-track {
        height: 0.375rem;
        border-radius: 9999px;
        background: linear-gradient(var(--hermes-range-direction),
          var(--hermes-range-accent) 0 var(--hermes-range-progress, 0%),
          var(--hermes-range-rest) var(--hermes-range-progress, 0%) 100%);
      }
      :root input[type="range"]::-webkit-slider-thumb {
        appearance: none;
        -webkit-appearance: none;
        width: 1rem;
        height: 1rem;
        margin-top: -0.3125rem;
        border-radius: 9999px;
        border: 2px solid var(--ui-bg-chrome, #fff);
        background: var(--hermes-range-accent);
        box-shadow: 0 0 0 1px color-mix(in srgb, var(--ui-text-primary, #64748b) 25%, transparent);
      }
      :root input[type="range"]::-moz-range-track {
        height: 0.375rem;
        border-radius: 9999px;
        background: var(--hermes-range-rest);
      }
      :root input[type="range"]::-moz-range-progress {
        height: 0.375rem;
        border-radius: 9999px;
        background: var(--hermes-range-accent);
      }
      :root input[type="range"]::-moz-range-thumb {
        width: 0.75rem;
        height: 0.75rem;
        border-radius: 9999px;
        border: 2px solid var(--ui-bg-chrome, #fff);
        background: var(--hermes-range-accent);
      }
      :root input[type="range"]:focus-visible {
        outline: 2px solid var(--hermes-range-accent);
        outline-offset: 3px;
        border-radius: 9999px;
      }
      :root input[type="range"]:disabled {
        --hermes-range-accent: color-mix(in srgb, var(--ui-text-primary, #64748b) 45%, var(--ui-bg-chrome, #fff));
        opacity: 0.55;
        cursor: not-allowed;
      }
    `
    document.head.appendChild(this.styleEl)
    this.scan(document)
    for (const event of ['input', 'change', 'focusin']) {
      document.addEventListener(event, this.onInput, true)
    }
    if (typeof MutationObserver === 'function') {
      this.observer = new MutationObserver(records => {
        for (const record of records) {
          if (record.type === 'attributes') {
            // min/value/type changes on non-range host widgets need no work.
            if (this.inputs.has(record.target) || record.target.matches?.('input[type="range"]')) this.pending.add(record.target)
          }
          else {
            for (const node of record.addedNodes) {
              // Token streams commonly add text nodes. They cannot own inputs.
              if (node.nodeType === undefined || node.nodeType === 1) this.pending.add(node)
            }
            // Restore and release removed inputs; a node moved within the
            // document stays connected and keeps its original saved value.
            if (record.removedNodes.length && this.inputs.size) this.needsCleanup = true
          }
        }
        if (this.pending.size || this.needsCleanup) this.queueFlush()
      })
      // Our own style writes are deliberately excluded: they cannot feed a loop.
      this.observer.observe(document.documentElement, {
        subtree: true, childList: true, attributes: true,
        attributeFilter: ['type', 'value', 'min', 'max']
      })
    }
  }

  scan(node) {
    if (node.matches?.('input[type="range"]')) this.sync(node)
    for (const input of node.querySelectorAll?.('input[type="range"]') || []) this.sync(input)
  }

  sync(input) {
    if (!this.active || !input.isConnected) return
    if (!this.inputs.has(input)) {
      this.inputs.set(input, {
        value: input.style.getPropertyValue(RANGE_PROGRESS),
        priority: input.style.getPropertyPriority(RANGE_PROGRESS)
      })
    }
    const progress = `${Number(rangeProgress(input).toFixed(4))}%`
    if (input.style.getPropertyValue(RANGE_PROGRESS) !== progress) {
      input.style.setProperty(RANGE_PROGRESS, progress)
    }
  }

  queueFlush() {
    if (this.queued || !this.active) return
    this.queued = true
    const flush = () => {
      this.frame = null
      this.queued = false
      if (!this.active) return
      const started = performance.now()
      for (const node of this.pending) {
        let covered = false
        for (let parent = node.parentNode; parent; parent = parent.parentNode) {
          if (this.pending.has(parent)) { covered = true; break }
        }
        if (covered || !node.isConnected) this.pending.delete(node)
      }
      for (const node of this.pending) {
        this.scan(node)
        this.pending.delete(node)
        if (performance.now() - started > 4) break
      }
      // Only tracked controls need cleanup. Never rescan the whole document.
      if (this.needsCleanup || this.inputs.size) {
        this.needsCleanup = false
        for (const input of this.inputs.keys()) {
          if (!input.isConnected || !input.matches('input[type="range"]')) this.restore(input)
        }
      }
      if (this.pending.size) this.queueFlush()
    }
    // Yield to the host's chat rendering; a MutationObserver microtask must
    // not scan DOM before every token has had a chance to paint.
    if (typeof window !== 'undefined' && window.requestAnimationFrame) this.frame = window.requestAnimationFrame(flush)
    else queueMicrotask(flush)
  }

  restore(input) {
    const original = this.inputs.get(input)
    if (!original) return
    if (original.value) input.style.setProperty(RANGE_PROGRESS, original.value, original.priority)
    else input.style.removeProperty(RANGE_PROGRESS)
    this.inputs.delete(input)
  }

  destroy() {
    this.active = false
    if (this.frame !== null) window.cancelAnimationFrame(this.frame)
    this.frame = null
    this.observer?.disconnect()
    this.observer = null
    if (typeof document !== 'undefined') {
      for (const event of ['input', 'change', 'focusin']) {
        document.removeEventListener(event, this.onInput, true)
      }
    }
    for (const input of this.inputs.keys()) this.restore(input)
    this.pending.clear()
    this.queued = false
    this.styleEl?.remove()
    this.styleEl = null
  }
}
