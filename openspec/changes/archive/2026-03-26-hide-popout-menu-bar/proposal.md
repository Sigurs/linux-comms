## Why

Pop-out profile windows show the native OS menu bar (File, Edit, View, etc.) by default. The main shell window already sets `autoHideMenuBar: true` to keep the interface clean. Pop-out windows should have the same behaviour for consistency.

## What Changes

- Pop-out `BrowserWindow` instances SHALL be created with `autoHideMenuBar: true`, matching the main window

## Capabilities

### New Capabilities

_(none)_

### Modified Capabilities

- `profile-management`: Pop-out windows now auto-hide the menu bar on creation

## Impact

- `src/main/ipc/popout.ts`: Add `autoHideMenuBar: true` to the `BrowserWindow` constructor options
