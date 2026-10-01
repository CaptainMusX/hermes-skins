import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { build } from 'esbuild'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
await build({
  entryPoints: [path.join(root, 'scripts', 'scene-helper-entry.js')],
  outfile: path.join(root, 'backend', 'scene-helper.mjs'),
  bundle: true,
  platform: 'node',
  target: 'node22',
  format: 'esm',
  legalComments: 'inline',
  banner: { js: `/*! Generated Hermes scene helper. Third-party portions: dsh-skins (82f42bd3), jpeg-js 0.4.4 and esbuild wrappers. Copyright 2026 zhu1090093659 / historical dsh-external contributors; 2014 Eugene Ware; 2011 notmasteryet; 2008 Adobe Systems Incorporated; 2020 Evan Wallace. Transformation: TypeScript transpilation, mechanical bundling and module-wrapper generation. Complete notices and license texts accompany this file; see THIRD-PARTY-NOTICES.md and LICENSING.md. */` }
})
console.log('[build] Scene helper compiled')
