/**
 * Install hermes-skins plugin into local Hermes Desktop directory.
 */

import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')
const srcPlugin = path.join(rootDir, 'plugin.js')

if (!fs.existsSync(srcPlugin)) {
  console.error('[install] plugin.js not found. Please run npm run build first.')
  process.exit(1)
}

// Find hermes home directory
const homeDir = os.homedir()
const localAppData = process.env.LOCALAPPDATA || path.join(homeDir, 'AppData', 'Local')
const possibleHomes = [
  process.env.HERMES_HOME,
  path.join(localAppData, 'hermes'),
  path.join(homeDir, '.hermes')
].filter(Boolean)

let targetDir = null
for (const p of possibleHomes) {
  const desktopPlugins = path.join(p, 'desktop-plugins')
  if (fs.existsSync(p)) {
    targetDir = path.join(desktopPlugins, 'hermes-skins')
    break
  }
}

if (!targetDir) {
  targetDir = path.join(localAppData, 'hermes', 'desktop-plugins', 'hermes-skins')
}

fs.mkdirSync(targetDir, { recursive: true })
const destFile = path.join(targetDir, 'plugin.js')
fs.copyFileSync(srcPlugin, destFile)

console.log(`[install] Successfully installed plugin to: ${destFile}`)
console.log(`[install] You can now reload desktop plugins in Hermes Desktop (via ⌘K / Ctrl+K -> "Reload desktop plugins")!`)
