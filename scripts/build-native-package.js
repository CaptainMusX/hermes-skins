/** Prebuilt Hermes package consumed by `hermes plugins install owner/repo/plugin`. */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { LICENSE_FILES } from './license-files.js'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const target = path.join(root, 'plugin')
const metadata = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'))
const files = [
  ['plugin.js', 'desktop/plugin.js'],
  ['LICENSE', 'LICENSE'], ['LICENSE', 'desktop/LICENSE'],
  ['third_party/dsh-skins/LICENSE', 'desktop/LICENSE.dsh-skins'],
  ['third_party/dsh-skins/NOTICE.md', 'desktop/NOTICE.dsh-skins.md'],
  ['third_party/jpeg-js/LICENSE', 'desktop/LICENSE.jpeg-js'],
  ['third_party/dsh-skins/LICENSE', 'dashboard/LICENSE.dsh-skins'],
  ['third_party/dsh-skins/NOTICE.md', 'dashboard/NOTICE.dsh-skins.md'],
  ['third_party/jpeg-js/LICENSE', 'dashboard/LICENSE.jpeg-js'],
  ['backend/manifest.json', 'dashboard/manifest.json'],
  ['backend/plugin_api.py', 'dashboard/plugin_api.py'],
  ['backend/scene-helper.mjs', 'dashboard/scene-helper.mjs'],
  ['backend/scene_media.py', 'dashboard/scene_media.py']
]
for (const [source, relative] of files) {
  const file = path.join(target, relative)
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.copyFileSync(path.join(root, source), file)
}
fs.cpSync(path.join(root, 'backend', 'webwallgl'), path.join(target, 'dashboard', 'webwallgl'), { recursive: true })
fs.writeFileSync(path.join(target, 'plugin.yaml'), [
  'name: hermes-skins', `version: "${metadata.version}"`,
  'description: Hermes Wallpaper Engine - Scene/Web/video wallpapers and liquid-glass desktop surfaces.',
  'author: CaptainMusX', 'license: See LICENSING.md', 'kind: standalone',
  'tags: [desktop, wallpaper, glass]', ''
].join('\n'))
fs.writeFileSync(path.join(target, '__init__.py'), '"""Desktop and dashboard surfaces are loaded by Hermes from this package."""\n\ndef register(ctx):\n    """No agent tools or hooks are registered by this appearance plugin."""\n    pass\n')
fs.writeFileSync(path.join(target, '.gitattributes'), '* text eol=lf\n')
for (const [source, name] of LICENSE_FILES) {
  for (const directory of ['', 'desktop', 'dashboard']) {
    fs.copyFileSync(path.join(root, source), path.join(target, directory, name))
  }
}
console.log(`[build] Native Hermes package ready: ${target}`)
