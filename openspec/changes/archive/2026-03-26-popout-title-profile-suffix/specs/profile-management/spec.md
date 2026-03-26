## ADDED Requirements

### Requirement: Pop-out window title includes profile name
A popped-out profile window's title SHALL always be formatted as `<page title> - <profile name>`, updated whenever the page changes its title.

#### Scenario: Page sets its title after load
- **WHEN** a pop-out window's page updates its title
- **THEN** the window title SHALL be set to `<page title> - <profile name>`
- **AND** Electron's default title update SHALL be suppressed

#### Scenario: Page navigates and changes title
- **WHEN** the user navigates within the pop-out and the page title changes
- **THEN** the window title SHALL be updated to `<new page title> - <profile name>`
