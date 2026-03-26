## ADDED Requirements

### Requirement: Webview new-window events are intercepted

The shell SHALL intercept new-window events from webviews and delegate to the link-open-choice capability instead of allowing default popup behavior.

#### Scenario: External link triggers choice dialog

- **WHEN** a webview fires a new-window event (user clicks external link)
- **THEN** the shell SHALL prevent the default popup behavior
- **AND** the shell SHALL invoke the link-open-choice dialog

#### Scenario: New-window event includes URL

- **WHEN** the shell intercepts a new-window event
- **THEN** the URL from the event SHALL be passed to the link choice handler
- **AND** the source profile ID SHALL be available for session context
