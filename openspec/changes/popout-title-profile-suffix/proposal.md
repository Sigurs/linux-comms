## Why

When a profile is popped out, the page it loads sets its own `document.title`, which replaces the window title Electron set at creation. This makes it impossible to tell from the taskbar or window switcher which profile a pop-out window belongs to, especially when running multiple pop-outs for the same provider.

## What Changes

- Whenever a pop-out window's page updates its title, the window title SHALL be set to `<page title> - <profile name>`, keeping the profile name permanently visible in the title bar and taskbar

## Capabilities

### New Capabilities

_(none)_

### Modified Capabilities

- `profile-management`: Pop-out window titles now include the profile name as a suffix, appended whenever the page title changes

## Impact

- `src/main/ipc/popout.ts`: Listen to `win.webContents` `page-title-updated` event; call `e.preventDefault()` and set the title to `${pageTitle} - ${profile.name}`
