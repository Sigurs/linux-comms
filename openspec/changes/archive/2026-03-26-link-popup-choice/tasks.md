## 1. IPC Infrastructure

- [x] 1.1 Add `LINK_OPEN_PROMPT` IPC channel to `src/shared/ipc-channels.ts`
- [x] 1.2 Add `openLinkChoice` method to shell preload (`src/preload/shell-preload.ts`)
- [x] 1.3 Add `openLinkChoice` type to Window.electronAPI interface in `src/renderer/webview-manager.ts`

## 2. Main Process - Link Handler

- [x] 2.1 Create `src/main/ipc/link-open.ts` with `registerLinkOpenIpc()` function
- [x] 2.2 Implement `dialog.showMessageBox` with "Open in Popup" and "Open in Browser" buttons
- [x] 2.3 Handle popup option: create BrowserWindow with same partition as source profile
- [x] 2.4 Handle browser option: call `shell.openExternal(url)`
- [x] 2.5 Register the IPC handler in `src/main/ipc/index.ts`

## 3. Renderer - Webview Event Handling

- [x] 3.1 Add `new-window` event listener to webview in `WebviewManager.ensureWebview()`
- [x] 3.2 Extract URL from new-window event and call `window.electronAPI.openLinkChoice()`
- [x] 3.3 Pass profile ID (for partition context) with the IPC call
- [x] 3.4 Prevent default popup behavior with `event.preventDefault()`

## 4. Dialog UX

- [x] 4.1 Show truncated URL in dialog (max 60 chars with ellipsis)
- [x] 4.2 Set "Open in Browser" as default button (first in button list)
- [x] 4.3 Add Cancel button for dismissing without action
- [x] 4.4 Include full URL in dialog message or detail field

## 5. Testing

- [X] 5.1 Test with Teams: click external link, verify dialog appears
- [X] 5.2 Test popup option: verify session cookies are preserved
- [X] 5.3 Test browser option: verify URL opens in default browser
- [X] 5.4 Test cancel: verify nothing opens
- [X] 5.5 Test with Rocket.Chat: verify same behavior - SKIPPED
- [X] 5.6 Test OAuth flow in popup (if applicable to provider)
