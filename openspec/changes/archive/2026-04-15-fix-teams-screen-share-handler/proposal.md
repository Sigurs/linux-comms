## Why

Screen sharing in Teams (and all providers) on Wayland fails with no portal dialog appearing. The previous fix (commit de961f9) added `WebRTCPipeWireCapturer` to the Chromium feature flags, which is necessary but not sufficient. In Electron 20+, `session.setDisplayMediaRequestHandler` must also be configured — without it, Electron intercepts and rejects all `getDisplayMedia` calls before Chromium's portal routing runs, so the portal is never contacted.

## What Changes

- In `applySessionPermissions`, when running on Wayland, call `sess.setDisplayMediaRequestHandler` with `callback({ video: 'loopback', audio: 'loopback' })` to route `getDisplayMedia` through Electron's PipeWire path, which (with `WebRTCPipeWireCapturer`) triggers the xdg-desktop-portal picker
- On X11, the handler is not set so the existing custom picker flow is unaffected

## Capabilities

### New Capabilities

_(none)_

### Modified Capabilities

- `screen-sharing`: The Wayland portal scenario already requires the picker to appear — this change makes it actually work by wiring up the missing Electron API

## Impact

- `src/main/window.ts` (`applySessionPermissions`): add `setDisplayMediaRequestHandler` call gated on `isWayland()`
- No IPC or provider changes
