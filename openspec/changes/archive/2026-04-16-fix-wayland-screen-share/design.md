## Context

The app currently relies on Chromium's implicit routing of `getDisplayMedia()` to xdg-desktop-portal on Wayland. In Electron 30+ this implicit path no longer works for webview-tag contexts without an explicit `setDisplayMediaRequestHandler` registered on the session — the request is silently dropped and Teams sees a generic "content sharing" error. There is no logging to distinguish "portal not reachable" from "handler not registered" from "permission denied", making Wayland screen-share failures hard to debug.

The Teams webview uses the session partition `persist:teams-<uuid>`. The permission handler already allows `display-capture` on this partition, so permissions are not the root cause.

## Goals / Non-Goals

**Goals:**
- Screen sharing works end-to-end on Wayland via xdg-desktop-portal
- An opt-in debug mode surfaces the full flow without log spam in normal use
- `enable-features` flag is constructed additively so no existing Chromium feature is accidentally dropped
- Portal pre-flight warns when D-Bus environment is incomplete

**Non-Goals:**
- Changing X11 screen sharing behavior (custom picker remains unchanged)
- Supporting audio capture via PipeWire (out of scope for this fix)
- Modifying the portal picker UI (handled entirely by the desktop environment)

## Decisions

### Decision 1 — Explicit `setDisplayMediaRequestHandler` per provider session on Wayland

**Choice:** Register a handler on each provider session that, when on Wayland, calls `handler(request, callback)` with `callback({ video: 'loopback' })` or the equivalent Electron API signal that lets PipeWire take over, rather than calling `callback(undefined)` which cancels the request.

**Rationale:** Electron 30+ changed the contract: if no handler is registered, `getDisplayMedia()` from inside a webview is cancelled before it reaches the Ozone/PipeWire layer. An explicit handler that delegates back to the native path is the documented fix in the Electron migration guides.

**Alternative considered:** Calling `appendSwitch('enable-features', ...)` with additional flags (`PipeWireCapturerWithDmaBuf`). Rejected as insufficient on its own — the handler registration is required regardless.

**Implementation note:** The handler is only registered when `isWayland()` is true and `getPortalStatus()` is not `'unavailable'`. On X11 no handler is registered (existing picker flow continues via IPC).

### Decision 2 — Additive `enable-features` flag construction

**Choice:** Read the current value of `enable-features` from `app.commandLine.getSwitchValue('enable-features')`, merge the required features, then set with a single `appendSwitch` call.

**Rationale:** `appendSwitch` on an already-set key replaces the existing value. If Electron internally sets `UseOzonePlatform` or other flags before our code runs, calling `appendSwitch('enable-features', 'A,B,C')` silently drops those internal flags. Additive merge avoids this.

**Alternative considered:** Calling `appendArgument` for each feature separately. Not supported — `appendArgument` adds raw argv tokens, not key=value switches.

### Decision 3 — CLI-flag-gated debug logging

**Choice:** Check `app.commandLine.hasSwitch('debug')` at startup; if set, attach extra console logging in the main process handler and inject an error-catching wrapper in the webview injection script.

**Rationale:** Screen sharing issues are runtime/environment problems (portal availability, D-Bus address, PipeWire version) that can't be reproduced in CI. An always-on verbose log would be noisy; a flag allows targeted capture via `linux-comms --debug 2>&1 | tee share.log`. Using the existing Electron command-line switch mechanism keeps the implementation consistent with how other Electron flags are checked and avoids env-var pollution.

**Alternative considered:** Env var `LINUX_COMMS_DEBUG_SCREEN_SHARE=1`. Works but requires a separate shell export step; `--debug` is more ergonomic for one-off testing.

**Alternative considered:** Structured logging to file. Over-engineered for a debug flag; stdout redirect is sufficient.

### Decision 4 — D-Bus environment pre-flight

**Choice:** Before calling `gdbus introspect`, log a warning if `DBUS_SESSION_BUS_ADDRESS` or `XDG_RUNTIME_DIR` are unset. Still attempt the check; do not block startup.

**Rationale:** Missing D-Bus environment is the most common cause of portal failures when launching from `.desktop` files or Flatpak without proper env forwarding. Early warning reduces debug time.

## Risks / Trade-offs

- `setDisplayMediaRequestHandler` callback semantics differ between Electron minor versions → Mitigation: pin the exact Electron API used and add a comment referencing the migration note.
- Additive `enable-features` merge could pick up Electron-internal experimental flags we don't want → Mitigation: only ADD our required features; never remove existing ones.
- Debug injection adds JS to every Wayland webview when flag is set → Mitigation: flag is opt-in and documented; no production impact.

## Open Questions

- Does Electron 41 expose `request.frame` in `setDisplayMediaRequestHandler` for webview-origin requests? If not, we cannot distinguish which profile triggered the share (affects multi-profile debug logging only).
