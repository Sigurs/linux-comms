## Context

`electron-builder` reads the `version` field from `package.json` to name output artifacts. The renderer build uses an esbuild `--define` flag to inject `__APP_VERSION__` at compile time. Both sources must agree on the same version string.

The calver format is `YYMMDD.<N>` where:
- `YYMMDD` is the UTC build date (e.g. `260326`)
- `N` is a 1-based integer that increments with each release build on that day and resets to `1` on a new day
- Dev builds use `YYMMDD.dev` — not a valid semver, but electron-builder accepts arbitrary version strings

## Goals / Non-Goals

**Goals:**
- Single version source used by both `package.json` (AppImage name) and the renderer display
- Release builds auto-increment the daily counter; dev builds never mutate state
- The counter file is machine-local and gitignored

**Non-Goals:**
- Git tagging or CI integration (out of scope for this change)
- Semver compliance (CalVer is intentionally non-semver here)

## Decisions

**`scripts/version.mjs` owns all version logic**

Keeping the logic in one script makes the npm script lines short and the logic testable. The script is invoked with `--dev` or `--release`.

- `--dev`: prints `YYMMDD.dev`, exits. No side effects.
- `--release`: reads `.build-counter.json` (defaults to `{ date: "", count: 0 }` if missing), compares stored date to today's UTC date, increments or resets count, writes file back, prints `YYMMDD.N`.
- `--bump`: same as `--release` but also writes the version into `package.json` `version` field (used by dist scripts before electron-builder runs).

**`.build-counter.json` for state**

A simple JSON file with `{ "date": "YYMMDD", "count": N }`. Gitignored. Lives at the project root. If deleted, the counter resets to `1` for that day, which is acceptable.

**npm scripts call the version script inline**

```
"build:renderer": "node scripts/version.mjs --dev | xargs -I{} esbuild ... --define:__APP_VERSION__=\\\"{}\\\" ..."
"dist:appimage": "node scripts/version.mjs --bump && npm run build && ... && electron-builder ..."
```

`xargs -I{}` pipes the printed version string into the esbuild command. For dist scripts, `--bump` updates `package.json` before the build so electron-builder picks up the new version.

**Alternative considered: env var export**
Running `export BUILD_VERSION=$(node scripts/version.mjs --dev)` in a subshell works in bash but is fragile across shells (fish, zsh non-login). The `xargs` pipe approach is portable for npm scripts which always run in `sh`.

## Risks / Trade-offs

- [`.build-counter.json` deleted on CI] Counter resets to `1` each run — acceptable since CI builds are ephemeral and typically only run once per day per pipeline.
- [Clock skew] If the system clock changes mid-day, the date may jump and reset N — extremely unlikely in practice.
- [Non-semver version in `package.json`] `YYMMDD.dev` is not valid semver but electron-builder does not enforce semver.
