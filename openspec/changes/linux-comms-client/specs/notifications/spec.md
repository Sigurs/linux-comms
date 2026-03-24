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
When a provider/profile has unread messages or missed calls, the sidebar entry SHALL display a badge count.

#### Scenario: Unread badge shown
- **WHEN** a provider webview's document title updates to include an unread count (e.g., "(3) Teams")
- **THEN** the shell SHALL parse the count and display it as a badge on the sidebar entry

#### Scenario: Badge cleared on focus
- **WHEN** the user switches to a provider/profile
- **THEN** its badge SHALL be cleared once the webview reports focus
