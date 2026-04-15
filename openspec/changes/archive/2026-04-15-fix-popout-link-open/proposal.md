## Why

When a profile is popped out into its own window, links clicked inside it produce no "Open Link" dialog. The provider URL is loaded directly into a `BrowserWindow` (not inside a `<webview>`), so the `new-window` and `will-navigate` handlers wired up by `webview-manager.ts` never fire. Additionally, `ipcRenderer.sendToHost` used by the injection script's `openLinkChoice` goes nowhere in a plain `BrowserWindow` context — there is no `<webview>` host to receive it.

## What Changes

- Extract the dialog-showing logic from `registerLinkOpenIpc` in `src/main/ipc/link-open.ts` into an exported `showLinkOpenDialog(url, profileId, parentWin)` function so it can be reused
- In `src/main/ipc/popout.ts`, wire `win.webContents.setWindowOpenHandler` (intercepts `window.open()` and `target="_blank"` clicks) and a `will-navigate` listener (intercepts plain-link and context-menu navigation to external origins) that both call `showLinkOpenDialog`
- Apply the same trusted-domain bypass logic used by `webview-manager.ts`

## Capabilities

### New Capabilities

_(none)_

### Modified Capabilities

- `link-open-choice`: The dialog SHALL also be shown when links are clicked inside a popped-out provider window

## Impact

- `src/main/ipc/link-open.ts`: extract and export `showLinkOpenDialog`
- `src/main/ipc/popout.ts`: add `setWindowOpenHandler` + `will-navigate` handlers per popout window
