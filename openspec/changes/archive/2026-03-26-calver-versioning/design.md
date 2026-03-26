## Context

`electron-builder` reads the `version` field from `package.json` to name output artifacts and enforces valid semver. The renderer build uses an esbuild `--define` flag to inject `__APP_VERSION__` at compile time. Both sources must agree on the same version string, and that string must be valid semver for electron-builder to accept it.

The CalVer format is `YY.MMDD.N` (semver `MAJOR.MINOR.PATCH`) where:
- `YY` = last two digits of the UTC year (e.g. `26`)
- `MMDD` = `month * 100 + day` with no leading zeros (e.g. March 26 → `326`, January 5 → `105`, December 31 → `1231`) — this ensures no leading zeros and is always unambiguous
- `N` = 1-based daily build counter, increments per release build, resets on a new UTC date

Dev builds use `YY.MMDD.dev` for display (e.g. `26.326.dev`) — same structure as release, making the in-app version consistent in format. `package.json` is not modified during dev builds.

## Goals / Non-Goals

**Goals:**
- Single version source used by both `package.json` (AppImage name) and the renderer display
- Release builds auto-increment the daily counter; dev builds never mutate state
- The counter file is machine-local and gitignored
- CI supports multiple builds per day via a date-keyed Actions cache for the counter file
- Semver compliance so electron-builder accepts the version

**Non-Goals:**
- Git tagging or release management
- Monotonically increasing version across days (CalVer resets daily by design)

## Decisions

**`scripts/version.mjs` owns all version logic**

The script is invoked with one of four flags:
- `--dev`: prints `YY.MMDD.dev`. No side effects.
- `--release`: reads `.build-counter.json` (defaults to `{ date: "", count: 0 }` if missing), compares stored date to today's UTC date, increments or resets count, writes file back, prints `YY.MMDD.N`.
- `--bump`: same as `--release` but also writes the semver into `package.json` `version` field.
- `--current`: reads and prints the current `package.json` version. No side effects. Used by `build:renderer:prod` / `build:picker:prod` after a `--bump` has already run.

**Separate `build:renderer:prod` and `build:renderer` scripts**

`build:renderer` (used by `npm start` / `npm run build`) injects `YY.MMDD.dev` via `--dev`. `build:renderer:prod` (used by dist scripts) injects the already-bumped `package.json` version via `--current`. This avoids double-incrementing the counter and keeps local dev builds fast.

Dist scripts: `node scripts/version.mjs --bump && npm run build:main && npm run build:renderer:prod && npm run build:picker:prod && electron-builder`

**`xargs -I{}` to pass version into esbuild**

`node scripts/version.mjs --dev | xargs -I{} esbuild ... "--define:__APP_VERSION__=\\\"{}\\\""`

Portable across shells (npm scripts always run in `sh`). Alternative (`export VAR=$(...)`) is fragile across non-bash shells.

**`.build-counter.json` for local state**

`{ "date": "YYMMDD", "count": N }`. Gitignored. Deleted counter resets to count=1, acceptable.

**GitHub Actions cache for CI counter persistence**

Cache key: `build-counter-<YYMMDD>-<run_number>`. Restore uses `restore-keys: build-counter-<YYMMDD>-` prefix fallback to pick up the latest counter for today. After `--bump`, the updated file is saved with the run_number key (unique per run, ensuring the save always succeeds). A new UTC date produces no cache hit → counter starts at 1.

## Risks / Trade-offs

- [Clock skew] System clock change mid-day could jump the date and reset N → extremely unlikely.
- [Concurrent CI runs] Two runs triggered at the same instant may both restore the same counter value before either saves → both get the same N. Acceptable for the current workflow frequency.
- [`YY.MMDD.dev` not valid semver] Dev builds do not update `package.json`, so electron-builder is never invoked with a `.dev` version. The display string is renderer-only.
