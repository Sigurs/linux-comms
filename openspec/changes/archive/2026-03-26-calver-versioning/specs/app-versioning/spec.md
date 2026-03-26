## MODIFIED Requirements

### Requirement: Build-time version generation
The build process SHALL generate a version string using a CalVer-inspired scheme formatted as `YY.MMDD.N` (valid semver, e.g. `26.326.1`) for release builds, and `YY.MMDD.dev` (e.g. `26.326.dev`) for local development builds. `MMDD` SHALL be computed as `month * 100 + day` with no leading zeros (e.g. January 5 → `105`, March 26 → `326`, December 31 → `1231`). The same version string SHALL be used for both the AppImage filename and the in-app version display.

#### Scenario: Version generated during dev build
- **WHEN** a developer runs `npm start` or `npm run build`
- **THEN** a version string SHALL be generated in `YY.MMDD.dev` format (e.g., `26.326.dev`)
- **AND** the version SHALL use the current UTC date
- **AND** `package.json` SHALL NOT be modified

#### Scenario: Version generated during release build
- **WHEN** a release build is triggered (e.g., `npm run dist:appimage`)
- **THEN** a version string SHALL be generated in `YY.MMDD.N` format (e.g., `26.326.1`, `26.326.2`)
- **AND** N SHALL start at 1 and increment with each release build on the same UTC date
- **AND** N SHALL reset to 1 on a new UTC date
- **AND** `package.json` `version` field SHALL be updated to the generated semver string

#### Scenario: Build counter persisted locally
- **WHEN** a release build completes
- **THEN** the daily build count SHALL be stored in `.build-counter.json` at the project root
- **AND** `.build-counter.json` SHALL record the UTC date string and the current count
- **AND** `.build-counter.json` SHALL be gitignored

#### Scenario: Build counter resets on new day
- **WHEN** a release build is triggered on a different UTC date than the last recorded build
- **THEN** the build counter SHALL reset to 1
- **AND** the new date SHALL be recorded in `.build-counter.json`

#### Scenario: Version injected into renderer bundle
- **WHEN** the renderer bundle is compiled by esbuild
- **THEN** the CalVer version string SHALL be available as a compile-time constant
- **AND** no runtime file loading SHALL be required
- **AND** dev builds SHALL use `YY.MMDD.dev` and release builds SHALL use `YY.MMDD.N`

#### Scenario: AppImage filename matches in-app version
- **WHEN** a release build produces an AppImage
- **THEN** the AppImage filename SHALL contain the same CalVer version as shown inside the app

#### Scenario: GitHub Actions CI build uses CalVer
- **WHEN** a build is triggered on GitHub Actions
- **THEN** the build counter SHALL be restored from the Actions cache keyed by the current UTC date
- **AND** the version SHALL be bumped to `YY.MMDD.N` (incrementing from the restored count, or starting at 1 if no cache entry exists for today)
- **AND** the updated `.build-counter.json` SHALL be saved back to the Actions cache
- **AND** the resulting AppImage filename SHALL reflect that CalVer version

#### Scenario: Multiple CI builds on the same day
- **WHEN** two or more builds are triggered on GitHub Actions on the same UTC date
- **THEN** each build SHALL receive a unique incrementing N (e.g., `26.326.1`, `26.326.2`)
- **AND** the counter SHALL be shared across runs via the date-keyed Actions cache
