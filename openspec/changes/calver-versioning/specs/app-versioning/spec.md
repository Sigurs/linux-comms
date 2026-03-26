## MODIFIED Requirements

### Requirement: Build-time version generation
The build process SHALL generate a version string using a CalVer-inspired scheme: `YYMMDD.<N>` for release builds (where N is a per-day incrementing integer starting at 1) and `YYMMDD.dev` for local development builds. The same version string SHALL be used for both the AppImage filename and the in-app version display.

#### Scenario: Version generated during dev build
- **WHEN** a developer runs `npm start` or `npm run build`
- **THEN** a version string SHALL be generated in `YYMMDD.dev` format (e.g., `260326.dev`)
- **AND** the version SHALL use the current UTC date

#### Scenario: Version generated during release build
- **WHEN** a release build is triggered (e.g., `npm run dist:appimage`)
- **THEN** a version string SHALL be generated in `YYMMDD.N` format (e.g., `260326.1`, `260326.2`)
- **AND** N SHALL start at 1 and increment with each release build on the same UTC date
- **AND** N SHALL reset to 1 on a new UTC date

#### Scenario: Version injected into renderer bundle
- **WHEN** the renderer bundle is compiled by esbuild
- **THEN** the CalVer version string SHALL be available as a compile-time constant
- **AND** no runtime file loading SHALL be required

#### Scenario: AppImage filename matches in-app version
- **WHEN** a release build produces an AppImage
- **THEN** the AppImage filename SHALL contain the same CalVer version as shown inside the app

#### Scenario: GitHub Actions CI build uses CalVer
- **WHEN** a build is triggered on GitHub Actions
- **THEN** the version SHALL be bumped to `YYMMDD.N` before compiling
- **AND** the resulting AppImage filename SHALL reflect that CalVer version
