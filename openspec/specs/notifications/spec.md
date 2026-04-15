## ADDED Requirements

### Requirement: Native desktop notifications from webviews
When a provider webview triggers a web Notification, the shell SHALL relay it as a native Linux desktop notification via Electron's `Notification` API (backed by libnotify/D-Bus).

#### Scenario: Notification permission granted
- **WHEN** a provider webview calls `Notification.requestPermission()`
- **THEN** the shell SHALL grant the permission (notifications are expected behavior for communication apps)

#### Scenario: Notification displayed natively
- **WHEN** a provider webview creates a `new Notification(title, options)`
- **THEN** a native OS notification SHALL appear with the correct title and body
- **AND** clicking the notification SHALL focus the shell window and switch to the originating provider/profile

### Requirement: Notification action: focus provider
Clicking a native notification SHALL bring the corresponding provider/profile to the foreground.

#### Scenario: Click notification from Teams profile
- **WHEN** the user clicks a notification originating from the Teams - Work profile
- **THEN** the main window SHALL be focused
- **AND** the Teams - Work profile SHALL be made the active webview

### Requirement: Do Not Disturb awareness
The shell SHALL respect the system's Do Not Disturb or notification suppression state.

#### Scenario: DND active
- **WHEN** the system's notification DND mode is enabled
- **THEN** the shell SHALL suppress native notifications (relying on the OS/portal to enforce this)
- **AND** notification badge counts SHALL still update in the sidebar

### Requirement: Notification badges on sidebar entries
When a provider/profile has unread messages or missed calls, the sidebar entry SHALL display a badge count. The shell SHALL simulate page visibility correctly so that web-first providers (which rely on the Page Visibility API to accumulate unread counts) update the document title when their profile is not active. Badge counts SHALL be updated via two independent paths: page-title parsing and notification interception.

#### Scenario: Unread badge shown via page title
- **WHEN** a provider webview's document title updates to include an unread count (e.g., "(3) Teams")
- **THEN** the shell SHALL parse the count and display it as a badge on the sidebar entry

#### Scenario: Unread badge shown via notification interception (fallback)
- **WHEN** a provider webview fires a `new Notification()` call while its webview is not the active profile
- **THEN** the shell SHALL increment an internal notification counter for that profile and update the sidebar badge to reflect the counter

#### Scenario: Badge cleared on focus
- **WHEN** the user switches to a provider/profile
- **THEN** its badge SHALL be cleared via both paths: the notification counter is reset and the title-based count is re-evaluated once the webview becomes active

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
