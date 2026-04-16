## Why

Teams screen sharing fails on Wayland with "There's an issue with content sharing" and no xdg-desktop-portal picker ever appears. The current code relies entirely on Chromium's implicit portal routing, but modern Electron requires an explicit `setDisplayMediaRequestHandler` for webview-sourced `getDisplayMedia()` calls to reach the portal — without it the request is silently dropped. There is also no debug surface to diagnose future regressions.

## What Changes

- Add a Wayland-aware `setDisplayMediaRequestHandler` to each provider session that explicitly signals Electron to route the `getDisplayMedia()` request through the xdg-desktop-portal (PipeWire path), replacing the current "do nothing and hope Chromium handles it" approach.
- Harden `enable-features` flag construction so `WebRTCPipeWireCapturer` is appended to any flags Electron has already set rather than replacing them.
- Add optional debug logging (enabled via the `--debug` CLI flag) that traces the full screen-share flow: handler invocation, portal availability, permission check/grant, and any errors thrown by the webview.
- Improve the portal pre-flight check to also verify `DBUS_SESSION_BUS_ADDRESS` and `XDG_RUNTIME_DIR` are set, logging actionable warnings when they are missing.

## Capabilities

### New Capabilities

- `screen-share-debug`: Optional debug-logging layer for the screen sharing flow — env-var-gated, covers main-process handler, permission checks, and webview-side errors.

### Modified Capabilities

- `screen-sharing`: Wayland path now uses an explicit `setDisplayMediaRequestHandler` per session; existing X11 picker flow is unchanged.

## Impact

- `src/main/ipc/screen-share.ts` — register `setDisplayMediaRequestHandler` per session on Wayland
- `src/main/platform/wayland.ts` — fix `enable-features` flag accumulation; add env-var validation logging
- `src/main/platform/portal.ts` — add D-Bus environment pre-flight warnings
- `src/main/window.ts` — call new per-session display-media handler setup alongside existing permission setup
- `src/renderer/webview-manager.ts` — add Wayland-side error catch in injection script when `DEBUG_SCREEN_SHARE` is set
- No new runtime dependencies
