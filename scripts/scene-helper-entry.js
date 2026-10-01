import fs from 'node:fs'
import path from 'node:path'
import { createHash } from 'node:crypto'
import { buildSceneManifest, extractSceneMainImage, extractSceneResource, extractSceneVideo } from '../third_party/dsh-skins/pkg-extract.ts'

const [command, pkgPath, projectPath, cacheDir] = process.argv.slice(2)
const RESOURCE_PREFIX = '/api/skin-center/we/scene-resource/local/'

function collectUrls(value, found = new Set()) {
  if (typeof value === 'string' && value.startsWith(RESOURCE_PREFIX)) found.add(value)
  else if (Array.isArray(value)) value.forEach(item => collectUrls(item, found))
  else if (value && typeof value === 'object') Object.values(value).forEach(item => collectUrls(item, found))
  return found
}

function extension(bytes) {
  if (bytes.length > 8 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return '.png'
  if (bytes.length > 12 && bytes[4] === 0x66 && bytes[5] === 0x74 && bytes[6] === 0x79 && bytes[7] === 0x70) return '.mp4'
  return null
}

function main() {
  if (!['probe', 'prepare'].includes(command) || !pkgPath || !projectPath || (command === 'prepare' && !cacheDir)) {
    throw new Error('usage: scene-helper <probe|prepare> <scene.pkg> <project.json> [cache-dir]')
  }
  const stat = fs.statSync(pkgPath)
  if (!stat.isFile() || stat.size > 512 * 1024 * 1024) throw new Error('scene package is unavailable or exceeds 512 MiB')
  const pkg = new Uint8Array(fs.readFileSync(pkgPath))
  const project = JSON.parse(fs.readFileSync(projectPath, 'utf8'))
  let manifest = null
  let frame = null
  let video = null
  const errors = []
  try { manifest = buildSceneManifest(pkg, 'local', project) } catch (error) { errors.push(`manifest: ${error.message}`) }
  try { frame = extractSceneMainImage(pkg) } catch (error) { errors.push(`frame: ${error.message}`) }
  if (!manifest?.layers?.length && !manifest?.models?.length) {
    try { video = extractSceneVideo(pkg) } catch (error) { errors.push(`video: ${error.message}`) }
  }
  const probe = { manifest: Boolean(manifest?.layers?.length || manifest?.models?.length),
    frame: Boolean(frame), video: Boolean(video), scripted: Boolean(manifest?.scripted), errors }
  if (command === 'probe') { process.stdout.write(JSON.stringify(probe)); return }
  fs.mkdirSync(cacheDir, { recursive: true })
  const resources = {}
  const missing = []
  if (manifest) {
    for (const url of collectUrls(manifest)) {
      const subpath = url.slice(RESOURCE_PREFIX.length).split('/').map(decodeURIComponent).join('/')
      try {
        const bytes = extractSceneResource(pkg, subpath)
        const ext = bytes && extension(bytes)
        if (!bytes || !ext) { missing.push(subpath); continue }
        const name = createHash('sha256').update(subpath).digest('hex').slice(0, 24) + ext
        const target = path.join(cacheDir, name)
        fs.writeFileSync(target, bytes)
        resources[url] = target
      } catch (error) { missing.push(`${subpath}: ${error.message}`) }
    }
  }
  let framePath = null
  if (frame) {
    framePath = path.join(cacheDir, 'scene-frame.png')
    fs.writeFileSync(framePath, frame.png)
  }
  let videoPath = null
  if (video) {
    videoPath = path.join(cacheDir, 'scene-video.mp4')
    fs.writeFileSync(videoPath, video)
  }
  const result = { ...probe, manifest, resources, missing, framePath, videoPath,
    scenePath: pkgPath, projectPath }
  const temp = path.join(cacheDir, `manifest.json.tmp-${process.pid}`)
  fs.writeFileSync(temp, JSON.stringify(result), 'utf8')
  fs.renameSync(temp, path.join(cacheDir, 'manifest.json'))
  process.stdout.write(JSON.stringify({ ...probe, resourceCount: Object.keys(resources).length,
    missingCount: missing.length, framePath, videoPath, manifestPath: path.join(cacheDir, 'manifest.json') }))
}

try { main() } catch (error) {
  process.stderr.write(String(error?.stack || error))
  process.exitCode = 1
}
