## Why

Users sometimes get stuck on sub-pages within their communication provider (e.g., a login flow, an error page, or a settings page) and have no way to reload the webview to get back to the main page. A "Reload" option in the profile context menu solves this.

## What Changes

- Add a "Reload" button to the profile right-click context menu
- When clicked, reload the webview for that profile (same as refreshing a browser page)
- Position the option near other navigation-related actions (after "Pop out")

## Capabilities

### New Capabilities

None - this is a UI enhancement within the existing app-shell capability.

### Modified Capabilities

- `app-shell`: Add reload functionality to profile context menu

## Impact

- `src/renderer/sidebar.ts`: Add "Reload" button to context menu, add handler
- `src/renderer/webview-manager.ts`: Add `reload(profileId)` method
