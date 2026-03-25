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
