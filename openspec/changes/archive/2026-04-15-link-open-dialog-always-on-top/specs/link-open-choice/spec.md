## MODIFIED Requirements

### Requirement: Dialog is non-blocking and informative

The link choice dialog SHALL provide clear information without disrupting the user's workflow unnecessarily. The dialog SHALL be displayed as a child of the main application window so that it cannot fall behind it.

#### Scenario: Dialog appears in front of the main window

- **WHEN** a link-open dialog is shown
- **THEN** the dialog SHALL appear in front of the main application window
- **AND** the dialog SHALL NOT be obscurable by clicking the main window

#### Scenario: Dialog shows truncated URL for long URLs

- **WHEN** the URL to be opened is longer than 60 characters
- **THEN** the dialog SHALL display only the truncated version (with ellipsis) in the detail field
- **AND** the full URL SHALL NOT be included in the dialog detail text to prevent surface allocation crashes on Wayland

#### Scenario: Dialog has sensible default focus

- **WHEN** the dialog appears
- **THEN** the "Open in Browser" button SHALL have default focus
- **AND** the dialog SHALL be dismissible with the Escape key
