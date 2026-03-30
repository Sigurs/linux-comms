## Why

When a popped-out profile window is closed, the main window currently switches to that profile automatically. This is disruptive: the user may have been focused on a different profile and did not intend to change their active view just because they closed a separate window.

## What Changes

- When a pop-out window is closed, the profile's embedded webview SHALL be re-embedded into the main window (so it is ready for use) but the main window SHALL NOT switch to it as the active profile
- If no profile is currently active in the main window (e.g. the popped-out profile was the only active one when it was popped out), the main window SHALL remain on whatever profile is currently visible, or on the empty state if none is active

## Capabilities

### New Capabilities

_(none)_

### Modified Capabilities

- `profile-management`: The behavior on pop-out close changes — the profile is re-embedded silently without becoming the active profile in the main window

## Impact

- `src/renderer/index.ts`: The `onPopoutClosed` handler must stop calling `sidebar.setActive` and stop updating `activeProfileId` to the restored profile
- `src/renderer/webview-manager.ts`: `restorePopout` must re-embed the webview without calling `switchTo`
