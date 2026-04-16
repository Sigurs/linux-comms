## ADDED Requirements

### Requirement: Opt-in debug logging for screen sharing
The shell SHALL support a debug mode for screen sharing, activated by launching with the `--debug` CLI flag. In debug mode the shell SHALL log the full screen-share flow to stdout with a `[screen-share]` prefix and SHALL NOT alter any user-visible behaviour.

#### Scenario: Debug mode off by default
- **WHEN** the app starts without the `--debug` flag
- **THEN** no screen-share debug lines SHALL appear in stdout

#### Scenario: Handler invocation logged
- **WHEN** the `--debug` flag is set
- **AND** `setDisplayMediaRequestHandler` is invoked on a provider session
- **THEN** the main process SHALL log the event including the Wayland/X11 detection result and portal availability status

#### Scenario: Permission check result logged
- **WHEN** the `--debug` flag is set
- **AND** a `display-capture` permission is checked or requested for a provider session
- **THEN** the result (allowed/denied) SHALL be logged with the partition identifier

#### Scenario: Webview-side error surfaced in debug mode
- **WHEN** the `--debug` flag is set
- **AND** `getDisplayMedia()` throws inside a provider webview on Wayland
- **THEN** the error name and message SHALL be forwarded to the main process log via IPC

### Requirement: D-Bus environment pre-flight warning
The shell SHALL log a warning at startup when running on Wayland and `DBUS_SESSION_BUS_ADDRESS` or `XDG_RUNTIME_DIR` is unset, because these are required for xdg-desktop-portal to function.

#### Scenario: D-Bus address missing
- **WHEN** the app starts on Wayland
- **AND** `DBUS_SESSION_BUS_ADDRESS` is not set in the environment
- **THEN** the shell SHALL log a warning: `[platform] DBUS_SESSION_BUS_ADDRESS not set — xdg-desktop-portal may fail`
- **AND** this warning SHALL appear regardless of whether `--debug` is set

#### Scenario: XDG_RUNTIME_DIR missing
- **WHEN** the app starts on Wayland
- **AND** `XDG_RUNTIME_DIR` is not set in the environment
- **THEN** the shell SHALL log a warning: `[platform] XDG_RUNTIME_DIR not set — xdg-desktop-portal may fail`
- **AND** this warning SHALL appear regardless of whether `--debug` is set

#### Scenario: Environment complete
- **WHEN** both `DBUS_SESSION_BUS_ADDRESS` and `XDG_RUNTIME_DIR` are set
- **THEN** no warning SHALL be logged for these variables
