## 1. Platform flags fix

- [x] 1.1 In `src/main/platform/wayland.ts`, read the existing `enable-features` value via `app.commandLine.getSwitchValue('enable-features')`, merge the required features additively, then call `appendSwitch` once with the combined value
- [x] 1.2 Add D-Bus environment pre-flight warnings in `applyPlatformFlags()`: log `[platform] DBUS_SESSION_BUS_ADDRESS not set — xdg-desktop-portal may fail` and `[platform] XDG_RUNTIME_DIR not set — xdg-desktop-portal may fail` when running on Wayland and the respective env vars are absent

## 2. Wayland display-media handler

- [x] 2.1 In `src/main/ipc/screen-share.ts`, add a new exported function `applyWaylandDisplayMediaHandler(partition: string)` that calls `session.fromPartition(partition).setDisplayMediaRequestHandler(...)` with a handler that, on Wayland, delegates to the portal/PipeWire path (does not call back with `undefined`); on X11 the function is a no-op
- [x] 2.2 In `src/main/window.ts`, call `applyWaylandDisplayMediaHandler(profile.partition)` for each profile inside `applySessionPermissions` (or alongside it in `configurePermissions`) so every provider session gets the handler at startup and when new profiles are added

## 3. Debug logging — main process

- [x] 3.1 Add a `debugScreenShare` boolean constant derived from `app.commandLine.hasSwitch('debug')` in `src/main/ipc/screen-share.ts`
- [x] 3.2 Log `[screen-share] handler invoked wayland=<bool> portalStatus=<status>` inside `applyWaylandDisplayMediaHandler` when `debugScreenShare` is true
- [x] 3.3 Wrap the `setPermissionRequestHandler` and `setPermissionCheckHandler` callbacks in `src/main/window.ts` with debug log lines that print `[screen-share] permission <name> <allowed|denied> partition=<p>` when `debugScreenShare` is true and `permission` contains `display` or `capture`

## 4. Debug logging — webview injection

- [x] 4.1 Add a new IPC channel `SCREEN_SHARE_DEBUG_ERROR` to `src/shared/ipc-channels.ts`
- [x] 4.2 In `src/preload/webview-preload.ts`, expose a `reportScreenShareError(name: string, message: string) => void` method on the `lc` context bridge object (only when `app.commandLine.hasSwitch('debug')` is true)
- [x] 4.3 In the Wayland branch of the injection script in `src/renderer/webview-manager.ts`, add a `try/catch` around the `getDisplayMedia` call that, when `lc.debugScreenShare` is true, calls `lc.reportScreenShareError(err.name, err.message)`
- [x] 4.4 In `src/main/ipc/screen-share.ts`, register an `ipcMain.on(IPC.SCREEN_SHARE_DEBUG_ERROR, ...)` handler that logs `[screen-share] webview error name=<n> message=<m>`

## 5. Verification

- [x] 5.1 Build the app (`npm run build`) and confirm no TypeScript errors
- [ ] 5.2 Run on Wayland with `--debug` and attempt Teams screen sharing — confirm portal picker appears and debug lines appear in stdout
- [ ] 5.3 Run on Wayland without the debug flag — confirm no debug lines in stdout and screen sharing works
- [ ] 5.4 Run on X11 — confirm existing picker flow is unaffected
