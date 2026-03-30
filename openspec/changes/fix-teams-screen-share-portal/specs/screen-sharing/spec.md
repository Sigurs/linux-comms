## MODIFIED Requirements

### Requirement: Screen sharing via xdg-desktop-portal on Wayland

When running under Wayland, the shell SHALL route `getDisplayMedia` requests through `org.freedesktop.portal.ScreenCast` so the user can share a screen or window. The application SHALL enable the `WebRTCPipeWireCapturer` Chromium feature flag at startup to ensure this routing is active.

#### Scenario: Screen share on Wayland

- **WHEN** a provider webview calls `navigator.mediaDevices.getDisplayMedia`
- **AND** the session is running on Wayland
- **THEN** the system ScreenCast portal picker SHALL appear
- **AND** upon selection a PipeWire stream SHALL be returned to the webview

#### Scenario: Portal picker appears without additional user action

- **WHEN** screen sharing is initiated on Wayland
- **THEN** the xdg-desktop-portal dialog SHALL appear immediately
- **AND** the provider SHALL NOT display an error before the user has a chance to select a source

#### Scenario: Portal not available

- **WHEN** xdg-desktop-portal is not running or not installed
- **THEN** the shell SHALL display a user-facing warning that screen sharing is unavailable
- **AND** the webview SHALL receive an appropriate error so the provider app can show its own message
