## MODIFIED Requirements

### Requirement: Dialog is non-blocking and informative

The link choice dialog SHALL provide clear information without disrupting the user's workflow unnecessarily.

#### Scenario: Dialog shows truncated URL for long URLs

- **WHEN** the URL to be opened is longer than 60 characters
- **THEN** the dialog SHALL display only the truncated version (with ellipsis) in the detail field
- **AND** the full URL SHALL NOT be included in the dialog detail text to prevent surface allocation crashes on Wayland

#### Scenario: Dialog has sensible default focus

- **WHEN** the dialog appears
- **THEN** the "Open in Browser" button SHALL have default focus
- **AND** the dialog SHALL be dismissible with the Escape key
