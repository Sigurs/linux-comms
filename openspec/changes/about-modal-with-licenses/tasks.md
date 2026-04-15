## 1. Build tooling: license compilation

- [x] 1.1 No external license scanner needed — write custom script instead
- [x] 1.2 Write `scripts/compile-licenses.mjs`: walk production deps from package.json, read each package's license field and LICENSE file from node_modules, write `{ name, version, license, licenseText }[]` to `src/renderer/licenses.json`
- [x] 1.3 Add `src/renderer/licenses.json` to `.gitignore`
- [x] 1.4 Prepend `node scripts/compile-licenses.mjs &&` to the `build:renderer` script in `package.json`
- [x] 1.5 Prepend `node scripts/compile-licenses.mjs &&` to the `build:renderer:prod` script in `package.json`
- [x] 1.6 Verify `npm run build:renderer` runs the compile step and produces a valid `src/renderer/licenses.json`

## 2. HTML: replace version span, add About modal

- [x] 2.1 In `src/renderer/index.html`: replace `<span id="app-version"></span>` with `<button id="btn-about" class="about-btn"></button>`
- [x] 2.2 Add the About modal markup to `index.html` (overlay + dialog with version field, GitHub link, license list container, and close button), following the existing modal pattern

## 3. TypeScript: wire About button and modal

- [x] 3.1 In `src/renderer/index.ts`: remove the `#app-version` version-display block and replace with logic that sets the `#btn-about` label to the CalVer string
- [x] 3.2 Add open/close functions for the About modal (show/hide `#about-overlay`)
- [x] 3.3 Wire `#btn-about` click → open About modal
- [x] 3.4 Wire close button click, Escape keydown, and overlay backdrop click → close About modal
- [x] 3.5 On modal open, import `licenses.json` and populate the license list in the DOM (package name, SPDX identifier, collapsible license text via `<details>`/`<summary>`)
- [x] 3.6 Wire GitHub link click to `window.electronAPI.openExternal('https://github.com/Sigurs/linux-comms')` (or equivalent IPC call) instead of a plain anchor
- [x] 3.7 Handle the null-licenseText fallback: render an SPDX link `https://spdx.org/licenses/<id>.html` when `licenseText` is null

## 4. CSS: About button and modal styles

- [x] 4.1 In `src/renderer/styles.css`: replace `#app-version` styles with `.about-btn` styles (same tiny low-opacity appearance, cursor: pointer)
- [x] 4.2 Add styles for `#about-overlay`, `#about-modal`, the license list, and collapsible `<details>` rows, consistent with existing modal styles

## 5. Verification

- [ ] 5.1 Run `npm start` and confirm the sidebar footer shows the version string as a clickable About button
- [ ] 5.2 Click About and confirm the modal shows version, GitHub link, and license list
- [ ] 5.3 Confirm each dismiss path works: close button, Escape, and backdrop click
- [ ] 5.4 Confirm the GitHub link opens the browser (not in-app navigation)
- [ ] 5.5 Run `npm run dist:appimage` (or a prod build) and confirm the About modal reflects the release CalVer

