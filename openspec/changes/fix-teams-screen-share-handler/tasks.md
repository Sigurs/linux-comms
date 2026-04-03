## 1. Fix

- [x] 1.1 In `src/main/window.ts` (`applySessionPermissions`), add a call to `sess.setDisplayMediaRequestHandler` gated on `isWayland()` that calls `callback({ video: 'loopback', audio: 'loopback' })`

## 2. Verify

- [ ] 2.1 Click screen share in Teams on Wayland — confirm the xdg-desktop-portal picker appears
- [ ] 2.2 Select a source in the portal picker — confirm sharing starts successfully in Teams
- [ ] 2.3 Verify X11 behaviour is unchanged (custom picker still appears; no regression)
