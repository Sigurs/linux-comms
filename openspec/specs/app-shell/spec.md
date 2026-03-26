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

### Requirement: Webview new-window events are intercepted

The shell SHALL intercept new-window events from webviews and delegate to the link-open-choice capability instead of allowing default popup behavior.

#### Scenario: External link triggers choice dialog

- **WHEN** a webview fires a new-window event (user clicks external link)
- **THEN** the shell SHALL prevent the default popup behavior
- **AND** the shell SHALL invoke the link-open-choice dialog

#### Scenario: New-window event includes URL

- **WHEN** the shell intercepts a new-window event
- **THEN** the URL from the event SHALL be passed to the link choice handler
- **AND** the source profile ID SHALL be available for session context

### Requirement: Profile context menu includes reload option

The profile context menu SHALL provide a "Reload" option that refreshes the webview content.

#### Scenario: User reloads a profile

- **WHEN** the user right-clicks a profile and selects "Reload"
- **THEN** the webview for that profile SHALL navigate to the profile's root URL (login page)

#### Scenario: Reload inactive profile

- **WHEN** the user reloads a profile that is not currently active
- **THEN** the webview SHALL reload in the background
- **AND** the currently active profile SHALL remain displayed

### Requirement: Windows display app icon

The main window and all pop-out windows SHALL display the application's icon in the title bar, taskbar, and window switcher rather than the Electron default icon.

#### Scenario: Main window shows app icon

- **WHEN** the application is launched
- **THEN** the main window SHALL display the app icon in the title bar and taskbar

#### Scenario: Pop-out window shows app icon

- **WHEN** a profile is popped out into a new window
- **THEN** the pop-out window SHALL display the app icon in the title bar and taskbar
