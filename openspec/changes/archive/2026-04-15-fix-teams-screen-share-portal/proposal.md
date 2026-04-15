## Why

On Wayland, screen sharing fails silently in all provider webviews (observed in Teams): no xdg-desktop-portal picker appears and the provider shows a generic error. The root cause is that the Wayland command-line flags in `applyPlatformFlags()` do not include `WebRTCPipeWireCapturer`, which is the Chromium feature flag that enables PipeWire-based screen capture and routes `getDisplayMedia` calls through `org.freedesktop.portal.ScreenCast`. Without it, `getDisplayMedia` fails before the portal is ever contacted.

## What Changes

- Add `WebRTCPipeWireCapturer` to the `enable-features` command-line switch that is applied when the app starts under Wayland
- No IPC, session, or injection-script changes required — once the flag is present, Chromium's native portal routing works automatically

## Capabilities

### New Capabilities

_(none)_

### Modified Capabilities

- `screen-sharing`: The existing Wayland scenario ("portal picker SHALL appear") was already specified but not working — this is a bug fix to meet that requirement

## Impact

- `src/main/platform/wayland.ts` — add `WebRTCPipeWireCapturer` to the Wayland `enable-features` list
