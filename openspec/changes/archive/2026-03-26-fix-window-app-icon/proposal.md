## Why

The main window and pop-out windows display the Electron/Wayland default icon in the title bar, taskbar, and window switcher instead of the app's own icon. This is because no `icon` option is passed to the `BrowserWindow` constructor. The app icon assets already exist under `assets/icons/` and are already used by the tray — they just need to be applied to the windows too.

## What Changes

- The main window SHALL be created with `icon` set to the app's 256×256 PNG asset
- Pop-out windows SHALL be created with the same `icon`

## Capabilities

### New Capabilities

_(none)_

### Modified Capabilities

- `app-shell`: Main window now shows the correct app icon

## Impact

- `src/main/window.ts`: Add `icon` to the `BrowserWindow` constructor
- `src/main/ipc/popout.ts`: Add `icon` to the `BrowserWindow` constructor
