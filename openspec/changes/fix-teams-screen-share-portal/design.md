## Context

Chromium's PipeWire-based screen capture — which enables xdg-desktop-portal integration for `getDisplayMedia` — is gated behind the `WebRTCPipeWireCapturer` feature flag. In Electron apps, this flag is not guaranteed to be active unless it is explicitly listed in `--enable-features`, even if Chromium enables it by default in standalone Chrome builds.

The current `applyPlatformFlags()` call sets:
```
--enable-features=WaylandWindowDecorations,UseOzonePlatform
```

`WebRTCPipeWireCapturer` is absent. As a result, when any provider webview calls `getDisplayMedia` on Wayland, Chromium does not route the request to the portal — it fails before the portal dialog can appear.

The injection script already handles this split correctly: it skips the `getDisplayMedia` override on Wayland (`if (!lc.isWayland && ...)`), trusting that Chromium will handle it natively. The missing piece is just the feature flag.

## Goals / Non-Goals

**Goals:**
- Enable `WebRTCPipeWireCapturer` so Chromium routes Wayland `getDisplayMedia` calls through `org.freedesktop.portal.ScreenCast`
- Fix screen sharing for all provider webviews on Wayland (not just Teams)

**Non-Goals:**
- Changing the X11 screen sharing path (already works via `desktopCapturer` + custom picker)
- Adding `session.setDisplayMediaRequestHandler` — Chromium's native portal routing doesn't require this handler; adding it would actually bypass the portal
- Modifying provider-specific configuration

## Decisions

**Append `WebRTCPipeWireCapturer` to the existing Wayland `enable-features` switch**

Rationale: All Wayland flags are already managed in one place (`applyPlatformFlags()`). Adding the flag there keeps the pattern consistent and requires no structural changes. The flag must be included before `app.whenReady()`, which this function already satisfies.

Alternative considered: Use `session.setDisplayMediaRequestHandler` to explicitly handle the portal request. Rejected — this handler intercepts and replaces Chromium's native `getDisplayMedia` behavior. Without careful implementation it breaks the portal flow rather than fixing it, and adds complexity that the feature flag alone avoids.

## Risks / Trade-offs

- **Flag already enabled by default in some Chromium builds**: Explicitly enabling it is harmless — Chromium treats duplicate enables as a no-op.
- **Flag name stability**: `WebRTCPipeWireCapturer` has been stable since Chrome 94. Unlikely to be removed or renamed in the Electron 41 / Chromium 130+ range.
