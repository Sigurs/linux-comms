## Why

If a user clicks multiple links in quick succession (or clicks the same link while the dialog is still open), multiple "Open Link" dialogs appear simultaneously — one per click. This is confusing and can lead to unintended actions from extra dialogs the user didn't mean to trigger.

## What Changes

- Add a module-level boolean guard in `src/main/ipc/link-open.ts` that is set to `true` when a dialog is shown and cleared when it resolves
- If a new `LINK_OPEN_PROMPT` IPC call arrives while the guard is `true`, silently return without showing a second dialog (no queuing)

## Capabilities

### New Capabilities

_(none)_

### Modified Capabilities

- `link-open-choice`: The dialog SHALL NOT open a second instance while one is already visible

## Impact

- `src/main/ipc/link-open.ts`: add a `dialogOpen` guard flag around `dialog.showMessageBox`
