## Why

The GitHub Actions CI workflow currently uploads the built AppImage as a zipped workflow artifact. These are ephemeral, hard to find, and require downloading a zip to get the AppImage. GitHub Releases are the standard distribution mechanism: they are permanent, browsable, and allow direct AppImage download without unzipping.

electron-builder already supports publishing directly to GitHub Releases via its built-in GitHub publisher. The `GH_TOKEN` is already present in the workflow — the only missing pieces are the `publish` provider configuration and the `--publish always` flag.

## What Changes

- Add a `publish` section to the `build` config in `package.json` declaring GitHub as the release provider
- Add `--publish always` to the electron-builder command in `.github/workflows/build.yml`
- Add `contents: write` permission to the CI job (required to create GitHub Releases)
- Remove the `upload-artifact` step (superseded by the GitHub Release)

## Capabilities

### New Capabilities

_(none)_

### Modified Capabilities

- `ci-pipeline`: CI now publishes the AppImage to a GitHub Release instead of uploading a workflow artifact

## Impact

- `package.json` — add `publish` block to `build` config
- `.github/workflows/build.yml` — add job permissions, add `--publish always`, remove `upload-artifact` step
