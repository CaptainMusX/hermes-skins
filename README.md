# Hermes Skins

A desktop plugin for Hermes with six built-in themes, a small custom-theme studio, and a Wallpaper Engine library browser.

## How it works

- Themes are registered through Hermes' `THEMES_AREA`. Hermes remains the authority for the selected theme and light/dark mode.
- Try On uses `useTheme().previewTheme`; Exit clears that preview without changing the saved Hermes theme. Apply uses `setTheme` and remembers the prior Hermes theme for Restore.
- Imported or manually selected wallpapers work with any Hermes theme. Interface Transparency (`panelGlass`, 0-100%, endpoints honored) drives panels, title bars, sidebars, and the status bar; Surface Frost Blur (`surfaceFrost`) controls their background blur. Each pane is painted once by its outer content body; nested chat, sidebar, and file views do not stack another material layer. The terminal needs the optional Hermes host patch for a translucent xterm canvas.
- Context usage panels, menus, select lists, dialogs, and tooltips share a translucent material. Floating surfaces retain at least 70% fill for readability, follow the interface transparency lever, and honor the same blur setting (0px disables it). Necessary sibling-content masks and chart category colors retain their own paint.
- While the plugin is enabled, every Hermes range slider uses the theme accent for the selected range and a neutral track for the remainder, including when wallpaper is off. Keyboard focus, disabled controls, and RTL are supported.
- The plugin removes its backdrop, style element, and any active preview when unloaded or reloaded.
- New installations keep the current Hermes theme and wallpaper off, and improve global range sliders. Existing settings are kept as-is across upgrades — every percent parameter spans the full 0-100 range and stored values are never rewritten.

## Install (recommended)

```sh
hermes plugins install CaptainMusX/hermes-skins/plugin --enable
```

Or use **Capabilities → Plugins → Install from Git**, enter `CaptainMusX/hermes-skins/plugin`, and install/enable both components. This prebuilt native package needs no npm build, manual copying, or custom installer. Reopen Hermes after first install and restart the gateway for scene support. Updates use `hermes plugins update hermes-skins`. Private repositories require access credentials.

See [installation and migration](docs/INSTALL.md). The package is not yet listed in the public discovery catalog; the embedded wallpaper player needs further work to satisfy catalog desktop-script lint.

## Development and offline fallback

```sh
npm run build
npm test
npm run install:desktop
```

The installer backs up an existing `plugin.js` beside the deployed file, replaces it atomically, deploys the scene backend, and registers the plugin through `hermes plugins enable hermes-skins` (falling back to a direct allow-list edit when the CLI is unavailable). If Hermes is open, its plugin watcher should reload the file. You can also run **Reload desktop plugins** from the command palette. The first install while the gateway is already running needs one gateway restart to mount the scene API; later restarts need nothing. If the scene API reports 404 "Plugin not found", re-run the install script to restore the registration.

The plugin appears in the sidebar as **Skin Center**; the command palette opens the gallery and toggles the wallpaper. The status bar carries no skin entry.

## Distribution

`npm run package:desktop` writes a ready-to-install Windows ZIP and SHA-256 file under `dist/`. It contains the prebuilt frontend, scene backend, installer, and license notices. The tested host is Hermes Desktop 0.21.5+3337; Node.js 22+ is required. Extract and run `install.cmd` on the target device, without installing build dependencies. The repository also retains build outputs, so a downloaded source ZIP can be installed directly with `node scripts/install-local.js`.

See [installation and migration](docs/INSTALL.md) or [中文指南](docs/INSTALL.zh.md). Personal settings, screenshots, chats, and Steam wallpapers are excluded. Re-select local media and Wallpaper Engine projects on the target device. `HERMES_HOME` selects a custom data directory; `--frontend-only` and `--no-enable` support partial/manual deployment.

## Wallpaper sources

Open **Wallpaper & Glass** to browse the local Wallpaper Engine library. The plugin scans Steam libraries and the installed Wallpaper Engine projects, reads each `project.json`, and shows project thumbnails, search, type filters, and a Use button. You can also choose a library/project folder manually.

Wallpaper Engine projects use these paths:

- **Video** projects stream through Hermes' local `hermes-media://stream` protocol into a `<video>` element.
- **Scene** projects are unpacked by a bundled backend (`backend/scene-helper.mjs`, PKG/TEX/MDL parsing) into a cached manifest, then rendered live by a vendored WebGL player inside an isolated iframe — 2D layer shaders, 3D scenes, particles, and embedded videos. If a scene has no renderable layers, its embedded video plays instead, and a decoded full-resolution frame is the last fallback.
- **Web** projects are inlined — scripts, styles, and assets — into a sandboxed iframe with a Wallpaper Engine API shim. Pages that depend on unsupported CEF APIs may render differently.

Scene preparation requires the plugin backend: `npm run install:desktop` deploys it next to the desktop plugin. Hermes must reload its local backend for newly installed API routes; this machine already has the scene route mounted. If that route is unavailable, the UI reports the failure. The selection is a reference to the existing library file, not a copied project; removing a Steam subscription can remove that file.

You can still enter an `http(s)` URL, `file:///` URL, or absolute Windows path. The selected source, mask, blur, and panel transparency persist in plugin settings. Local images use Hermes' file-data bridge if direct file loading fails. An invalid or blocked source removes the plugin's translucent overlay so Hermes remains readable.

## Custom themes

The studio saves a theme to this plugin's local storage, registers it immediately, and restores its registration on the next plugin load. Export writes the current colors as JSON; import reads an exported file back into the form, where saving registers it as a custom skin.

## Development

`src/` contains the source. `npm run build` regenerates the single-file `plugin.js` used by Hermes plus the scene helper bundle. `npm test` covers configuration migration, media-source validation, Wallpaper Engine discovery, scene manifest resource rewriting, web wallpaper inlining, preview/application/restore, external theme switches, and teardown. `npm run audit:wallpaper-engine` prints a read-only inventory of the current machine's libraries.

The scene parser, WebGL player, and Web Wallpaper shim are vendored from [dsh-skins](https://github.com/zhu1090093659/dsh-skins); their license and revision are recorded in [third_party/dsh-skins/NOTICE.md](third_party/dsh-skins/NOTICE.md). The design was also informed by [hermes-skin-studio](https://github.com/weiweiplus0527/hermes-skin-studio).
