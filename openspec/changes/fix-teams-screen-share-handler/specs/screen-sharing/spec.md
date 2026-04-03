## MODIFIED Requirements

### Requirement: Screen sharing via xdg-desktop-portal on Wayland

When running under Wayland, the shell SHALL route `getDisplayMedia` requests through `org.freedesktop.portal.ScreenCast` so the user can share a screen or window.

#### Scenario: Screen share on Wayland

- **WHEN** a provider webview calls `navigator.mediaDevices.getDisplayMedia`
- **AND** the session is running on Wayland
- **THEN** the system ScreenCast portal picker SHALL appear
- **AND** upon selection a PipeWire stream SHALL be returned to the webview

#### Scenario: Electron display media handler configured for Wayland

- **WHEN** a profile session is initialized on Wayland
- **THEN** the session SHALL have `setDisplayMediaRequestHandler` configured with the PipeWire loopback path
- **AND** `getDisplayMedia` calls SHALL NOT be rejected before reaching Chromium's portal routing

#### Scenario: Portal not available

- **WHEN** xdg-desktop-portal is not running or not installed
- **THEN** the shell SHALL display a user-facing warning that screen sharing is unavailable
- **AND** the webview SHALL receive an appropriate error so the provider app can show its own message
