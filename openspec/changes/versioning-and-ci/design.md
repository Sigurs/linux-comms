## Context

Linux Comms has no version tracking or CI pipeline. The renderer is bundled with esbuild, and the main process is compiled with tsc. The sidebar footer currently contains only the "Add profile" button. There are no GitHub Actions workflows.

The build scripts in package.json:

- `build:renderer` uses esbuild with `--bundle --platform=browser`
- `build:main` uses `tsc -p tsconfig.main.json`
- `dist:appimage` and `dist:flatpak` use electron-builder

## Goals / Non-Goals

**Goals:**

- Generate YYMMDD-HHMM version string at build time
- Inject version into renderer bundle via esbuild `--define`
- Display version in sidebar footer with very low visual prominence
- GitHub Actions workflow: build on push to main, produce AppImage artifact

**Non-Goals:**

- Semantic versioning or changelogs
- Release management (GitHub Releases, tags)
- Auto-update mechanism
- Publishing to Flatpak repos
- Version display in main process or about dialog

## Decisions

### 1. Version format: YYMMDD-HHMM

**Decision:** Use UTC timestamp formatted as YYMMDD-HHMM (e.g., 260325-1945).

**Rationale:** Unique per-minute, sortable, no manual management. UTC avoids timezone ambiguity in CI.

**Alternative considered:** Git short hash. Rejected because it is not sortable or human-readable as a timeline.

### 2. Version injection: esbuild `--define`

**Decision:** Use esbuild's `--define:__APP_VERSION__="\"260325-1945\""` to inject version as a global constant at bundle time.

**Rationale:** Zero runtime overhead, no extra files to load. The version is baked into the bundle. Works with the existing esbuild setup in package.json.

**Alternative considered:** Write a `version.json` file and fetch it at runtime. Rejected as unnecessarily complex for a static string.

### 3. Version generation: inline shell in npm script

**Decision:** Generate version inline in the build:renderer script using `date -u +%y%m%d-%H%M`.

**Rationale:** No extra build script files needed. Works identically in local dev and CI. The npm script becomes:

```
BUILD_VERSION=$(date -u +%y%m%d-%H%M) && esbuild ... --define:__APP_VERSION__=\"$BUILD_VERSION\"
```

**Alternative considered:** Dedicated Node.js script. Rejected as overkill for a single date command.

### 4. Sidebar display: static HTML element + CSS

**Decision:** Add a `<span id="version">` in the sidebar footer (below the add button). Style with very small, low-opacity text.

**Rationale:** Visible when deliberately looked at, but does not compete with profile entries or add button. CSS: `font-size: 9px; opacity: 0.3`.

### 5. CI: GitHub Actions with ubuntu-latest

**Decision:** Single workflow file `.github/workflows/build.yml` triggered on push to main. Steps: checkout, setup Node 20, npm ci, npm run build, npm run dist:appimage, upload artifact.

**Rationale:** Standard GitHub Actions pattern. AppImage is the simplest distributable. Artifact upload makes builds downloadable from the Actions tab.

## Risks / Trade-offs

**Risk:** Version only reflects build time, not code content

- Mitigation: Acceptable for this use case; git hash can be added later if needed

**Risk:** `date` command format differs across systems

- Mitigation: Using `-u` flag and `+%y%m%d-%H%M` which is POSIX-compatible; CI uses ubuntu-latest

**Risk:** Forgetting to rebuild renderer shows stale version in dev

- Mitigation: Dev workflow already requires `npm run build`; version updates on every build
