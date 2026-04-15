## Why

The "Open Link" dialog is shown without a parent window, so the window manager treats it as an independent top-level window. On Linux this means it can fall behind the main application window after any window interaction, leaving the user with a frozen-looking app and no visible way to dismiss the dialog.

## What Changes

- Pass the main `BrowserWindow` as the parent to `dialog.showMessageBox` in `src/main/ipc/link-open.ts`
- Electron pins a dialog with a parent window to always appear in front of that window

## Capabilities

### New Capabilities

_(none)_

### Modified Capabilities

- `link-open-choice`: The dialog SHALL be displayed as a child of the main window so it cannot fall behind it

## Impact

- `src/main/ipc/link-open.ts`: pass `getMainWindow()` as the first argument to `dialog.showMessageBox`
