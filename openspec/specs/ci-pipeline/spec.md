## ADDED Requirements

### Requirement: Automated build on push

The project SHALL have a GitHub Actions workflow that builds the application on every push to the main branch.

#### Scenario: Push to main triggers build

- **WHEN** code is pushed to the main branch
- **THEN** a GitHub Actions workflow SHALL run
- **AND** it SHALL install dependencies, build the application, and produce an AppImage and a Flatpak

#### Scenario: Build artifacts available for download

- **WHEN** the CI build completes successfully
- **THEN** the AppImage and Flatpak artifacts SHALL be uploaded to the workflow run
- **AND** they SHALL be downloadable from the GitHub Actions tab

#### Scenario: Build failure notification

- **WHEN** the CI build fails
- **THEN** the workflow run SHALL be marked as failed
- **AND** the failure SHALL be visible on the repository's Actions tab

### Requirement: CI publishes AppImage to GitHub Releases

On every successful CI build, the AppImage SHALL be published as a GitHub Release asset rather than a workflow artifact.

#### Scenario: AppImage published to GitHub Release

- **WHEN** CI build completes successfully
- **THEN** a GitHub Release SHALL be created tagged with the CalVer version (e.g. `v26.326.1`)
- **AND** the AppImage SHALL be attached as a downloadable release asset
- **AND** the AppImage SHALL be directly downloadable without zip extraction

#### Scenario: Release is permanently accessible

- **WHEN** a GitHub Release is created
- **THEN** the release and its AppImage asset SHALL remain accessible after the workflow run expires
- **AND** it SHALL be visible in the repository's Releases page
