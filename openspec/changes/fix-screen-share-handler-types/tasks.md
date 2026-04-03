## 1. Fix

- [x] 1.1 In `src/main/window.ts`, change `callback({ video: 'loopback', audio: 'loopback' })` to `callback({ audio: 'loopback' })` and add `{ useSystemPicker: true }` as the second argument to `setDisplayMediaRequestHandler`

## 2. Verify

- [x] 2.1 Run `npm run build` — confirm no TypeScript errors
- [ ] 2.2 Test screen sharing in Teams on Wayland — confirm portal picker appears and sharing works
