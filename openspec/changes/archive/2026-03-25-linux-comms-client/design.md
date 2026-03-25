## Context

Linux desktop users who rely on communication platforms like Microsoft Teams and RocketChat currently lack a single, well-behaved native client. The official Teams Linux client was discontinued; the web app and third-party wrappers have poor Wayland support, broken screen sharing, and no multi-profile capability. RocketChat's Electron app exists but is siloed. This project builds a unified Electron shell that hosts multiple communication apps as isolated webviews, with first-class Wayland support via the Ozone platform backend and xdg-desktop-portal integration.

## Goals / Non-Goals

**Goals:**
- Single Electron application hosting Teams and RocketChat as isolated webview partitions
- Full Wayland support (Ozone/Wayland backend, PipeWire for media, xdg-desktop-portal for screen sharing)
- Per-app, per-account profile isolation (cookies, storage, session)
- Voice/video calling support within each provider's webview
- Screen sharing with Wayland portal (no XWayland fallback required for sharing)
- System tray, native notifications, and app badge support
- Extensible provider model so new apps can be added in the future

**Non-Goals:**
- macOS or Windows support
- Custom VoIP/WebRTC stack (relies on each app's native web implementation)
- Re-implementing any communication app's UI or backend
- Offline/cached message storage outside the apps themselves

## Decisions

### D1: Electron with Ozone/Wayland backend

**Decision**: Use Electron latest LTS with `--enable-features=WaylandWindowDecorations --ozone-platform=wayland` flags.

**Rationale**: Electron 28+ ships Chromium with mature Wayland/Ozone support. Running natively on Wayland avoids XWayland artifacts (blurry HiDPI rendering, broken clipboard). Electron exposes the necessary APIs for webview partitioning, media devices, and desktop capture.

**Alternatives considered**:
- Tauri: Lacks `<webview>`-equivalent for embedding full web apps; WebKitGTK has inferior Teams/RocketChat compatibility.
- GTK/Qt native wrapper around a browser engine: Too low-level; no existing webview isolation primitives.

### D2: `<webview>` tags with named partitions for app isolation

**Decision**: Each app/profile combination gets a `<webview>` with a unique `partition` attribute (e.g., `persist:teams-profile-1`, `persist:rocketchat-profile-2`).

**Rationale**: Electron webview partitions provide full session isolation (cookies, localStorage, IndexedDB, cache) per partition string. This ensures credentials and storage for Teams and RocketChat never mix, and multiple accounts per app are fully isolated.

**Alternatives considered**:
- `BrowserView`/`WebContentsView`: More flexible but deprecated path in newer Electron; `<webview>` is simpler for our renderer-side layout needs.
- Separate `BrowserWindow` per app: Heavier weight; harder to integrate into unified sidebar UX.

### D3: PipeWire for audio/video device access

**Decision**: Rely on PipeWire (via the browser's getUserMedia) for microphone/camera access. Electron's Chromium layer communicates with PipeWire through the camera/microphone portal (`org.freedesktop.portal.Camera`, `org.freedesktop.portal.OpenURI`).

**Rationale**: PipeWire is the standard on modern Flatpak/Wayland Linux desktops. WebRTC in Chromium already uses PipeWire when running under Wayland. No additional native code needed.

**Alternatives considered**:
- ALSA/PulseAudio directly: Legacy; PipeWire provides PulseAudio compatibility anyway.
- Custom native module: Unnecessary complexity; the browser stack handles device enumeration.

### D4: xdg-desktop-portal for screen sharing

**Decision**: Use `org.freedesktop.portal.ScreenCast` via xdg-desktop-portal for screen/window capture. Electron's `desktopCapturer` API on Wayland routes through this portal automatically in Chromium 94+/Electron 17+.

**Rationale**: Direct screen capture is not available on Wayland without portal mediation. The portal presents a system picker UI and returns a PipeWire stream. Chromium's `getDisplayMedia` integration handles this transparently.

**Alternatives considered**:
- XWayland screen capture: Falls back to X11 semantics; doesn't work for Wayland-native windows.
- wlroots/wlr-screencopy: Protocol-specific; would require native addon and only works on wlroots compositors.

### D5: Provider plugin model (TypeScript interface)

**Decision**: Define a `CommunicationProvider` TypeScript interface. Each app (Teams, RocketChat) implements it, exporting metadata (name, icon, default URL, webview config, user-agent overrides). The app shell loads providers from a registry.

**Rationale**: Keeps app-specific logic (URL patterns, user agent spoofing for Teams, RocketChat deeplink handling) out of the core shell. New apps can be added by implementing the interface without modifying shell internals.

**Alternatives considered**:
- Hard-coding app logic in shell: Simpler initially but doesn't scale beyond 2 apps.
- Dynamic plugin loading from disk: Over-engineered for current scope; static registry is sufficient.

### D6: Packaging as AppImage (primary) + Flatpak

**Decision**: Use Electron Builder to produce AppImage as the primary distribution format; provide a Flatpak manifest for sandboxed distribution.

**Rationale**: AppImage requires no installation and runs on any Linux distro. Flatpak enables portal-based sandboxing for screen sharing on distributions without ambient xdg-desktop-portal access. Flatpak also handles the PipeWire permission model cleanly.

**Alternatives considered**:
- Snap: xdg-desktop-portal support is inferior in Snap confinement.
- Deb/RPM: Distro-specific; not portable.

## Risks / Trade-offs

- **Teams webview compatibility**: Microsoft Teams web app may detect Electron and degrade features or block login. → Mitigation: Spoof Chrome user agent in the Teams provider; monitor Teams web app changes.
- **PipeWire availability**: Older distros may still use PulseAudio only. → Mitigation: Document minimum distro requirements (Fedora 34+, Ubuntu 22.04+, Arch); PipeWire's PulseAudio compatibility layer covers most cases.
- **xdg-desktop-portal not installed**: Some minimal distros ship without it. → Mitigation: Detect portal availability at startup and show a warning; screen sharing gracefully degrades to "not available."
- **Electron webview security**: Webviews running external content have a larger attack surface. → Mitigation: Enable `contextIsolation`, disable `nodeIntegration` in webviews, use strict CSP in the shell renderer, keep Electron updated.
- **Wayland compositor variance**: KDE Plasma, GNOME, and Sway have slightly different portal implementations. → Mitigation: Test on GNOME (most common) and document known Sway/KDE quirks; use the portal abstraction layer.
- **High memory usage**: Multiple webviews each run a Chromium renderer process. → Trade-off: Accepted; suspend/resume webviews when switching apps to reduce active memory.

## Open Questions

- Should inactive webviews be fully suspended (backgroundThrottling) or kept alive for notifications? → Default to kept alive but throttled; revisit if memory pressure is reported.
- Do we need a custom protocol handler (`comms://`) for deeplinks into specific apps/profiles?
- Should profile data (partitions) be stored in `~/.config/linux-comms` or follow XDG Base Directory spec (`$XDG_CONFIG_HOME`)?
