## ADDED Requirements

### Requirement: Profile context menu includes reload option

The profile context menu SHALL provide a "Reload" option that refreshes the webview content.

#### Scenario: User reloads a profile

- **WHEN** the user right-clicks a profile and selects "Reload"
- **THEN** the webview for that profile SHALL navigate to the profile's root URL (login page)

#### Scenario: Reload inactive profile

- **WHEN** the user reloads a profile that is not currently active
- **THEN** the webview SHALL reload in the background
- **AND** the currently active profile SHALL remain displayed
