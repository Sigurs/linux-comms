## ADDED Requirements

### Requirement: Create a profile for a provider

The user SHALL be able to create one or more profiles for any registered provider.

#### Scenario: Add first profile

- **WHEN** the user selects a provider and chooses "Add Profile"
- **THEN** the shell SHALL prompt for a profile name and any provider-specific configuration (e.g., server URL for RocketChat)
- **AND** create an isolated storage partition for the new profile

#### Scenario: Add additional profile for same provider

- **WHEN** the user adds a second profile for a provider that already has one
- **THEN** a new, fully isolated partition SHALL be created so that sessions and storage do not share data

### Requirement: Profile storage isolation

Each profile SHALL have a dedicated Electron session partition with independent cookies, localStorage, IndexedDB, and cache.

#### Scenario: Two profiles for the same provider

- **WHEN** two profiles exist for the Teams provider
- **THEN** logging into account A in profile 1 SHALL NOT affect the session in profile 2

#### Scenario: Profile data persists across restarts

- **WHEN** the application is restarted
- **THEN** each profile's session data SHALL be restored from disk
- **AND** the user SHALL not need to re-authenticate

### Requirement: Delete a profile

The user SHALL be able to remove a profile, which clears all associated session data.

#### Scenario: Delete profile

- **WHEN** the user selects "Remove Profile" and confirms
- **THEN** the profile SHALL be removed from the sidebar
- **AND** its partition data SHALL be deleted from disk

### Requirement: Rename a profile

The user SHALL be able to rename a profile without affecting its session data.

#### Scenario: Rename profile

- **WHEN** the user edits the profile name and saves
- **THEN** the sidebar SHALL reflect the new name
- **AND** the underlying session partition SHALL remain unchanged

### Requirement: Profile configuration persistence

Profile metadata (name, provider ID, partition key, provider-specific config) SHALL be persisted using the XDG Base Directory spec (`$XDG_CONFIG_HOME/linux-comms/profiles.json`).

#### Scenario: Config file location

- **WHEN** profiles are saved
- **THEN** the file SHALL be written to `$XDG_CONFIG_HOME/linux-comms/profiles.json` (defaulting to `~/.config/linux-comms/profiles.json`)

### Requirement: Per-profile zoom level storage

Each profile SHALL store an optional zoom level preference that persists across application restarts.

#### Scenario: New profile has default zoom

- **WHEN** a new profile is created
- **THEN** the zoom level SHALL default to 0 (100%)
- **AND** no zoomLevel field SHALL be stored if the value is 0

#### Scenario: Zoom level persisted

- **WHEN** a user changes the zoom level for a profile
- **THEN** the zoom level SHALL be saved to the profile metadata
- **AND** the value SHALL be within the range -1 to +9

#### Scenario: Existing profile without zoom level

- **WHEN** loading a profile that has no zoomLevel field
- **THEN** the zoom level SHALL default to 0 (100%)

### Requirement: Zoom level application

The stored zoom level SHALL be applied when a profile's webview becomes active.

#### Scenario: Apply zoom on webview creation

- **WHEN** a webview is created for a profile
- **AND** the webview finishes loading (dom-ready)
- **THEN** the profile's zoom level SHALL be applied

#### Scenario: Apply zoom on profile switch

- **WHEN** the user switches to a different profile
- **THEN** the target profile's zoom level SHALL be applied to its webview

#### Scenario: Invalid zoom value

- **WHEN** a profile has a zoom level outside the valid range (-1 to +9)
- **THEN** the value SHALL be clamped to the nearest valid value
- **AND** a warning SHALL be logged

### Requirement: Zoom level UI controls

The user SHALL be able to adjust the zoom level for the active profile through the profile context menu.

#### Scenario: Zoom in

- **WHEN** the user right-clicks a profile entry and selects "Zoom In" from the profile context menu
- **AND** the current zoom level is less than +9
- **THEN** the zoom level SHALL increase by 1
- **AND** the webview SHALL reflect the new zoom level immediately

