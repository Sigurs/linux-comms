## ADDED Requirements

### Requirement: Pop-out close does not switch active profile
When a popped-out profile window is closed, the main window SHALL re-embed the profile's webview without changing the currently active profile or sidebar selection.

#### Scenario: Pop-out closed while another profile is active
- **WHEN** a pop-out window is closed
- **AND** a different profile is active in the main window
- **THEN** the main window SHALL remain on the currently active profile
- **AND** the sidebar SHALL continue to highlight the previously active profile
- **AND** the restored profile's webview SHALL be re-embedded but not shown

#### Scenario: Pop-out closed with no active profile in main window
- **WHEN** a pop-out window is closed
- **AND** no profile is currently active in the main window
- **THEN** the main window SHALL display the empty state
- **AND** no profile SHALL be auto-selected
