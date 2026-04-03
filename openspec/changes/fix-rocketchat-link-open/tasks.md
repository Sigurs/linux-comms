## 1. Fix

- [x] 1.1 In `src/renderer/webview-manager.ts`, add a `will-navigate` event listener inside `ensureWebview` that compares the navigating URL's origin against the profile's server URL origin, calls `event.preventDefault()` for external URLs, and invokes `window.electronAPI.openLinkChoice`

## 2. Verify

- [ ] 2.1 Click a plain link (no `target="_blank"`) in RocketChat — confirm the link-open dialog appears instead of the webview navigating away
- [ ] 2.2 Right-click a link in RocketChat and choose "Open Link" from the context menu — confirm the dialog appears
- [ ] 2.3 Navigate between rooms in RocketChat — confirm internal SPA navigation is unaffected (no dialog appears)
