## 1. Create version script

- [x] 1.1 Create `scripts/version.mjs` that accepts `--dev`, `--release`, or `--bump` flags:
  - `--dev`: prints `YYMMDD.dev` to stdout, no side effects
  - `--release`: reads `.build-counter.json` (defaults to `{ date: "", count: 0 }` if missing), resets count to 1 on new UTC date or increments by 1 on same date, writes state back, prints `YYMMDD.N`
  - `--bump`: same as `--release` but additionally writes the generated version into the `version` field of `package.json`

## 2. Update build scripts in package.json

- [x] 2.1 Update `build:renderer` to use `node scripts/version.mjs --dev | xargs -I{} esbuild src/renderer/index.ts --bundle --outfile=dist/renderer/bundle.js --platform=browser --target=chrome130 "--define:__APP_VERSION__=\\\"{}\\\"" && node scripts/copy-renderer-assets.mjs`
- [x] 2.2 Update `build:picker` similarly to use `node scripts/version.mjs --dev | xargs -I{} esbuild ...`
- [x] 2.3 Update `dist`, `dist:appimage`, and `dist:flatpak` to prepend `node scripts/version.mjs --bump &&` before `npm run build`

## 3. Update GitHub Actions workflow

- [x] 3.1 In `.github/workflows/build.yml`, add a "Bump version" step (`node scripts/version.mjs --bump`) before the "Build" step so CI uses `YYMMDD.N` for both the renderer and electron-builder

## 4. Gitignore build counter

- [x] 4.1 Add `.build-counter.json` to `.gitignore`
