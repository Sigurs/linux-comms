## ADDED Requirements

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

#### Scenario: No Electron handler intercepts the portal flow
- **WHEN** the app is running on Wayland
- **THEN** the shell SHALL NOT register a `setDisplayMediaRequestHandler` that calls back without a video stream
- **AND** Chromium's native `WebRTCPipeWireCapturer` path SHALL handle the request end-to-end

#### Scenario: Portal not available
- **WHEN** xdg-desktop-portal is not running or not installed
- **THEN** the shell SHALL display a user-facing warning that screen sharing is unavailable
- **AND** the webview SHALL receive an appropriate error so the provider app can show its own message

### Requirement: Screen sharing on XWayland / X11
When running under X11 or XWayland, the shell SHALL allow `getDisplayMedia` using Electron's standard `desktopCapturer` API.

#### Scenario: Screen share on X11
- **WHEN** a provider webview calls `getDisplayMedia`
- **AND** the session is running under X11 or XWayland
- **THEN** the shell SHALL use `desktopCapturer.getSources` to enumerate screens and windows
- **AND** pass the selected source stream to the webview

### Requirement: Screen share source selection
The user SHALL be able to choose which screen or window to share.

#### Scenario: Multiple screens available
- **WHEN** the user initiates screen sharing and multiple monitors are connected
- **THEN** the picker SHALL show all available screens and windows as selectable options

#### Scenario: User cancels sharing
- **WHEN** the user dismisses the source picker without selecting
- **THEN** the webview SHALL receive a `NotAllowedError` and no stream SHALL be opened

### Requirement: Screen sharing stops when call ends
Screen sharing SHALL be terminated when the provider app ends the call or the user stops sharing within the provider UI.

#### Scenario: Stop sharing from provider UI
- **WHEN** the provider app signals stop sharing (track ends)
- **THEN** the PipeWire stream or desktop capturer source SHALL be released
