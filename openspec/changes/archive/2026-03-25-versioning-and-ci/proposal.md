## Why

The project has no automated builds or version tracking. Users and developers cannot identify which build they are running, making bug reports and troubleshooting difficult. A timestamp-based version (YYMMDD-HHMM) provides unique, sortable identifiers without manual version bumps. Automated CI builds on push ensure every commit produces a distributable artifact.

## What Changes

- Generate build version string in YYMMDD-HHMM format at build time
- Display version at the bottom of the sidebar in a muted, unobtrusive style
- Add GitHub Actions workflow that builds on push to main
- Produce AppImage artifacts from CI
- Inject version via esbuild define so it is available to renderer code

## Capabilities

### New Capabilities

- `app-versioning`: Build-time version generation and sidebar display
- `ci-pipeline`: GitHub Actions workflow for automated builds on push

### Modified Capabilities

- `app-shell`: Add version display element to sidebar footer

## Impact

- **Build scripts**: Add version generation to esbuild define
- **Renderer HTML**: Add version element to sidebar footer
- **Renderer CSS**: Add muted version text style
- **GitHub**: New `.github/workflows/build.yml`
- **package.json**: Update build scripts to pass version define
