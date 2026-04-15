## Context

The app currently shows a `<span id="app-version">` in the sidebar footer that displays the CalVer build string. It has a hidden context-menu copy shortcut but is otherwise passive. The project uses esbuild for bundling with a set of `.mjs` build scripts (`scripts/`) that already handle version injection via `--define:__APP_VERSION__`. There is one runtime dependency (`react-beautiful-dnd`) and many dev dependencies. The renderer is plain TypeScript (no React), and there are three existing modal patterns in `index.html` to follow.

## Goals / Non-Goals

**Goals:**
- Replace the version span with an interactive "About" trigger in the sidebar footer
- Show an About modal with version, GitHub link, and dependency licenses
- Compile license metadata at build time (not runtime) so no license-checker code ships to the renderer
- Integrate cleanly into the existing `scripts/` + esbuild pipeline
- Keep the pattern consistent with existing modals (overlay + dialog, Escape to close)

**Non-Goals:**
- Showing license text for devDependencies (build tools, not shipped)
- Fetching licenses from the network at runtime
- Adding a new framework or build system

## Decisions

### 1. License data compiled to a JSON file imported by the renderer

**Decision:** A new `scripts/compile-licenses.mjs` script scans `node_modules` for license metadata and writes `src/renderer/licenses.json`. The renderer imports this JSON (esbuild bundles JSON natively). The script runs as a pre-step in `build:renderer` and `build:renderer:prod`.

**Alternatives considered:**
- `--define` injection: License data can be hundreds of kilobytes; esbuild define is not suited to large objects.
- Runtime fetch of a copied asset: Requires IPC or file protocol handling; unnecessary complexity.
- Shipping `license-checker` in renderer: Means node_modules introspection at runtime inside Electron renderer — wrong layer.

**Chosen because:** JSON import is idiomatic esbuild/TypeScript, zero runtime overhead, and keeps license scanning in the build layer.

### 2. Use `license-checker-rseidelsohn` as the scanning devDependency

**Decision:** Add `license-checker-rseidelsohn` (maintained fork of `license-checker`) as a devDependency. It provides `init()` with `onlyAllow`, `excludePrivatePackages`, `production` flags and returns a flat map of package → `{ licenses, licenseText, repository }`.

**Alternatives considered:**
- `licensee` (Ruby CLI): Wrong ecosystem.
- Manual `node_modules` walk: Fragile, not maintained.
- `license-report`: Good for reports but less ergonomic as a library.

**Chosen because:** Widely used, actively maintained, returns structured data suitable for JSON serialization.

### 3. Only include production dependencies

**Decision:** Pass `production: true` to `license-checker-rseidelsohn` so dev tools (TypeScript, esbuild, ESLint, etc.) are excluded from the About modal. Dev deps are not shipped in the renderer bundle.

### 4. About trigger: small text button styled like `#app-version`

**Decision:** Replace `<span id="app-version">` with `<button id="btn-about">` styled to look identical to the current version span (tiny, low-opacity, text). On click it opens the About modal. This keeps the visual footprint unchanged.

**Alternatives considered:**
- A dedicated icon button (like the add-profile button): Takes more space, changes sidebar layout.
- Keeping the version span and adding a separate "i" icon: Two elements with overlapping concerns.

**Chosen because:** Minimal visual change; the version is still visible (inside the modal), and the footer stays compact.

### 5. Modal follows existing overlay pattern

**Decision:** Add `#about-overlay` + `#about-modal` to `index.html` alongside the existing modals. The license list is a `<dl>` (definition list) inside a scrollable `<div>`. Escape closes it, consistent with the icon picker.

## Risks / Trade-offs

- [License text size] Some packages have lengthy license texts → Mitigation: Truncate displayed license text to a reasonable limit (e.g. 2000 chars) in the UI; full text available on hover or expansion.
- [packages without licenseText] Some packages only expose a license identifier (SPDX), no text → Mitigation: Fall back to displaying the SPDX identifier with a link to `https://spdx.org/licenses/<id>.html`.
- [Build script ordering] `compile-licenses.mjs` must run before esbuild (which bundles the JSON import) → Mitigation: prepend it to `build:renderer` and `build:renderer:prod` in `package.json`.
- [CSP] Current CSP is `default-src 'self'`; the GitHub link and SPDX links open externally via `shell.openExternal` (IPC) or `target="_blank"` in a webview. In the renderer context, links must use `shell.openExternal` via the existing `electronAPI` preload bridge, not direct `<a href>` navigation → Mitigation: wire anchor clicks to the existing open-external IPC.

## Migration Plan

1. Add `license-checker-rseidelsohn` to devDependencies (`npm install --save-dev`).
2. Write `scripts/compile-licenses.mjs`.
3. Update `package.json` build scripts to run `compile-licenses.mjs` before esbuild.
4. Update `src/renderer/index.html`: replace `<span id="app-version">` with `<button id="btn-about">`, add `#about-overlay` modal.
5. Update `src/renderer/index.ts`: wire About button click, modal open/close, link handling.
6. Update `src/renderer/styles.css`: restyle button and modal.
7. Add `src/renderer/licenses.json` to `.gitignore` (it's a build artifact).

Rollback: revert the HTML/TS/CSS changes and remove the compile step from `package.json`. No data migration needed.

## Open Questions

- Should the "About" button display the version number as its label (e.g. `26.416.1`) or just the word "About"? The proposal says "About" as the label, version shown inside the modal.
- Should license text be collapsible per-package, or always shown in full with a scroll container? Recommend collapsible (details/summary) to keep the modal manageable.
