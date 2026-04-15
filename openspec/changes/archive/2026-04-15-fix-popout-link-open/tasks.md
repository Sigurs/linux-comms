## 1. Refactor link-open.ts

- [x] 1.1 In `src/main/ipc/link-open.ts`, extract the handler body into an exported `showLinkOpenDialog(url: string, profileId: string, parentWin: BrowserWindow | null): Promise<void>` function
- [x] 1.2 Replace the `registerLinkOpenIpc` handler body with a call to `showLinkOpenDialog(url, profileId, getMainWindow())`

## 2. Wire link interception in popout.ts

- [x] 2.1 In `src/main/ipc/popout.ts`, import `showLinkOpenDialog` from `./link-open` and `getProvider` from `../../providers`
- [x] 2.2 Add a `matchesTrustedDomain(url, patterns)` helper (same logic as in `webview-manager.ts`)
- [x] 2.3 After creating each popout `BrowserWindow`, call `win.webContents.setWindowOpenHandler` to intercept `window.open()` and `target="_blank"` clicks — deny the window and call `showLinkOpenDialog(url, profileId, win)`
- [x] 2.4 Add a `will-navigate` listener on `win.webContents` that intercepts navigation to external origins (excluding same-origin and trusted domains) and calls `showLinkOpenDialog(url, profileId, win)` with `event.preventDefault()`

## 3. Verify

- [x] 3.1 Run `npm run build` — confirm no TypeScript errors
- [x] 3.2 Pop out a Teams or RocketChat profile and click an external link — confirm the dialog appears parented to the popout window
- [x] 3.3 Confirm same-origin navigation (e.g. room switching in RocketChat) is not intercepted
- [x] 3.4 Confirm links in the main embedded webview still work as before
