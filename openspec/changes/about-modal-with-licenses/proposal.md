## Why

The sidebar currently shows a raw version string with no context or attribution. Replacing it with an "About" link surfaces useful information (version, source code, open-source acknowledgements) without cluttering the UI, and satisfies common open-source license requirements to make dependency attribution accessible to end users.

## What Changes

- Replace the `#app-version` text element in the sidebar footer with an "About" button/link
- Clicking "About" opens a modal dialog containing:
  - The current app version (same CalVer string as before)
  - A link to the GitHub repository (`https://github.com/Sigurs/linux-comms`)
  - A scrollable list of all production dependencies with their license type and license text
- A build-time script compiles dependency license data into a static JSON asset bundled with the renderer
- The modal is dismissible via a close button or pressing Escape

## Capabilities

### New Capabilities

- `about-modal`: In-app About modal accessible from the sidebar footer, showing version, GitHub link, and dependency licenses
- `license-compile`: Build-time step that gathers dependency license metadata and outputs a bundled JSON file

### Modified Capabilities

- `app-versioning`: The version display moves from a bare `<span>` to inside the About modal; the sidebar element becomes an interactive trigger instead of a passive display

## Impact

- `src/renderer/index.html` — replace `<span id="app-version">` with an About button
- `src/renderer/index.ts` — remove version-display logic, add modal open/close logic
- `src/renderer/styles.css` — add modal and About button styles
- New build script (e.g. `scripts/compile-licenses.ts`) — runs at build time, writes `src/renderer/licenses.json`
- `package.json` / build config — add license-compile step before esbuild bundling; add a license-scanning dependency (e.g. `license-checker` or `licensee`)
- No IPC or main-process changes required
