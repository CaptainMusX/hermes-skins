# Licensing scope

The original Hermes Skins code and original geometric SVG presets are licensed under the project MIT license in `LICENSE`. That license does not replace third-party licenses or assert ownership of third-party source.

## Included third-party material

| Material | Evidence and distribution treatment |
| --- | --- |
| dsh-skins `pkg-extract.ts`, `we-shim-source.ts` | Fixed revision `82f42bd3bf91ea88475e59a2753f87041a960a56`. Its root LICENSE is BSD-3-Clause, while its package.json declares Apache-2.0. Both license texts and source provenance are included; both sets of notice requirements are conservatively retained. This does not assert that the upstream author granted a dual-license election. |
| dsh-skins `we-player-source.ts` | Explicit `@license MIT` file header. The header, MIT terms and upstream copyright/attribution notices are retained. |
| jpeg-js 0.4.4 | Package BSD-3-Clause notice (Eugene Ware); decoder Apache-2.0 notice (notmasteryet); encoder BSD notice (Adobe Systems Incorporated) and Andreas Ritter attribution. The backend bundle includes both modules; all applicable notices are included. |
| Hermes host-source patch | MIT notice from Nous Research is retained for the copied patch context. No Hermes executable, React runtime or SDK implementation is redistributed here. |
| esbuild build output helpers | MIT notice from Evan Wallace is retained conservatively for emitted runtime boilerplate. The esbuild executable itself is not redistributed. |
| hermes-skin-studio / Theme Forge | Design reference; its contributor notices and MIT license are included conservatively. No image or video assets from that repository are shipped. |

Original third-party source files are preserved in `third_party/`. Generated JS bundles mechanically remove module imports/exports and transpile/concatenate the corresponding source; their headers identify these transformations. The adaptation modules under `src/engine/` and `scripts/scene-helper-entry.js` belong to this project.

## Upstream ambiguity and limits

The dsh-skins license/package-metadata discrepancy is documented rather than silently resolved. BSD-3-Clause, MIT and Apache-2.0 each allow redistribution subject to their conditions; shipping all the observed notices addresses the known distribution obligations, but is not proof of the upstream author's ownership of every contribution. A definitive resolution of the inconsistent marking requires clarification from the copyright holder.

This project is independent and is not an official or endorsed product of DSH, DeepSeek, Nous Research, Wallpaper Engine or the referenced authors. Names are used to identify compatibility and source provenance.

User-selected Steam Workshop wallpapers, anime art, images, fonts, videos and web-wallpaper projects are not included in the Git repository or packages. Their creators' rights and any applicable software/service agreements remain separate. Installation does not grant rights to redistribute those assets.

This is a source-and-distribution license review, not a guarantee covering every jurisdiction, patent, trademark or a user's chosen media.

## Primary evidence

- [dsh-skins root license at the pinned revision](https://github.com/zhu1090093659/dsh-skins/blob/82f42bd3bf91ea88475e59a2753f87041a960a56/LICENSE)
- [conflicting package metadata at the same revision](https://github.com/zhu1090093659/dsh-skins/blob/82f42bd3bf91ea88475e59a2753f87041a960a56/package.json)
- [explicitly MIT-marked player](https://github.com/zhu1090093659/dsh-skins/blob/82f42bd3bf91ea88475e59a2753f87041a960a56/src/we-player-source.ts)
- [Apache-2.0 distribution terms](https://www.apache.org/licenses/LICENSE-2.0.txt)

Readable notices and complete license texts accompany the repository, native package, installed frontend/backend and offline ZIP.
