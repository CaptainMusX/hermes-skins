/** Read-only inventory of Wallpaper Engine libraries using the same scanner as the UI. */
import fs from 'node:fs/promises'
import path from 'node:path'
import { scanWallpaperEngine } from '../src/engine/we-library.js'

const bridge = {
  async readDir(dir) {
    const entries = await fs.readdir(dir, { withFileTypes: true })
    return { entries: entries.map(entry => ({
      name: entry.name,
      path: path.join(dir, entry.name),
      isDirectory: entry.isDirectory()
    })) }
  },
  async readFileText(file) {
    return { text: await fs.readFile(file, 'utf8'), truncated: false }
  }
}

const { items, libraries, error } = await scanWallpaperEngine(bridge, process.argv.slice(2))
const counts = Object.fromEntries([...new Set(items.map(item => item.kind))]
  .map(kind => [kind, items.filter(item => item.kind === kind).length]))
console.log(JSON.stringify({ libraries, total: items.length, counts,
  videoPlayable: items.filter(item => item.mediaType === 'video').length,
  staticFallback: items.filter(item => item.staticFallback).length,
  error }, null, 2))
