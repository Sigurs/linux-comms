## MODIFIED Requirements

### Requirement: Screen sharing via xdg-desktop-portal on Wayland
When running under Wayland, the shell SHALL route `getDisplayMedia` requests through `org.freedesktop.portal.ScreenCast` so the user can share a screen or window. The application SHALL enable the `WebRTCPipeWireCapturer` Chromium feature flag at startup (merged additively with any existing `enable-features` value) and SHALL register an explicit `setDisplayMediaRequestHandler` on each provider session that delegates to the PipeWire/portal path when on Wayland.

#### Scenario: Screen share on Wayland
- **WHEN** a provider webview calls `navigator.mediaDevices.getDisplayMedia`
- **AND** the session is running on Wayland
- **THEN** the system ScreenCast portal picker SHALL appear
- **AND** upon selection a PipeWire stream SHALL be returned to the webview

#### Scenario: Portal picker appears without additional user action
- **WHEN** screen sharing is initiated on Wayland
- **THEN** the xdg-desktop-portal dialog SHALL appear immediately
- **AND** the provider SHALL NOT display an error before the user has a chance to select a source

#### Scenario: Explicit display media handler registered on Wayland sessions
- **WHEN** the app is running on Wayland
- **AND** a provider session is configured
- **THEN** the shell SHALL register a `setDisplayMediaRequestHandler` on that session that delegates to the portal/PipeWire path
- **AND** the handler SHALL NOT return `undefined` or call back with no stream before the portal interaction completes

#### Scenario: Portal not available
- **WHEN** xdg-desktop-portal is not running or not installed
- **THEN** the shell SHALL display a user-facing warning that screen sharing is unavailable
- **AND** the webview SHALL receive an appropriate error so the provider app can show its own message

#### Scenario: `enable-features` set additively
- **WHEN** the app starts on Wayland
- **THEN** `WebRTCPipeWireCapturer` SHALL be present in the Chromium `enable-features` flag
- **AND** any features already set by Electron internals SHALL be preserved
