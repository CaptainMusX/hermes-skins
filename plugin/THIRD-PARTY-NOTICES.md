# Third-party notices

## dsh-skins

Source: https://github.com/zhu1090093659/dsh-skins
Revision: 82f42bd3bf91ea88475e59a2753f87041a960a56
Copyright (c) 2026, zhu1090093659. All rights reserved.
Historical upstream notice: Copyright (c) 2026, dsh-external contributors.
Original source retains its `@linxin666/dsh-client-ui-skin-center` module identifiers.

The three vendored source files derive from this revision with local modifications documented in third_party/dsh-skins/NOTICE.md (2026-10-04): cursor/X-ray and shake support, ripple removal, bounded scheduling, texture/video reuse and resource lifecycle controls. Root LICENSE: BSD-3-Clause; package.json: Apache-2.0; player file header: MIT. This discrepancy is documented in LICENSING.md. No upstream endorsement is implied.

Changes in distributed generated bundles: internal imports/exports are removed for the desktop single-file format; TypeScript is transpiled and bundled for the scene helper. The bundles include the vendor modifications above and additional Hermes bridge/lifecycle adapters.

## dsh-wallpaper-engine

Source: https://github.com/elysia395/dsh-wallpaper-engine
Revision: fd3e01fd11cd5ad83f46940ab4d61d971cfbcf91
Copyright (c) 2026 elysia395 — MIT.

The WebWallGL renderer page, layer/pointer/pause lifecycle, rotation-group model,
font-set/role model, FX and parallax algorithms, and the seven-tab settings
information architecture were adapted for Hermes' host APIs and DOM. Mascots,
avatars and pet-link are intentionally excluded. No upstream endorsement is
implied.

## WebWallGL 3.0.1

Source: https://github.com/oneincase/webwallgl
Copyright (c) 2026 oneincase <462534624@qq.com> — MIT.

`webwallgl.global.min.js` is shipped unmodified as a self-contained classic
script exposing `globalThis.WebWallGL`; it inlines its `mediabunny`
dependency. Wallpaper Engine workshop assets are not redistributed.

## jpeg-js 0.4.4

Copyright (c) 2014, Eugene Ware. All rights reserved.
Decoder: Copyright 2011 notmasteryet — Apache License, Version 2.0.
Encoder: Copyright (c) 2008, Adobe Systems Incorporated. All rights reserved.
JPEG encoder ported to JavaScript and optimized by Andreas Ritter, www.bytestrom.eu, 11/2009.

The source package exports both encoder and decoder. The generated helper contains both; full notices are retained in NOTICE.jpeg-js.md and the accompanying license files. Transformation: bundling and module-wrapper generation, without changing the codec logic.

## Hermes

Copyright (c) 2025 Nous Research — MIT.
Source: https://github.com/NousResearch/hermes-agent
Applicable to source context included in the optional terminal transparency patch.

## esbuild

Copyright (c) 2020 Evan Wallace — MIT.
Applicable conservatively to emitted bundle-wrapper helpers. esbuild is a build dependency, not a shipped executable.

## Design reference: hermes-skin-studio / Theme Forge

Copyright (c) 2026 Theme Forge contributors.
Copyright (c) 2026 Skin Studio contributors — MIT.
Source: https://github.com/weiweiplus0527/hermes-skin-studio
Design reference; no third-party wallpaper media is included.

## Host-provided interfaces

React and @hermes/plugin-sdk are imported from the installed Hermes host. Their implementations are not copied into this distribution.

No notice here overrides a source license or implies the respective authors endorse this project.
