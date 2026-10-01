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
const args = new Set(process.argv.slice(2))
if (args.has('--help')) {
  console.log('Usage: node scripts/install-local.js [--frontend-only] [--no-enable]')
  console.log('Set HERMES_HOME to choose a Hermes data directory explicitly.')
  process.exit(0)
}
for (const arg of args) {
  if (!['--frontend-only', '--no-enable'].includes(arg)) throw new Error(`Unknown option: ${arg}`)
}
const frontendOnly = args.has('--frontend-only')
const noEnable = args.has('--no-enable')
const frontendNotices = [
  ['LICENSE', 'LICENSE'],
  ['third_party/dsh-skins/LICENSE', 'LICENSE.dsh-skins'],
  ['third_party/dsh-skins/NOTICE.md', 'NOTICE.dsh-skins.md'],
  ['third_party/jpeg-js/LICENSE', 'LICENSE.jpeg-js']
]
// Validate the whole payload before touching an existing installation.
const required = ['plugin.js', ...frontendNotices.map(([source]) => source)]
if (!frontendOnly) required.push(...['manifest.json', 'plugin_api.py', 'scene-helper.mjs', 'plugin.yaml', '__init__.py'].map(name => `backend/${name}`))
for (const relative of required) {
  if (!fs.existsSync(path.join(rootDir, relative)) || !fs.statSync(path.join(rootDir, relative)).isFile()) {
    throw new Error(`Incomplete installation package: ${relative}`)
  }
}
const source = fs.readFileSync(srcPlugin)
if (source.length > 512 * 1024) throw new Error('Hermes Desktop plugin.js must be no larger than 512 KiB')

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
if (process.env.HERMES_HOME) {
  if (!path.isAbsolute(process.env.HERMES_HOME)) throw new Error('HERMES_HOME must be an absolute path')
  targetDir = path.join(path.resolve(process.env.HERMES_HOME), 'desktop-plugins', 'hermes-skins')
}
for (const p of possibleHomes) {
  if (targetDir) break
  const desktopPlugins = path.join(p, 'desktop-plugins')
  if (fs.existsSync(p)) {
    targetDir = path.join(desktopPlugins, 'hermes-skins')
    break
  }
}

if (!targetDir) {
  targetDir = path.join(localAppData, 'hermes', 'desktop-plugins', 'hermes-skins')
}

if (fs.existsSync(targetDir) && fs.lstatSync(targetDir).isSymbolicLink()) throw new Error(`Refusing plugin symlink: ${targetDir}`)
fs.mkdirSync(targetDir, { recursive: true })
const destFile = path.join(targetDir, 'plugin.js')
if (fs.existsSync(destFile) && fs.lstatSync(destFile).isSymbolicLink()) throw new Error(`Refusing file symlink: ${destFile}`)
let backupFile = null
if (fs.existsSync(destFile)) {
  const stamp = new Date().toISOString().replace(/[:.]/g, '-')
  backupFile = path.join(targetDir, `plugin.js.bak-${stamp}`)
  fs.copyFileSync(destFile, backupFile, fs.constants.COPYFILE_EXCL)
}
const tempFile = path.join(targetDir, `plugin.js.tmp-${process.pid}`)
try {
  fs.writeFileSync(tempFile, source, { flag: 'wx' })
  fs.renameSync(tempFile, destFile)
} finally {
  if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile)
}

console.log(`[install] Successfully installed plugin to: ${destFile}`)
if (backupFile) console.log(`[install] Previous plugin backed up to: ${backupFile}`)

const backupStamp = new Date().toISOString().replace(/[:.]/g, '-')
function copyWithBackup(sourceFile, targetFile) {
  if (fs.existsSync(targetFile)) {
    if (fs.lstatSync(targetFile).isSymbolicLink()) throw new Error(`Refusing file symlink: ${targetFile}`)
    fs.copyFileSync(targetFile, `${targetFile}.bak-${backupStamp}`, fs.constants.COPYFILE_EXCL)
  }
  fs.copyFileSync(sourceFile, targetFile)
}
for (const [relative, name] of frontendNotices) copyWithBackup(path.join(rootDir, relative), path.join(targetDir, name))
if (frontendOnly) {
  console.log('[install] Frontend-only installation complete. Reload desktop plugins; scene extraction backend was not installed.')
  process.exit(0)
}

