## Why

Users with multiple communication profiles often need different zoom levels for different services. For example, a user may want larger text in Teams for better readability during video calls, but prefer a smaller zoom level in a chat-heavy profile to see more messages. Currently, zoom is hardcoded to 100% for all profiles, providing no per-profile customization.

## What Changes

- Add `zoomLevel` field to the `Profile` type to store per-profile zoom preferences
- Persist zoom level alongside other profile metadata
- Apply saved zoom level when switching to or loading a profile
- Add UI controls (zoom in/out/reset) accessible from the profile context menu or settings
- Support Electron's standard zoom levels (-1 to +9, where 0 is 100%)
- Default new profiles to zoom level 0 (100%)

## Capabilities

### New Capabilities

None - this extends an existing capability.

### Modified Capabilities

- `profile-management`: Add requirement for per-profile zoom level storage and application

## Impact

- **Profile type**: Add `zoomLevel?: number` field
- **Profile store**: Persist and restore zoom level with profile data
- **Webview manager**: Apply stored zoom level when activating a webview
- **UI**: Add zoom controls to profile context menu or dedicated UI
- **Existing profiles**: Gracefully handle missing `zoomLevel` (default to 0)
