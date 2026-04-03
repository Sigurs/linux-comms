## MODIFIED Requirements

### Requirement: Notification badges on sidebar entries
When a provider/profile has unread messages or missed calls, the sidebar entry SHALL display a badge count. Badge counts SHALL be updated via two independent paths: page-title parsing and notification interception.

#### Scenario: Unread badge shown via page title
- **WHEN** a provider webview's document title updates to include an unread count (e.g., "(3) Teams")
- **THEN** the shell SHALL parse the count and display it as a badge on the sidebar entry

#### Scenario: Unread badge shown via notification interception (fallback)
- **WHEN** a provider webview fires a `new Notification()` call while its webview is not the active profile
- **THEN** the shell SHALL increment an internal notification counter for that profile and update the sidebar badge to reflect the counter

#### Scenario: Badge cleared on focus
- **WHEN** the user switches to a provider/profile
- **THEN** its badge SHALL be cleared via both paths: the notification counter is reset and the title-based count is re-evaluated once the webview becomes active

## MODIFIED Requirements

### Requirement: Page Visibility API override
The shell SHALL override `document.visibilityState`, `document.hidden`, and `document.hasFocus()` in each provider webview to reflect whether that webview is the active profile.

#### Scenario: Inactive webview reports hidden
- **WHEN** a webview is not the currently active profile
- **THEN** `document.visibilityState` SHALL return `'hidden'`
- **AND** `document.hidden` SHALL return `true`
- **AND** `document.hasFocus()` SHALL return `false`
- **AND** a `visibilitychange` event SHALL have been dispatched on the document

#### Scenario: Active webview reports visible
- **WHEN** a webview becomes the active profile
- **THEN** `document.visibilityState` SHALL return `'visible'`
- **AND** `document.hidden` SHALL return `false`
- **AND** `document.hasFocus()` SHALL reflect the actual focus state
- **AND** a `visibilitychange` event SHALL be dispatched on the document

#### Scenario: Override survives prototype chain in Chromium
- **WHEN** the injection script overrides the Page Visibility API
- **THEN** the override SHALL be applied on the prototype object that owns the property descriptor (e.g., `Document.prototype`) so that it takes effect regardless of whether the property is configurable on the document instance
