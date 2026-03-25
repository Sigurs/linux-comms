## ADDED Requirements

### Requirement: Wayland-native rendering via Ozone
The application SHALL launch with the Ozone/Wayland platform backend when a Wayland compositor is detected.

#### Scenario: Wayland environment detected
- **WHEN** `WAYLAND_DISPLAY` is set in the environment
- **THEN** the Electron process SHALL start with `--ozone-platform=wayland` and `--enable-features=WaylandWindowDecorations`

#### Scenario: HiDPI rendering on Wayland
- **WHEN** the display scale factor is greater than 1
- **THEN** window contents SHALL render at native resolution without blurring

### Requirement: Wayland window decorations
The application SHALL support server-side decorations (SSD) on compositors that provide them, and SHALL use client-side decorations (CSD) as fallback.

#### Scenario: SSD compositor (e.g., KDE Plasma)
- **WHEN** the compositor advertises `zxdg_decoration_manager_v1`
- **THEN** window chrome SHALL be drawn by the compositor

#### Scenario: CSD compositor (e.g., GNOME)
- **WHEN** the compositor does not advertise server-side decorations
- **THEN** the application SHALL render its own minimal titlebar / CSD

### Requirement: Clipboard integration on Wayland
Copy and paste SHALL work correctly between the shell, provider webviews, and other Wayland applications.

#### Scenario: Copy from webview to external app
- **WHEN** the user copies text within a provider webview
- **THEN** pasting in another Wayland application SHALL yield the same text

#### Scenario: Paste into webview from external app
- **WHEN** the user copies text from another Wayland application
- **THEN** pasting within a provider webview SHALL yield the correct text

### Requirement: XDG Base Directory compliance
All application data SHALL follow the XDG Base Directory specification.

#### Scenario: Config directory
- **WHEN** the application writes configuration or profile data
- **THEN** it SHALL use `$XDG_CONFIG_HOME/linux-comms` (default: `~/.config/linux-comms`)

#### Scenario: Cache directory
- **WHEN** the application writes cache data (Electron partition data, HTTP cache)
- **THEN** it SHALL use `$XDG_CACHE_HOME/linux-comms` (default: `~/.cache/linux-comms`)

### Requirement: xdg-desktop-portal availability check at startup
The application SHALL detect whether xdg-desktop-portal is available and warn the user if screen sharing will be limited.

#### Scenario: Portal available
- **WHEN** the application starts and `org.freedesktop.portal.ScreenCast` is accessible on D-Bus
- **THEN** no warning is shown and screen sharing is enabled

#### Scenario: Portal not available
- **WHEN** the application starts and xdg-desktop-portal is not accessible
- **THEN** a one-time warning notification SHALL be shown informing the user that screen sharing requires xdg-desktop-portal
