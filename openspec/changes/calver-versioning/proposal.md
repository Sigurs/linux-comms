## Why

The app currently has two disconnected version strings:
- `package.json` `version` (`0.1.0`) — used by electron-builder to name the AppImage
- `BUILD_VERSION` in the build scripts (`date -u +%y%m%d-%H%M`) — baked into the renderer as `__APP_VERSION__` and shown in the sidebar footer

These never match, so the AppImage filename and the in-app version display are always inconsistent. There is also no meaningful version identity for release artifacts.

A CalVer-inspired scheme unifies both: `YYMMDD.<incremental build number>` for releases, `YYMMDD.dev` for local development. The same version string is written to `package.json` (for electron-builder) and injected into the renderer (for display).

## What Changes

- A new `scripts/version.mjs` script generates or retrieves the current CalVer string
  - **Dev mode** (`--dev`): returns `YYMMDD.dev` — no state mutation
  - **Release mode** (`--release`): reads `.build-counter.json`, increments the daily counter (resets to `1` on a new date), writes the state back, and returns `YYMMDD.N`
- The `build:renderer` and `build:picker` scripts use the version script instead of the inline `date` command
- The `dist`, `dist:appimage`, and `dist:flatpak` scripts run a pre-build version bump step that writes the CalVer string to `package.json` `version` before electron-builder runs
- `.build-counter.json` is added to `.gitignore` (machine-local build state)

## Capabilities

### New Capabilities

- `app-versioning`: CalVer versioning scheme `YYMMDD.<N>` for releases and `YYMMDD.dev` for local dev; single source of truth shared between `package.json` and the renderer

### Modified Capabilities

_(none — existing `app-versioning` spec covers version display; new capability supersedes the date-stamp approach)_

## Impact

- `scripts/version.mjs` — new script (version generator + state manager)
- `package.json` — updated `build:renderer`, `build:picker`, `dist`, `dist:appimage`, `dist:flatpak` scripts
- `.github/workflows/build.yml` — add a version bump step before the build so CI uses `YYMMDD.N`; pass the generated version to the renderer build; simplify AppImage step to use `npm run dist:appimage`
- `.gitignore` — add `.build-counter.json`
