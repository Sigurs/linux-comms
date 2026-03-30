## 1. Injection script — Visibility API override

- [x] 1.1 In `INJECTION_SCRIPT` in `webview-manager.ts`, add a Visibility API override block that: declares `_hidden = false`, uses `Object.defineProperty` to redefine `document.visibilityState` and `document.hidden` as getters backed by `_hidden`, and exposes `window.__linuxCommsSetHidden(hidden)` which updates `_hidden` and dispatches a `visibilitychange` event

## 2. WebviewManager — toggle visibility on profile switch

- [x] 2.1 In `WebviewManager.switchTo()`, after removing `active` from the previous webview, call `prev.executeJavaScript('window.__linuxCommsSetHidden && window.__linuxCommsSetHidden(true)')` on the departing webview
- [x] 2.2 In `WebviewManager.switchTo()`, after adding `active` to the next webview, call `next.executeJavaScript('window.__linuxCommsSetHidden && window.__linuxCommsSetHidden(false)')` on the arriving webview

## 3. WebviewManager — set initial visibility on load

- [x] 3.1 In the `dom-ready` handler inside `ensureWebview()`, after injecting the INJECTION_SCRIPT, if this webview is NOT the active profile, call `wv.executeJavaScript('window.__linuxCommsSetHidden && window.__linuxCommsSetHidden(true)')` to mark it hidden from the start

## 4. WebviewManager — mark popped-out webview as hidden

- [x] 4.1 In `WebviewManager.popOut()`, after hiding the webview, call `wv.executeJavaScript('window.__linuxCommsSetHidden && window.__linuxCommsSetHidden(true)')` so popped-out webviews are treated as hidden by the provider

## 5. WebviewManager — guard executeJavaScript with readiness tracking

- [x] 5.1 Add `private readyWebviews: Set<string> = new Set()` to `WebviewManager`
- [x] 5.2 In `dom-ready`, call `this.readyWebviews.add(profile.id)` before the visibility `executeJavaScript` call
- [x] 5.3 In `switchTo()`, gate both `executeJavaScript` calls with `this.readyWebviews.has(...)` to prevent `GUEST_VIEW_MANAGER_CALL` errors at startup
- [x] 5.4 In `popOut()`, gate the `executeJavaScript` call with `this.readyWebviews.has(...)`
- [x] 5.5 In `removeWebview()`, call `this.readyWebviews.delete(profileId)` to clean up

## 6. Verification

- [ ] 6.1 Send a DM to a RocketChat account while that profile is not active and verify the sidebar badge appears
- [ ] 6.2 Switch to the RocketChat profile and verify the badge clears
- [ ] 6.3 Verify Teams badge behaviour is unchanged
- [ ] 6.4 Confirm no `GUEST_VIEW_MANAGER_CALL` errors in stderr on startup
