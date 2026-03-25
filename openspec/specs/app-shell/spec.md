## ADDED Requirements

### Requirement: Application launches with Wayland-native window

The application SHALL start as a single `BrowserWindow` with Wayland/Ozone flags active when running under a Wayland compositor.

#### Scenario: Launch on Wayland compositor

- **WHEN** the application is started on a system with `WAYLAND_DISPLAY` set
- **THEN** the main window SHALL render using the Wayland backend (no XWayland)

#### Scenario: Launch on X11 compositor

- **WHEN** the application is started without `WAYLAND_DISPLAY` set
- **THEN** the main window SHALL fall back to X11 rendering transparently

### Requirement: Sidebar navigation between providers

The shell SHALL display a persistent sidebar listing all registered communication providers and the user's profiles for each.

#### Scenario: Switch to a provider

- **WHEN** the user clicks a provider icon in the sidebar
- **THEN** the shell SHALL bring the corresponding webview to the foreground within 200ms
- **AND** the previously active webview SHALL be hidden but kept alive

#### Scenario: Multiple profiles shown per provider

- **WHEN** a provider has more than one profile configured
- **THEN** each profile SHALL appear as a separate entry under the provider in the sidebar

### Requirement: Single application instance enforcement

The application SHALL ensure only one instance runs at a time.

#### Scenario: Second launch attempt

- **WHEN** the user launches a second instance while one is already running
- **THEN** the existing instance SHALL be focused and brought to the foreground
- **AND** the second instance SHALL exit without error

### Requirement: System tray integration

The application SHALL show an icon in the system tray / notification area.

#### Scenario: Minimize to tray

- **WHEN** the user closes the main window
- **THEN** the application SHALL remain running with a tray icon visible
- **AND** clicking the tray icon SHALL restore the main window

#### Scenario: Unread badge on tray icon

- **WHEN** any provider webview reports an unread count greater than zero
- **THEN** the tray icon SHALL display a badge or overlay indicating unread activity

### Requirement: Keyboard shortcuts for provider switching

The shell SHALL support configurable keyboard shortcuts to switch between providers and profiles.

#### Scenario: Switch provider via keyboard

- **WHEN** the user presses the assigned shortcut (default: Ctrl+1 through Ctrl+9)
- **THEN** the shell SHALL activate the corresponding provider/profile in order

#### Scenario: Pop-out a profile

- **WHEN** the user right clicks a profile and selects "Pop-Out"
- **THEN** he profile shall pop-out as it's own independent window until it's closed.

### Requirement: Version display in sidebar

The sidebar SHALL display the application build version at the bottom in a muted, unobtrusive style.

#### Scenario: Version visible in sidebar footer

- **WHEN** the application is running
- **THEN** the sidebar footer SHALL display the build version in YYMMDD-HHMM format
- **AND** the version text SHALL be styled with very low visual prominence (small size, low opacity)

#### Scenario: Version does not interfere with sidebar usability

- **WHEN** the sidebar is displayed with profiles and the add button
- **THEN** the version text SHALL appear below all other sidebar elements
- **AND** it SHALL NOT compete visually with profile entries or the add button
