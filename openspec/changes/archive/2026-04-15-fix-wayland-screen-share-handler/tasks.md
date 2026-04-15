## 1. Fix

- [x] 1.1 In `src/main/window.ts` (`applySessionPermissions`), remove the `if (isWayland())` block that calls `sess.setDisplayMediaRequestHandler`

## 2. Verify

- [x] 2.1 Run `npm run build` — confirm no TypeScript errors
- [ ] 2.2 Test screen sharing in Teams on Wayland — confirm the xdg-desktop-portal picker appears
- [ ] 2.3 Confirm screen sharing completes successfully after selecting a source in the portal
- [ ] 2.4 Verify X11 screen sharing is unchanged (custom picker still appears on X11)
