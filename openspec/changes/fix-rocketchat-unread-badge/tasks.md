## 1. Fix Page Visibility API override in INJECTION_SCRIPT

- [x] 1.1 Replace `Object.defineProperty(document, 'hidden', ...)` and `Object.defineProperty(document, 'visibilityState', ...)` with a prototype-walk helper that finds the actual descriptor owner and redefines it there (see design.md `overrideDocProp` pattern)
- [x] 1.2 Override `document.hasFocus()` on the document instance: store `_origHasFocus = document.hasFocus.bind(document)` and replace `document.hasFocus` with a function that returns `false` when `_hidden` is `true`, otherwise delegates to `_origHasFocus`
- [x] 1.3 Fix `visibilitychange` event dispatch to use `new Event('visibilitychange', { bubbles: false })` instead of `new Event('visibilitychange')`

## 2. Add notification-interception badge counting

- [x] 2.1 Add a `_notifCount = 0` module-level variable in the INJECTION_SCRIPT alongside `_hidden`
- [x] 2.2 In `MockNotif` (the Notification override), after calling `lc.sendNotification(...)`, check if `_hidden` is `true`; if so, increment `_notifCount` and call `lc.reportBadge(_notifCount)`
- [x] 2.3 In `window.__linuxCommsSetHidden`, when `hidden` transitions to `false` (profile becoming active), reset `_notifCount = 0` and call `lc.reportBadge(0)` before dispatching the `visibilitychange` event

## 3. Verification

- [ ] 3.1 Send a DM to a RocketChat account while that profile is not active and verify the sidebar badge appears (title-based path)
- [ ] 3.2 Verify a channel highlight/mention while RocketChat is not active produces a sidebar badge
- [ ] 3.3 Switch to the RocketChat profile and verify the badge clears
- [ ] 3.4 Verify Teams badge behavior is unchanged
- [ ] 3.5 Confirm no `GUEST_VIEW_MANAGER_CALL` errors appear in stderr on startup
