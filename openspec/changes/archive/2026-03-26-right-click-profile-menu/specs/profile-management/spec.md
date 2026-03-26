## MODIFIED Requirements

### Requirement: Zoom level UI controls
The user SHALL be able to adjust the zoom level for the active profile through the profile context menu, accessed by right-clicking the profile entry in the sidebar.

#### Scenario: Zoom in
- **WHEN** the user right-clicks a profile entry and selects "Zoom In" from the context menu
- **AND** the current zoom level is less than +9
- **THEN** the zoom level SHALL increase by 1
- **AND** the webview SHALL reflect the new zoom level immediately

#### Scenario: Zoom out
- **WHEN** the user right-clicks a profile entry and selects "Zoom Out" from the context menu
- **AND** the current zoom level is greater than -1
- **THEN** the zoom level SHALL decrease by 1
- **AND** the webview SHALL reflect the new zoom level immediately

#### Scenario: Reset zoom
- **WHEN** the user right-clicks a profile entry and selects "Reset Zoom" from the context menu
- **THEN** the zoom level SHALL be set to 0 (100%)
- **AND** the webview SHALL reflect the default zoom level immediately

#### Scenario: Zoom controls disabled at limits
- **WHEN** the zoom level is at the maximum (+9)
- **THEN** "Zoom In" SHALL be disabled
- **WHEN** the zoom level is at the minimum (-1)
- **THEN** "Zoom Out" SHALL be disabled
