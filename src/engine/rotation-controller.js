import { activeRotationGroup, resolveWallpaperSelection, rotationCandidates } from './wallpaper-apply.js'

const TICK_MS = 15000

/**
 * User-defined rotation groups. Each group has its own interval, order and
 * video-end trigger; hidden wallpapers and removed projects never become
 * candidates.
 */
export class WallpaperRotation {
  constructor(store, openScene, controller, backdrop = null) {
    this.store = store
    this.openScene = openScene
    this.controller = controller
    this.backdrop = backdrop
    this.lastSwitch = Date.now()
    this.lastId = store.$config.get().weSelection?.id || null
    this.lastGroupId = store.$config.get().rotationGroupId || ''
    this.lastEnabled = false
    this.switching = false
    this.timer = typeof document === 'undefined' ? null : setInterval(() => void this.tick(), TICK_MS)
    this.handleVideoEnd = () => void this.advance(true)
    if (backdrop) backdrop.onMediaEnd = this.handleVideoEnd
  }

  currentGroup(config) {
    return activeRotationGroup(config)
  }

  candidates(config = this.store.$config.get()) {
    return rotationCandidates(this.store.$weItems.get(), config.hiddenWallpaperIds, this.currentGroup(config))
  }

  async advance(force = false) {
    const config = this.store.$config.get()
    if (!config.rotationEnabled || this.switching) return false
    const group = this.currentGroup(config)
    if (group?.trigger === 'videoEnd' && !force) return false
    const items = this.candidates(config)
    if (items.length < 2) return false
    const currentId = config.weSelection?.id || null
    let next
    if (group?.order === 'random') {
      const pool = items.filter(item => item.id !== currentId)
      next = pool[Math.floor(Math.random() * pool.length)] || null
    } else {
      const index = items.findIndex(item => item.id === currentId)
      next = items[index < 0 ? 0 : (index + 1) % items.length]
    }
    if (!next) return false
    this.switching = true
    try {
      const patch = await resolveWallpaperSelection(next, this.openScene)
      this.controller.changeConfig(patch)
      this.lastId = next.id
      this.lastSwitch = Date.now()
      return true
    } catch {
      // A broken project must not stop the timer. Move the anchor so the same
      // broken entry cannot pin every later tick to itself.
      this.lastSwitch = Date.now()
      return false
    } finally {
      this.switching = false
    }
  }

  async tick() {
    const config = this.store.$config.get()
    const currentId = config.weSelection?.id || null
    const groupId = config.rotationGroupId || ''
    if (currentId !== this.lastId || groupId !== this.lastGroupId) {
      this.lastId = currentId
      this.lastGroupId = groupId
      this.lastSwitch = Date.now()
    }
    if (config.rotationEnabled && !this.lastEnabled) this.lastSwitch = Date.now()
    this.lastEnabled = config.rotationEnabled
    if (!config.rotationEnabled) return
    const group = this.currentGroup(config)
    if (group?.trigger === 'videoEnd') return
    const items = this.candidates(config)
    if (items.length < 2) return
    const interval = Math.max(1, Number(group?.interval) || config.rotationMinutes || 30) * 60000
    if (Date.now() - this.lastSwitch < interval) return
    await this.advance(false)
  }

  destroy() {
    if (this.timer !== null) clearInterval(this.timer)
    this.timer = null
    if (this.backdrop?.onMediaEnd === this.handleVideoEnd) this.backdrop.onMediaEnd = null
  }
}

export function nextRotationGroupId() {
  return `grp-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}
