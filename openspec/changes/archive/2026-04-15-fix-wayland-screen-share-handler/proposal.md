## Why

On Wayland, clicking "Share Screen" in Teams produces no xdg-desktop-portal picker and immediately throws `TypeError: Video was requested, but no video stream was provided`. The root cause is that the current `setDisplayMediaRequestHandler` uses `useSystemPicker: true`, which is documented as macOS-only/experimental and has no effect on Linux — so the handler calls `callback({ audio: 'loopback' })` with no video stream, which Electron rejects.

## What Changes

- Remove the `setDisplayMediaRequestHandler` call from the `if (isWayland())` block in `applySessionPermissions`
- On Wayland with `WebRTCPipeWireCapturer` already enabled, Chromium's native PipeWire path handles the portal picker without an intercepting handler

## Capabilities

### New Capabilities

_(none)_

### Modified Capabilities

- `screen-sharing`: The Wayland portal scenario was already specified ("portal picker SHALL appear") but broken — removing the intercepting handler allows the native PipeWire capture path to actually invoke the portal

## Impact

- `src/main/window.ts` (`applySessionPermissions`): remove the `if (isWayland())` block that sets `setDisplayMediaRequestHandler`
