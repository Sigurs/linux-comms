### Requirement: Profiles load automatically on startup
All configured profiles SHALL begin loading their web content immediately when the application starts, without requiring a user click on each profile tab.

#### Scenario: Multiple profiles load on startup
- **WHEN** the application starts with two or more profiles configured
- **THEN** all profile webviews start loading their URLs in the background without any user interaction

#### Scenario: Active profile is immediately visible
- **WHEN** the application starts
- **THEN** the first (or last-used) profile is active and visible
- **AND** all other profiles load silently in the background

#### Scenario: Inactive profiles do not capture pointer events
- **WHEN** a profile is loaded but not active
- **THEN** the profile's webview SHALL NOT intercept mouse clicks or hover events intended for the active profile or other UI elements
