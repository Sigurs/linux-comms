## MODIFIED Requirements

### Requirement: Build-time version generation

The build process SHALL generate a version string using a CalVer-inspired scheme formatted as `YY.MMDD.N` (valid semver, e.g. `26.326.1`) for release builds, and `YY.MMDD.dev` (e.g. `26.326.dev`) for local development builds. `MMDD` SHALL be computed as `month * 100 + day` with no leading zeros (e.g. January 5 → `105`, March 26 → `326`, December 31 → `1231`). The same version string SHALL be used for both the AppImage filename and the in-app version display. The version SHALL be displayed inside the About modal and as the label of the About button in the sidebar footer; it SHALL NOT be displayed as a standalone passive text element.

#### Scenario: Version generated during dev build

- **WHEN** developer runs npm start/build
- **THEN** version in `YY.MMDD.dev` format, uses UTC date, package.json NOT modified

#### Scenario: Version generated during release build

- **WHEN** release build triggered
- **THEN** `YY.MMDD.N` format, N starts at 1 and increments per same UTC date, resets on new date, package.json version field updated

#### Scenario: Build counter persisted locally

- **WHEN** release build completes
- **THEN** count stored in .build-counter.json with UTC date and count, file is gitignored

#### Scenario: Build counter resets on new day

- **WHEN** release build on different UTC date
- **THEN** counter resets to 1, new date recorded

#### Scenario: Version injected into renderer bundle

- **WHEN** bundle compiled
- **THEN** CalVer available as compile-time constant, no runtime loading, dev=YY.MMDD.dev release=YY.MMDD.N

#### Scenario: AppImage filename matches in-app version

- **WHEN** release build produces AppImage
- **THEN** filename contains same CalVer as shown in app

#### Scenario: GitHub Actions CI build uses CalVer

- **WHEN** build triggered on GHA
- **THEN** counter restored from Actions cache keyed by UTC date, bumped to YY.MMDD.N, saved back to cache, AppImage reflects CalVer

#### Scenario: Multiple CI builds on same day

- **WHEN** 2+ builds on same UTC date
- **THEN** each gets unique incrementing N, counter shared via date-keyed Actions cache

#### Scenario: Version shown in About modal and About button

- **WHEN** the renderer initialises
- **THEN** the About button label and the version field inside the About modal both display the injected CalVer string
