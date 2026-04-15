## ADDED Requirements

### Requirement: System handles malformed URLs gracefully

The system SHALL handle malformed URLs gracefully without crashing or preventing the link dialog from appearing. When a URL cannot be parsed, the system SHALL either show an appropriate error message or fall back to safe behavior.

#### Scenario: Malformed URL in anchor click

- **WHEN** a user clicks an anchor with a malformed URL (e.g., "javascript:", "mailto:", or invalid format)
- **THEN** the system SHALL log the error
- **AND** the system SHALL NOT show the link choice dialog
- **AND** the system SHALL NOT crash or throw unhandled exceptions

#### Scenario: Malformed URL in window.open

- **WHEN** JavaScript calls window.open() with a malformed URL
- **THEN** the system SHALL log the error
- **AND** the system SHALL NOT show the link choice dialog
- **AND** the system SHALL NOT crash or throw unhandled exceptions

#### Scenario: Malformed URL in will-navigate event

- **WHEN** a webview attempts to navigate to a malformed URL
- **THEN** the system SHALL log the error
- **AND** the system SHALL allow the navigation to proceed (fallback to browser handling)
- **AND** the system SHALL NOT crash or throw unhandled exceptions

### Requirement: Error logging for link handling

The system SHALL log detailed information about link handling errors to aid debugging. Logs SHALL include the URL that caused the error, the type of error, and the context where it occurred.

#### Scenario: Error logging for URL parsing failure

- **WHEN** a URL parsing error occurs in any link interception handler
- **THEN** the system SHALL log an error message containing:
  - The malformed URL
  - The error type and message
  - The handler context (e.g., "anchor click", "window.open", "will-navigate")
  - The profile ID (if available)

#### Scenario: Debug logging for successful link interception

- **WHEN** a link is successfully intercepted and the dialog is shown
- **THEN** the system SHALL log a debug message containing:
  - The URL being opened
  - The interception method (e.g., "anchor click", "window.open")
  - The profile ID
