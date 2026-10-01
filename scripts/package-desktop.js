/** Build a dependency-free installation ZIP from an explicit payload whitelist. */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createHash } from 'node:crypto'
import { deflateRawSync } from 'node:zlib'
import { LICENSE_FILES } from './license-files.js'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const metadata = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'))
if (!/^\d+\.\d+\.\d+(?:-[\w.-]+)?$/.test(metadata.version)) throw new Error('Invalid package version')
const folder = `hermes-skins-v${metadata.version}`
const output = path.join(root, 'dist', `${folder}-windows.zip`)
const files = new Map()
const whitelist = [
  'plugin.js', 'LICENSE', 'patches/hermes-desktop-terminal-alpha.patch',
  'scripts/install-local.js', 'scripts/install-windows.cmd', 'scripts/license-files.js',
  'backend/manifest.json', 'backend/plugin_api.py', 'backend/scene-helper.mjs', 'backend/plugin.yaml', 'backend/__init__.py',
  'third_party/dsh-skins/LICENSE', 'third_party/dsh-skins/NOTICE.md', 'third_party/jpeg-js/LICENSE'
]
function include(source, target = source) {
  const full = path.resolve(root, source)
  const stat = fs.lstatSync(full)
  if (!full.startsWith(root + path.sep) || !stat.isFile() || stat.isSymbolicLink()) throw new Error(`Invalid payload file: ${source}`)
  files.set(target, fs.readFileSync(full))
}
for (const source of whitelist) include(source)
for (const [source] of LICENSE_FILES) include(source)
include('docs/INSTALL.zh.md', 'INSTALL.zh.md')
include('docs/INSTALL.md', 'INSTALL.md')
if (files.get('plugin.js').length > 512 * 1024) throw new Error('Desktop plugin exceeds the host size limit')
files.set('install.cmd', Buffer.from('@echo off\r\ncall "%~dp0scripts\\install-windows.cmd" %*\r\n'))
files.set('package.json', Buffer.from(JSON.stringify({
  name: metadata.name, version: metadata.version, private: true, type: 'module', main: 'plugin.js',
  license: metadata.license, engines: metadata.engines, scripts: { 'install:desktop': 'node scripts/install-local.js' }
}, null, 2) + '\n'))
const digest = bytes => createHash('sha256').update(bytes).digest('hex')
files.set('PACKAGE-MANIFEST.json', Buffer.from(JSON.stringify({
  formatVersion: 1, version: metadata.version, platform: 'Windows', testedHost: '0.21.5+3337',
  files: Object.fromEntries([...files].map(([name, bytes]) => [name, { bytes: bytes.length, sha256: digest(bytes) }]))
}, null, 2) + '\n'))

// ZIP32 with UTF-8 names and deflate, read by Windows Explorer/Expand-Archive.
// Fixed DOS timestamps make archives reproducible for an unchanged payload.
const table = Array.from({ length: 256 }, (_, n) => {
  let crc = n
  for (let i = 0; i < 8; i++) crc = (crc & 1) ? 0xedb88320 ^ (crc >>> 1) : crc >>> 1
  return crc >>> 0
})
function crc32(bytes) {
  let crc = 0xffffffff
  for (const byte of bytes) crc = table[(crc ^ byte) & 255] ^ (crc >>> 8)
  return (crc ^ 0xffffffff) >>> 0
}
const local = [], central = []
let offset = 0
for (const [relative, bytes] of [...files].sort(([a], [b]) => a.localeCompare(b))) {
  const name = Buffer.from(`${folder}/${relative}`)
  const packed = deflateRawSync(bytes, { level: 9 })
  const crc = crc32(bytes)
  const header = Buffer.alloc(30)
  header.writeUInt32LE(0x04034b50, 0); header.writeUInt16LE(20, 4)
  header.writeUInt16LE(0x800, 6); header.writeUInt16LE(8, 8); header.writeUInt16LE(0x21, 12)
  header.writeUInt32LE(crc, 14); header.writeUInt32LE(packed.length, 18); header.writeUInt32LE(bytes.length, 22)
  header.writeUInt16LE(name.length, 26)
  const index = Buffer.alloc(46)
  index.writeUInt32LE(0x02014b50, 0); index.writeUInt16LE(20, 4); index.writeUInt16LE(20, 6)
  index.writeUInt16LE(0x800, 8); index.writeUInt16LE(8, 10); index.writeUInt16LE(0x21, 14)
  index.writeUInt32LE(crc, 16); index.writeUInt32LE(packed.length, 20); index.writeUInt32LE(bytes.length, 24)
  index.writeUInt16LE(name.length, 28); index.writeUInt32LE(offset, 42)
  local.push(header, name, packed); central.push(index, name)
  offset += header.length + name.length + packed.length
}
const directory = Buffer.concat(central)
const end = Buffer.alloc(22)
end.writeUInt32LE(0x06054b50, 0); end.writeUInt16LE(files.size, 8); end.writeUInt16LE(files.size, 10)
end.writeUInt32LE(directory.length, 12); end.writeUInt32LE(offset, 16)
fs.mkdirSync(path.dirname(output), { recursive: true })
const archive = Buffer.concat([...local, directory, end])
fs.writeFileSync(output, archive)
fs.writeFileSync(output + '.sha256', `${digest(archive)}  ${path.basename(output)}\n`)
console.log(`[package] ${output} (${archive.length} bytes, ${files.size} files)`)
console.log(`[package] SHA-256 ${digest(archive)}`)
