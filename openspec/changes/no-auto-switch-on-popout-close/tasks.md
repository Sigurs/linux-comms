## 1. Add silent restore method to WebviewManager

- [x] 1.1 Add `restorePopoutSilent(profileId: string): void` to `src/renderer/webview-manager.ts` that makes the webview available in the DOM without calling `switchTo` (i.e. does not make it active or visible)

## 2. Update the pop-out closed handler

- [x] 2.1 In `src/renderer/index.ts`, update the `onPopoutClosed` handler to call `webviewManager.restorePopoutSilent(profileId)` instead of `restorePopout`, and remove the `sidebar.setActive(profileId)` and `activeProfileId = profileId` lines
