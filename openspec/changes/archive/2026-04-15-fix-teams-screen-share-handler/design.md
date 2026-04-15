## Context

In Electron 20+, `getDisplayMedia` requests from renderer processes are intercepted by Electron before reaching Chromium's native handling. If `session.setDisplayMediaRequestHandler` is not set, Electron rejects all such requests — the `WebRTCPipeWireCapturer` flag never has a chance to route them to the portal.

The handler must call its callback with a source descriptor. For the Wayland/PipeWire path, `{ video: 'loopback', audio: 'loopback' }` is the correct value: it signals to Electron to hand off to Chromium's PipeWire implementation, which (with `WebRTCPipeWireCapturer` enabled) shows the xdg-desktop-portal picker and returns the selected stream.

The handler must be set per-session (partition), since each profile uses an isolated session. `applySessionPermissions` is already the function that configures per-session permission handlers, making it the right place to add this call.

On X11, the injection script overrides `getDisplayMedia` itself and routes it through the custom picker IPC flow. Setting a `setDisplayMediaRequestHandler` on X11 would intercept that path and break it, so the call must be gated on `isWayland()`.

## Goals / Non-Goals

**Goals:**
- Make the xdg-desktop-portal picker appear when any provider calls `getDisplayMedia` on Wayland
- Leave the X11 custom picker flow completely unchanged

**Non-Goals:**
- Changing the X11 screen sharing path
- Modifying the portal availability check or startup warning
- Provider-specific handling

## Decisions

**Decision: Use `{ video: 'loopback', audio: 'loopback' }` in the handler callback.**

Rationale: `'loopback'` is Electron's special value that defers to Chromium's native PipeWire path rather than expecting a `DesktopCapturerSource` object. This is the documented way to enable portal-based screen capture in Electron when `WebRTCPipeWireCapturer` is active.

Alternative: `session.setDisplayMediaRequestHandler(null)`. In some Electron versions this re-enables default (potentially rejecting) behavior; in others it passes through to Chromium. Too version-dependent to rely on.

Alternative: `useSystemPicker: true` option. This is documented in some Electron versions but not all, and its interaction with `WebRTCPipeWireCapturer` is inconsistent. Using `'loopback'` is more reliable across Electron 20–41.

**Decision: Gate on `isWayland()` inside `applySessionPermissions`.**

Rationale: Keeps platform-specific logic collocated with existing permission handling. X11 behavior is unchanged because the handler is not registered for X11 sessions.

## Risks / Trade-offs

- [Handler called for all sessions, including ones that don't need screen share] → Harmless — the handler only activates when `getDisplayMedia` is actually called; idle sessions are unaffected.
- [Future Electron upgrade changes `'loopback'` semantics] → Low risk; the value has been stable across Electron 20–41. Monitor Electron changelogs on upgrades.
