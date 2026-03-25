## 1. Version Injection

- [x] 1.1 Update `build:renderer` script in `package.json` to generate YYMMDD-HHMM version and pass via esbuild `--define:__APP_VERSION__`
- [x] 1.2 Update `build:picker` script similarly for consistency
- [x] 1.3 Declare `__APP_VERSION__` global constant in renderer code (TypeScript declaration)

## 2. Sidebar Version Display

- [x] 2.1 Add `<span id="app-version"></span>` element to sidebar footer in `src/renderer/index.html`
- [x] 2.2 Add CSS for `#app-version` in `src/renderer/styles.css` (font-size: 9px, opacity: 0.3, centered)
- [x] 2.3 Set version text from `__APP_VERSION__` constant in `src/renderer/index.ts` on init

## 3. GitHub Actions Workflow

- [x] 3.1 Create `.github/workflows/build.yml` with trigger on push to main
- [x] 3.2 Add steps: checkout, setup Node 20, npm ci, npm run build, npm run dist:appimage, npm run dist:flatpak
- [x] 3.3 Add Flatpak SDK dependencies (flatpak, flatpak-builder)
- [x] 3.4 Add upload-artifact steps for AppImage and Flatpak output

## 4. Verification

- [x] 4.1 Run local build and verify version appears in sidebar
- [x] 4.2 Verify build succeeds with `npm run build`
