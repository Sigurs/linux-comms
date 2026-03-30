## MODIFIED Requirements

### Requirement: Notification badges on sidebar entries

When a provider/profile has unread messages or missed calls, the sidebar entry SHALL display a badge count. The shell SHALL simulate page visibility correctly so that web-first providers (which rely on the Page Visibility API to accumulate unread counts) update the document title when their profile is not active.

#### Scenario: Unread badge shown

- **WHEN** a provider webview's document title updates to include an unread count (e.g., "(3) Teams")
- **THEN** the shell SHALL parse the count and display it as a badge on the sidebar entry

#### Scenario: Non-active webview is treated as hidden

- **WHEN** a profile's webview is not the active profile
- **THEN** `document.visibilityState` in that webview SHALL return `"hidden"`
- **AND** `document.hidden` SHALL return `true`
- **AND** a `visibilitychange` event SHALL be dispatched to the webview's page so the provider app can respond

#### Scenario: Active webview is treated as visible

- **WHEN** a profile's webview becomes the active profile
- **THEN** `document.visibilityState` SHALL return `"visible"`
- **AND** `document.hidden` SHALL return `false`
- **AND** a `visibilitychange` event SHALL be dispatched so the provider app can mark messages as read

#### Scenario: Badge cleared on focus

- **WHEN** the user switches to a provider/profile
- **THEN** its badge SHALL be cleared once the webview reports focus
