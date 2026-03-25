## ADDED Requirements

### Requirement: Build-time version generation

The build process SHALL generate a version string in YYMMDD-HHMM format using the current UTC time.

#### Scenario: Version generated during build

- **WHEN** the renderer bundle is built
- **THEN** a version string SHALL be generated in YYMMDD-HHMM format (e.g., 260325-1945)
- **AND** the version SHALL use UTC time

#### Scenario: Version injected into renderer bundle

- **WHEN** the renderer bundle is compiled by esbuild
- **THEN** the version string SHALL be available as a compile-time constant
- **AND** no runtime file loading SHALL be required

#### Scenario: Local development build

- **WHEN** a developer runs `npm start` or `npm run build`
- **THEN** the version SHALL reflect the current build time
- **AND** the format SHALL be identical to CI builds
