## 1. Implementation

- [x] 1.1 Add a `new-window` event listener inside `WebviewManager.ensureWebview()` in `src/renderer/webview-manager.ts` that calls `window.electronAPI.openLinkChoice(url, profile.id)` for any non-empty URL

## 2. Verification

- [ ] 2.1 Manually test that clicking a link in RocketChat shows the link-choice dialog
- [ ] 2.2 Verify Teams link behaviour is unchanged (dialog still appears)
- [ ] 2.3 Verify cancelling the dialog in RocketChat opens nothing
