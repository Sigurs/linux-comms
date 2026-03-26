## ADDED Requirements

### Requirement: CI publishes AppImage to GitHub Releases
On every successful CI build, the AppImage SHALL be published as a GitHub Release asset rather than a workflow artifact.

#### Scenario: AppImage published to GitHub Release
- **WHEN** the CI build completes successfully
- **THEN** a GitHub Release SHALL be created tagged with the CalVer version (e.g. `v26.326.1`)
- **AND** the AppImage SHALL be attached as a downloadable release asset
- **AND** the AppImage SHALL be directly downloadable without zip extraction

#### Scenario: Release is permanently accessible
- **WHEN** a GitHub Release is created
- **THEN** the release and its AppImage asset SHALL remain accessible after the workflow run expires
- **AND** it SHALL be visible in the repository's Releases page