// The scene renderer needs an agent backend for bounded PKG extraction. Keep
// the desktop file and backend together; no Steam files are written.
const hermesHome = path.dirname(path.dirname(targetDir))
const pluginRoot = path.join(hermesHome, 'plugins', 'hermes-skins')
const backendDir = path.join(pluginRoot, 'dashboard')
if (fs.existsSync(backendDir) && fs.lstatSync(backendDir).isSymbolicLink()) {
  throw new Error(`Refusing to install through a symbolic-link backend directory: ${backendDir}`)
}
fs.mkdirSync(backendDir, { recursive: true })
for (const name of ['manifest.json', 'plugin_api.py', 'scene-helper.mjs']) {
  const sourceFile = path.join(rootDir, 'backend', name)
  if (!fs.existsSync(sourceFile)) throw new Error(`Missing built backend file: ${sourceFile}`)
  copyWithBackup(sourceFile, path.join(backendDir, name))
}
for (const name of ['LICENSE', 'NOTICE.md']) {
  copyWithBackup(path.join(rootDir, 'third_party', 'dsh-skins', name), path.join(backendDir, name))
}
copyWithBackup(path.join(rootDir, 'third_party/jpeg-js/LICENSE'), path.join(backendDir, 'LICENSE.jpeg-js'))
// plugin.yaml + __init__.py make the plugin a first-class PluginManager
// package, so the enable below goes through the official PM admission
// transaction. A raw config.yaml edit alone is not durable: host config
// writers normalize the file and a hand-added allow-list entry can be
// dropped, which surfaces as 404 "Plugin not found" after a restart.
copyWithBackup(path.join(rootDir, 'backend', 'plugin.yaml'), path.join(pluginRoot, 'plugin.yaml'))
copyWithBackup(path.join(rootDir, 'backend', '__init__.py'), path.join(pluginRoot, '__init__.py'))
copyWithBackup(path.join(rootDir, 'LICENSE'), path.join(pluginRoot, 'LICENSE'))
console.log(`[install] Scene backend installed to: ${backendDir}`)
if (noEnable) {
  console.log('[install] Activation skipped. Run hermes plugins enable hermes-skins, then reload desktop plugins and restart the gateway.')
  process.exit(0)
}

// Enable through the official plugin machinery. The CLI reads the current
// selection and commits through the PM transaction, so the entry survives
// host config rewrites; the raw config.yaml edit is only a fallback for
// installs where the hermes CLI is unavailable.
async function enableThroughRegistry(hermesHome) {
  const { spawnSync } = await import('node:child_process')
  const candidates = [
    process.env.HERMES_CLI,
    path.join(hermesHome, 'bin', 'hermes.exe'),
    path.join(hermesHome, 'bin', 'hermes'),
    'hermes'
  ].filter(Boolean)
  for (const cli of candidates) {
    let run
    try {
      run = spawnSync(cli, ['plugins', 'enable', 'hermes-skins'], {
        encoding: 'utf8', timeout: 120000, windowsHide: true
      })
    } catch { continue }
    if (run.status === 0) {
      console.log(`[install] Plugin enabled through the official plugin registry (${cli}).`)
      return true
    }
  }
  return false
}

async function ensureAllowlistFallback(hermesHome) {
  const configFile = path.join(hermesHome, 'config.yaml')
  if (!fs.existsSync(configFile)) return
  const original = fs.readFileSync(configFile, 'utf8')
  if (/^    - hermes-skins\s*$/m.test(original)) return
  if (!/^plugins:\s*\r?\n  enabled: \[\]\s*$/m.test(original)) {
    throw new Error(`Plugin allow-list has an unfamiliar shape; backend files are ready, but ${configFile} was not changed`)
  }
  const stamp = new Date().toISOString().replace(/[:.]/g, '-')
  const configBackup = `${configFile}.bak-hermes-skins-${stamp}`
  fs.copyFileSync(configFile, configBackup, fs.constants.COPYFILE_EXCL)
  const changed = original.replace(/(^plugins:\s*\r?\n  enabled: )\[\]/m, '$1\n    - hermes-skins')
  const temp = `${configFile}.tmp-hermes-skins-${process.pid}`
  try {
    fs.writeFileSync(temp, changed, { flag: 'wx' })
    fs.renameSync(temp, configFile)
  } finally {
    if (fs.existsSync(temp)) fs.unlinkSync(temp)
  }
  console.log(`[install] Plugin allow-list updated; original config backed up to: ${configBackup}`)
}

if (!(await enableThroughRegistry(hermesHome))) {
  console.warn('[install] Official CLI enable unavailable; falling back to a direct config.yaml edit.')
  await ensureAllowlistFallback(hermesHome)
}
console.log('[install] Reload desktop plugins and restart the Hermes gateway to mount scene API routes.')
