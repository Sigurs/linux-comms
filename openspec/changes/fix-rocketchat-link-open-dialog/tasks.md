## 1. Anchor Click Interceptor

- [x] 1.1 In `INJECTION_SCRIPT` in `src/renderer/webview-manager.ts`, add a capture-phase `click` event listener on `document` that finds the closest `<a>` ancestor of the clicked element
- [x] 1.2 In the listener, skip same-origin anchor clicks (compare `new URL(anchor.href).origin` against `location.origin`) so internal SPA navigation is not intercepted
- [x] 1.3 For external `target="_blank"` anchor clicks, call `e.preventDefault()` and `lc.openLinkChoice(anchor.href)` — mirroring the `window.open` override pattern

## 2. Verification

- [ ] 2.1 Click a URL link inside a RocketChat message and confirm the Open Link dialog appears
- [ ] 2.2 Confirm that same-origin RocketChat navigation (switching rooms) is not intercepted
- [ ] 2.3 Confirm Teams links still work as before (Teams uses `window.open`, not anchors)
- [ ] 2.4 Confirm "Open in Popup" and "Open in Browser" both work correctly from the dialog
