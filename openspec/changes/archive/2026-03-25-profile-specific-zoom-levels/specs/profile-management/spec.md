## ADDED Requirements

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

- **WHEN** the user selects "Zoom In" from the profile context menu
- **AND** the current zoom level is less than +9
- **THEN** the zoom level SHALL increase by 1
- **AND** the webview SHALL reflect the new zoom level immediately

#### Scenario: Zoom out

- **WHEN** the user selects "Zoom Out" from the profile context menu
- **AND** the current zoom level is greater than -1
- **THEN** the zoom level SHALL decrease by 1
- **AND** the webview SHALL reflect the new zoom level immediately

#### Scenario: Reset zoom

- **WHEN** the user selects "Reset Zoom" from the profile context menu
- **THEN** the zoom level SHALL be set to 0 (100%)
- **AND** the webview SHALL reflect the default zoom level immediately

#### Scenario: Zoom controls disabled at limits

- **WHEN** the zoom level is at the maximum (+9)
- **THEN** "Zoom In" SHALL be disabled
- **WHEN** the zoom level is at the minimum (-1)
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
