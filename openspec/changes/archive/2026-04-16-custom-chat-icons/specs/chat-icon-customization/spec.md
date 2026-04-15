## ADDED Requirements

### Requirement: Profile stores a chosen icon
The `Profile` type SHALL include an optional `icon` field with shape `{ type: 'server' | 'library' | 'emoji'; value: string }`. When absent, the provider default emoji is used.

#### Scenario: New profile has no icon set
- **WHEN** a new profile is created
- **THEN** its `icon` field is `undefined` and the sidebar renders the provider emoji

#### Scenario: Icon field persists across restarts
- **WHEN** a user picks an icon and the app is restarted
- **THEN** the same icon is shown in the sidebar

### Requirement: Sidebar renders profile icon
The sidebar SHALL render the profile's chosen icon instead of the hardcoded provider emoji when `profile.icon` is set.

#### Scenario: Library icon displayed
- **WHEN** `profile.icon.type === 'library'`
- **THEN** the sidebar shows the corresponding inline SVG from the bundled Lucide manifest

#### Scenario: Server icon displayed
- **WHEN** `profile.icon.type === 'server'`
- **THEN** the sidebar shows an `<img>` element with `src` set to the stored URL

#### Scenario: Emoji icon displayed
- **WHEN** `profile.icon.type === 'emoji'`
- **THEN** the sidebar shows the emoji character in a `<span>`

#### Scenario: No icon set falls back to provider emoji
- **WHEN** `profile.icon` is `undefined`
- **THEN** the sidebar shows the provider's default emoji (current behaviour)

### Requirement: Icon picker accessible from context menu
The profile context menu SHALL include a "Change Icon…" item that opens the icon picker modal.

#### Scenario: Menu item opens picker
- **WHEN** the user right-clicks a profile entry and selects "Change Icon…"
- **THEN** the icon picker modal opens with the current icon pre-selected

### Requirement: Icon picker saves selection via IPC
The icon picker SHALL call the `updateProfileIcon(profileId, icon)` IPC handler when the user confirms their selection, and close the modal.

#### Scenario: User confirms a selection
- **WHEN** the user selects an icon and clicks "Confirm"
- **THEN** `updateProfileIcon` is called with the profile ID and the chosen icon descriptor, the sidebar updates immediately, and the modal closes

#### Scenario: User cancels
- **WHEN** the user clicks "Cancel" or presses Escape
- **THEN** no IPC call is made and the modal closes without changing the icon
