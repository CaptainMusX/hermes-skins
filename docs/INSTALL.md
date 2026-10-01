# Install on another Windows device

The tested host is Hermes Desktop **0.21.5+3337**. Use Node.js **22+** (Hermes' bundled Node or a system installation). The current local-path and Wallpaper Engine discovery implementation targets Windows; macOS/Linux and mobile platforms are not supported by this distribution.

1. Extract the built ZIP and open its `hermes-skins-v1.3.4` folder.
2. Run `install.cmd`, or run `node scripts/install-local.js` from that folder. No npm dependency installation or build is needed.
3. Run **Reload desktop plugins** in Hermes. Restart the gateway after the first installation of the scene backend.
4. Open **Skin Center** and select your theme and wallpaper.

Set `HERMES_HOME` before installing if you use a custom data directory. The installer validates the payload first and backs up existing files beside them as `.bak-*`.

`--frontend-only` installs themes, glass styling, and basic wallpaper support without the scene backend. `--no-enable` deploys all files but leaves backend activation to the administrator; run `hermes plugins enable hermes-skins` and restart the gateway afterwards.

The archive contains no user settings, accounts, chats, Steam wallpapers, or scene caches. Choose the same built-in skin on the new device, or export the **current Theme Studio form** as JSON and import/save it on the target. This is not a full settings export: copy transparency/blur values manually, copy your own media separately, and update paths. Re-select Wallpaper Engine projects from the target device's own library.

True terminal transparency requires the included optional host-source patch and a compatible Hermes rebuild. The plugin installer does not patch the Hermes executable.

To build from the private source repository (access required):

```sh
npm ci
npm test
npm run package:desktop
```

Archives and SHA-256 files are written to `dist/`. A 404 scene API usually means the backend is not enabled or the gateway needs a restart. Unsupported scenes may fall back to embedded video or a static frame. To roll back, close Hermes, restore the corresponding `.bak-*` files, and reopen it.

The package retains the project MIT license and third-party license notices. The source revision and BSD license for dsh-skins are recorded in `third_party/dsh-skins/NOTICE.md`.
