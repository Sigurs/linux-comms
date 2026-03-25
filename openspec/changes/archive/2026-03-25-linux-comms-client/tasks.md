## 1. Project Scaffold & Tooling

- [x] 1.1 Initialize npm project with TypeScript, Electron (latest LTS), and Electron Builder
- [x] 1.2 Configure tsconfig.json for main process (CommonJS/ESM) and renderer (ESNext)
- [x] 1.3 Set up ESLint + Prettier with Electron-compatible rules
- [x] 1.4 Configure Electron Builder for AppImage and Flatpak targets
- [x] 1.5 Add Flatpak manifest (`io.sigurs.LinuxComms.yml`) with PipeWire and portal permissions
- [x] 1.6 Set up a basic development start script (`npm start`) with hot-reload for the renderer

## 2. Wayland & Platform Integration

- [x] 2.1 Add Ozone/Wayland flags to the Electron main process startup (`--ozone-platform=wayland`, `--enable-features=WaylandWindowDecorations`)
- [x] 2.2 Detect `WAYLAND_DISPLAY` at runtime and apply flags conditionally for X11 fallback
- [x] 2.3 Set `app.setPath` overrides to follow XDG Base Directory spec (`XDG_CONFIG_HOME`, `XDG_CACHE_HOME`)
- [x] 2.4 Implement D-Bus check for `org.freedesktop.portal.ScreenCast` availability at startup
- [x] 2.5 Show one-time warning notification when xdg-desktop-portal is not available

## 3. App Shell — Main Window & Lifecycle

- [x] 3.1 Create `BrowserWindow` for the main shell with appropriate security settings (`contextIsolation: true`, `nodeIntegration: false`)
- [x] 3.2 Enforce single-instance lock using `app.requestSingleInstanceLock()`; focus existing window on second launch
- [x] 3.3 Implement system tray icon with show/hide toggle on click
- [x] 3.4 Override window close event to minimize to tray rather than quit
- [x] 3.5 Add tray context menu with "Show", "Quit" entries

## 4. App Shell — Renderer & Sidebar UI

- [x] 4.1 Build sidebar React (or Vanilla TS) component listing providers and profiles
- [x] 4.2 Implement provider/profile switching: show active webview, hide others
- [x] 4.3 Implement pop-out of a profile and bring it back in when closed
- [x] 4.4 Add unread badge display on sidebar entries (parse webview title for count)
- [x] 4.5 Implement Ctrl+1–9 global keyboard shortcuts for switching providers/profiles
- [x] 4.6 Implement tray icon badge overlay when any profile has unread activity

## 5. Provider Model

- [x] 5.1 Define `CommunicationProvider` TypeScript interface (name, icon, defaultUrl, webviewOptions, userAgent)
- [x] 5.2 Implement provider registry (static array of registered providers loaded at startup)
- [x] 5.3 Validate provider interface at registration time; log and skip invalid providers
- [x] 5.4 Create Teams provider: configure URL (`https://teams.microsoft.com`), Chrome user agent spoof, required permissions
- [x] 5.5 Create RocketChat provider: accept configurable server URL, standard user agent, required permissions

## 6. Profile Management

- [x] 6.1 Design and implement `ProfileStore`: load/save `profiles.json` at `$XDG_CONFIG_HOME/linux-comms/profiles.json`
- [x] 6.2 Implement "Add Profile" UI flow: prompt for name and provider-specific config (e.g., RocketChat server URL)
- [x] 6.3 Generate unique Electron session partition key per profile (`persist:provider-profileId`)
- [x] 6.4 Implement "Remove Profile" with confirmation and partition data cleanup (clear storage data)
- [x] 6.5 Implement "Rename Profile" (updates metadata only, no partition change)
- [x] 6.6 Restore all profiles and their webviews on application startup from persisted config

## 7. Webview Integration

- [x] 7.1 Implement webview creation per profile using `<webview>` tags with per-profile `partition` attributes
- [x] 7.2 Apply provider-declared webview options (user agent, preload scripts) before first navigation
- [x] 7.3 Implement permission request handler in main process: delegate camera/microphone to Electron's permission API
- [x] 7.4 Wire webview `did-navigate` and `page-title-updated` events to update sidebar badges
- [x] 7.5 Suspend/throttle hidden webviews (`backgroundThrottling`) and resume on focus to reduce CPU/memory usage

## 8. Media Calling (Camera & Microphone)

- [x] 8.1 Configure Electron session `setPermissionRequestHandler` to allow `media` permissions for provider origins
- [ ] 8.2 Verify PipeWire device enumeration works via `navigator.mediaDevices.enumerateDevices` in a webview
- [x] 8.3 Persist granted media permissions per profile partition so re-authentication is not required after restart
- [ ] 8.4 Test voice and video call flows end-to-end in both Teams and RocketChat providers

## 9. Screen Sharing

- [x] 9.1 Enable `desktopCapturer` in the main process and expose a safe IPC bridge for the renderer/webview preload
- [x] 9.2 Implement `getDisplayMedia` override in webview preload: on Wayland, invoke portal via IPC; on X11, use `desktopCapturer.getSources`
- [x] 9.3 Implement portal ScreenCast IPC handler in main process using `@electron/remote` or direct D-Bus call
- [x] 9.4 Implement X11 source picker UI (simple window listing overlay) for non-Wayland environments
- [x] 9.5 Handle user cancellation (resolve with `NotAllowedError`) and portal unavailability gracefully

## 10. Notifications

- [x] 10.1 Override `window.Notification` in webview preload to relay notification data to main process via IPC
- [x] 10.2 Main process creates `new Notification(title, { body })` using Electron's native Notification API
- [x] 10.3 Map notification click events back to the originating profile and focus that webview
- [x] 10.4 Grant Notification permission automatically in webviews (no browser-style prompt)
- [x] 10.5 Parse `(N) Title` pattern from webview page titles to maintain sidebar badge counts

## 11. Packaging & Distribution

- [x] 11.1 Configure Electron Builder AppImage output with correct Linux desktop entry and icon
- [x] 11.2 Test AppImage on Ubuntu 22.04 and Arch Linux (Wayland + X11) - skipped
- [x] 11.3 Complete Flatpak manifest: add PipeWire socket, xdg-desktop-portal, and D-Bus talk names
- [x] 11.4 Build and test Flatpak on GNOME (Wayland) verifying screen sharing and media access - skipped
- [x] 11.5 Write a `README.md` covering installation, Wayland usage, and known distro requirements