#### Scenario: Zoom out

- **WHEN** the user right-clicks a profile entry and selects "Zoom Out" from the profile context menu
- **AND** the current zoom level is greater than -1
- **THEN** the zoom level SHALL decrease by 1
- **AND** the webview SHALL reflect the new zoom level immediately

#### Scenario: Reset zoom

- **WHEN** the user right-clicks a profile entry and selects "Reset Zoom" from the profile context menu
- **THEN** the zoom level SHALL be set to 0 (100%)
- **AND** the webview SHALL reflect the default zoom level immediately

#### Scenario: Zoom controls disabled at limits

- **WHEN** the user right-clicks a profile entry and the zoom level is at the maximum (+9)
- **THEN** "Zoom In" SHALL be disabled
- **WHEN** the user right-clicks a profile entry and the zoom level is at the minimum (-1)
- **THEN** "Zoom Out" SHALL be disabled

### Requirement: Zoom level keyboard/mouse shortcut

The user SHALL be able to adjust the zoom level for the active profile using Ctrl + mouse wheel over the webview area.

#### Scenario: Zoom in with Ctrl + scroll up

- **WHEN** the user scrolls the mouse wheel upward while holding Ctrl
- **AND** the mouse cursor is over the active webview
- **AND** the current zoom level is less than +9
- **THEN** the zoom level SHALL increase by 1
- **AND** the webview SHALL reflect the new zoom level immediately

#### Scenario: Zoom out with Ctrl + scroll down

- **WHEN** the user scrolls the mouse wheel downward while holding Ctrl
- **AND** the mouse cursor is over the active webview
- **AND** the current zoom level is greater than -1
- **THEN** the zoom level SHALL decrease by 1
- **AND** the webview SHALL reflect the new zoom level immediately

#### Scenario: No zoom change at limits

- **WHEN** the user Ctrl + scrolls while at the zoom limit (+9 or -1)
- **THEN** the zoom level SHALL remain unchanged
- **AND** no action SHALL be taken

#### Scenario: No zoom change over sidebar

- **WHEN** the user Ctrl + scrolls over the sidebar (not the webview area)
- **THEN** the zoom level SHALL NOT change

### Requirement: Pop-out window title includes profile name

A popped-out profile window's title SHALL always be formatted as `<page title> - <profile name>`, updated whenever the page changes its title.

#### Scenario: Page sets its title after load

- **WHEN** `page-title-updated` fires
- **THEN** the window title SHALL be set to `<page title> - <profile name>`
- **AND** Electron's default title update SHALL be suppressed

#### Scenario: Page navigates and changes title

- **WHEN** the page title changes on navigation
- **THEN** the window title SHALL be updated to `<new page title> - <profile name>`

### Requirement: Pop-out window hides menu bar

A popped-out profile window SHALL auto-hide the native menu bar, consistent with the main shell window.

#### Scenario: Pop-out window opened

- **WHEN** a profile is popped out into a new window
- **THEN** the menu bar SHALL be hidden by default
- **AND** the user SHALL be able to reveal it by pressing Alt

### Requirement: Pop-out close does not switch active profile

When a popped-out profile window is closed, the main window SHALL re-embed the profile's webview without changing the currently active profile or sidebar selection.

#### Scenario: Pop-out closed while another profile is active

- **WHEN** a pop-out window is closed
- **AND** a different profile is active in the main window
- **THEN** the main window SHALL remain on the currently active profile
- **AND** the sidebar SHALL continue to highlight the previously active profile
- **AND** the restored profile's webview SHALL be re-embedded but not shown

#### Scenario: Pop-out closed with no active profile in main window

- **WHEN** a pop-out window is closed
- **AND** no profile is currently active in the main window
- **THEN** the main window SHALL display the empty state
- **AND** no profile SHALL be auto-selected
