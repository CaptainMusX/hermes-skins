# Hermes Wallpaper Engine

A Wallpaper Engine plugin for Hermes Desktop. Local Scene, Web, video and image wallpapers render behind the app, with editable liquid glass, typography, click/trail effects, 3D parallax and rotation lists.

The entry lives at the bottom of **Settings → Appearance → General**. It does not add a sidebar route, skin gallery, theme studio or theme registration. Pets, mascots and conversation avatars are intentionally excluded; every other user-facing feature of the referenced DSH wallpaper plugin has a Hermes counterpart.

## Features

- **Wallpaper library**: Steam library discovery, Wallpaper Engine Scene/Web/video/Picture projects, local image/video import, URL import, Bing daily image, search, type/rating/orientation filters, hide/restore and card layout.
- **Wallpaper properties**: author-declared `general.properties` controls for Scene/Web projects, with per-wallpaper override storage and live WebWallGL updates.
- **Scene / Web**: WebWallGL 3.0.1 live rendering, pointer forwarding, sandboxed Web projects, signed loopback media origin with HTTP Range streaming.
- **Video / Picture**: direct local video playback, volume and speed controls, Picture-slide crossfades and an optional global slide interval override.
- **Switching**: cut, crossfade, push, wipe, iris, zoom and bars, with direction and speed.
- **Rotation groups**: named lists, per-list wallpaper selection, interval, sequence/random order, interval or video-end trigger, and per-list enable state.
- **Liquid glass**: transparency, bubble fill, composer and surface frost, saturation, edge strength, top highlight, light/dark glass colours, glass fidelity, titlebar and sidebar controls.
- **Typography**: named font sets with import/export, system-font scan, global family, role-level size/weight/family, component-level fonts, text colour roles, UI colours and an independent caret colour.
- **Theme follow**: samples the current preview and publishes a restrained Hermes accent colour.
- **Click / trail FX**: ripple, spark, both, comet, dust, rainbow/custom colours, blend modes and opacity.
- **3D parallax**: background plus optional chat, composer, sidebar, user-bubble and discovered plugin-surface depth.
- **Playback and power**: 15/30/60fps scene cap, auto quality, render DPR, video texture scale, restore wait, focus/hidden/battery pause.
- **System**: live scene-media health, font cache count, upload/scene-cache sizes, recent log tail, scene-cache cleanup, full-preset import/export and about/upstream/licence pages.
- **Now Playing**: best-effort Windows GSMTC integration feeds current media metadata to the WebWallGL media source.

## Usage

1. Open **Settings → Appearance → General**.
2. Click **Open Wallpaper Engine** at the bottom.
3. Pick a wallpaper in **Library**, or add files/URL/Bing images.
4. Enable the wallpaper. Scene/Web projects require the plugin backend and a gateway restart after the first install.

## Install

```sh
hermes plugins install CaptainMusX/hermes-skins/plugin --enable
```

Or use **Skills & Tools → Plugins → Git install** with `CaptainMusX/hermes-skins/plugin`. Reopen Hermes and restart the gateway when the scene media service needs mounting.

## Development

```sh
npm install
npm run build
npm test
npm run install:desktop
npm run package:desktop
```

`npm run install:desktop` backs up the previous desktop bundle, installs the backend/WebWallGL assets and enables the plugin through Hermes' plugin manager.

## Architecture

- `scripts/build.js` builds one standalone desktop ESM bundle and keeps internal module helpers inside scoped IIFEs.
- `src/engine/backdrop-manager.js` owns dual wallpaper layers, transition geometry, media filters, pointer forwarding, power pauses and the first-frame watchdog.
- `src/engine/{glass,font,fx-overlay,parallax,theme-follow}-controller.js` own their respective CSS/canvas/pointer layers and clean themselves up on disable.
- `src/engine/rotation-controller.js` advances within user-defined groups and listens for video-end events when requested.
- `backend/scene_media.py` runs a signed media origin on a random loopback port with Range support.
- `backend/webwallgl/` contains the WebWallGL renderer page and engine assets.
- `backend/plugin_api.py` exposes scene extraction/health, system fonts, upload/URL/Bing import, diagnostics/cache cleanup and Now Playing.

## DSHWE parity

The wallpaper/rendering model follows [dsh-wallpaper-engine](https://github.com/elysia395/dsh-wallpaper-engine) 1.4.2 (`fd3e01f`). Hermes parity covers the non-pet surface: library, transitions, rotation groups, glass, typography/font sets, FX, 3D parallax, audio/media integration, advanced diagnostics and about/licences. Pets, mascots, avatars, pet-link and skin-gallery/theme-studio concepts are not implemented.

See [DSHWE parity ledger](docs/DSHWE-PARITY.zh.md) for the module-by-module record.

## License

WebWallGL 3.0.1, the dsh-wallpaper-engine renderer adaptation and the legacy dsh-skins parser retain their original MIT/BSD/Apache notices and provenance. See [LICENSING.md](LICENSING.md), [THIRD-PARTY-NOTICES.md](THIRD-PARTY-NOTICES.md) and `third_party/`.

Workshop wallpaper media is not redistributed. Use only assets you own or are licensed to use.
