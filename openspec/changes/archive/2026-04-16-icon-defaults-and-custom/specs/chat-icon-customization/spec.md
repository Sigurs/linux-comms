## MODIFIED Requirements

### Requirement: Profile stores a chosen icon
The `Profile` type SHALL include an optional `icon` field with shape `{ type: 'server' | 'library' | 'custom' | 'emoji'; value: string }`. When absent (or when `type` is `'emoji'`), the sidebar renders the provider's default Lucide icon.

#### Scenario: New profile has no icon set
- **WHEN** a new profile is created
- **THEN** its `icon` field is `undefined` and the sidebar renders the provider's default Lucide icon

#### Scenario: Icon field persists across restarts
- **WHEN** a user picks an icon and the app is restarted
- **THEN** the same icon is shown in the sidebar

#### Scenario: Legacy emoji icon treated as absent
- **WHEN** a stored profile has `icon.type === 'emoji'`
- **THEN** the sidebar renders the provider's default Lucide icon (same as if `icon` were absent)

### Requirement: Sidebar renders profile icon
The sidebar SHALL render the profile's chosen icon instead of the provider default when `profile.icon` is set to a non-deprecated type.

#### Scenario: Library icon displayed
- **WHEN** `profile.icon.type === 'library'`
- **THEN** the sidebar shows the corresponding inline SVG from the bundled Lucide manifest

#### Scenario: Server icon displayed
- **WHEN** `profile.icon.type === 'server'`
- **THEN** the sidebar shows an `<img>` element with `src` set to the stored URL

#### Scenario: Custom icon displayed
- **WHEN** `profile.icon.type === 'custom'`
- **THEN** the sidebar shows an `<img>` element with `src` set to the stored URL

#### Scenario: No icon set falls back to provider Lucide default
- **WHEN** `profile.icon` is `undefined` or `type` is `'emoji'`
- **THEN** the sidebar shows the provider's mapped Lucide icon (`rocket` for Rocket.Chat, `users-round` for Teams, `message-circle` as generic fallback)

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

## ADDED Requirements

### Requirement: Icon picker includes a Custom URL section
The icon picker SHALL display a Custom URL section below the Icon Library section, containing a URL text input and a live image preview.

#### Scenario: Custom URL input empty on open (no prior custom icon)
- **WHEN** the picker opens for a profile without a saved `type: 'custom'` icon
- **THEN** the Custom URL input is empty and no preview is shown

#### Scenario: Custom URL pre-filled for existing custom icon
- **WHEN** the picker opens for a profile with `icon.type === 'custom'`
- **THEN** the Custom URL input is pre-filled with the stored URL and the preview image is shown

#### Scenario: Preview appears on valid URL
- **WHEN** the user types or pastes a URL into the Custom URL input and the `<img>` `load` event fires
- **THEN** a preview of the image is displayed below the input and the custom URL option becomes selected

#### Scenario: Preview hidden on invalid URL
- **WHEN** the entered URL fails to load (image `error` event)
- **THEN** no preview is shown; the custom option is not selected

#### Scenario: Custom URL confirmed saves as `type: 'custom'`
- **WHEN** the user has a valid custom URL selected and clicks "Confirm"
- **THEN** the profile's `icon` is stored as `{ type: 'custom', value: '<the entered URL>' }`

### Requirement: Provider default icons use Lucide SVGs
The app SHALL define a `PROVIDER_DEFAULT_ICON` map from provider ID to Lucide icon name, used as the icon for any profile without a saved (non-deprecated) icon.

#### Scenario: Rocket.Chat default icon
- **WHEN** a Rocket.Chat profile has no saved icon
- **THEN** the sidebar shows the `rocket` Lucide SVG

#### Scenario: Teams default icon
- **WHEN** a Teams profile has no saved icon
- **THEN** the sidebar shows the `users-round` Lucide SVG

#### Scenario: Unknown provider default icon
- **WHEN** a profile's provider has no entry in `PROVIDER_DEFAULT_ICON`
- **THEN** the sidebar shows the `message-circle` Lucide SVG
