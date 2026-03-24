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
