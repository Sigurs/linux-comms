## MODIFIED Requirements

### Requirement: System tray integration

The application SHALL show an icon in the system tray / notification area.

#### Scenario: Minimize to tray

- **WHEN** the user closes the main window
- **THEN** the application SHALL remain running with a tray icon visible
- **AND** clicking the tray icon SHALL restore the main window

#### Scenario: Unread badge on tray icon

- **WHEN** any provider webview reports an unread count greater than zero
- **THEN** the tray icon SHALL display a badge or overlay indicating unread activity

## ADDED Requirements

### Requirement: Version display in sidebar

The sidebar SHALL display the application build version at the bottom in a muted, unobtrusive style.

#### Scenario: Version visible in sidebar footer

- **WHEN** the application is running
- **THEN** the sidebar footer SHALL display the build version in YYMMDD-HHMM format
- **AND** the version text SHALL be styled with very low visual prominence (small size, low opacity)

#### Scenario: Version does not interfere with sidebar usability

- **WHEN** the sidebar is displayed with profiles and the add button
- **THEN** the version text SHALL appear below all other sidebar elements
- **AND** it SHALL NOT compete visually with profile entries or the add button
