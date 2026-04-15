## Context

Screen sharing on Wayland in Electron requires two things:
1. The `WebRTCPipeWireCapturer` Chromium feature flag (already enabled in `applyPlatformFlags`) to route `getDisplayMedia` through PipeWire and xdg-desktop-portal at the Chromium level.
2. No Electron-level `setDisplayMediaRequestHandler` that intercepts and short-circuits the request before Chromium's portal routing runs.

The current code sets a handler with `useSystemPicker: true`, but that option is documented as `_macOS_ _Experimental_` and has no effect on Linux. As a result, the handler fires immediately, calls `callback({ audio: 'loopback' })` with no video stream, and Electron throws `TypeError: Video was requested, but no video stream was provided`. The xdg-desktop-portal picker never appears.

On X11, no `setDisplayMediaRequestHandler` is set and screen sharing works via `desktopCapturer`. This confirms that Electron does not unconditionally reject `getDisplayMedia` without a handler — the rejection only occurs when a handler is registered but the callback provides no valid stream.

## Goals / Non-Goals

**Goals:**
- Make the xdg-desktop-portal picker appear on Wayland
- Leave X11 screen sharing unchanged

**Non-Goals:**
- Adding audio loopback on Wayland (requires a working video stream first; can be addressed later)
- Supporting `desktopCapturer.getSources()` on Wayland (it does not return sources under Ozone)

## Decisions

**Decision: Remove `setDisplayMediaRequestHandler` on Wayland**

Without the intercepting handler, Chromium's native `WebRTCPipeWireCapturer` path handles `getDisplayMedia` end-to-end: it contacts xdg-desktop-portal, shows the picker, and returns the PipeWire stream to the webview. No Electron-level handler is needed.

Alternative: Call `callback({})` with no streams — still fails because Electron validates that video was provided when video was requested.

Alternative: Keep `useSystemPicker: true` — documented macOS-only, does not trigger the portal on Linux.

Alternative: Use `desktopCapturer.getSources()` to supply a `Video` object — does not return sources on Wayland/Ozone; results in empty source list.

## Risks / Trade-offs

- [Audio loopback on Wayland is lost] → The `audio: 'loopback'` in the old handler was aspirational; with no handler and `WebRTCPipeWireCapturer`, audio capture via the portal depends on portal version and user permissions. This is acceptable for now — video is the blocker.
- [Regression on X11] → The handler was already gated on `isWayland()`, so X11 is unaffected. No regression risk.
