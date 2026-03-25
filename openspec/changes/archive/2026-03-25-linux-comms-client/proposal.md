## Why

Linux users working in enterprise or community environments lack a native, well-integrated client that supports multiple communication platforms (Teams, RocketChat) with full feature parity—including voice/video calls and screen sharing—and proper Wayland support. Existing solutions are either web-only, broken on Wayland, or require running separate apps for each service.

## What Changes

- Introduce a new Electron-based desktop application targeting Linux (Wayland + XWayland)
- Multi-app container: embed Teams and RocketChat as isolated webviews with per-app profiles
- Support voice/video calling and screen sharing via Electron's media APIs and PipeWire integration
- Unified sidebar for switching between apps and managing multiple accounts/profiles per app
- System tray integration, desktop notifications, and OS-level audio/video device management

## Capabilities

### New Capabilities

- `app-shell`: Top-level Electron application shell with sidebar navigation, system tray, and app lifecycle management
- `app-provider`: Plugin-style provider model for adding communication apps (Teams, RocketChat); each provider wraps a webview with app-specific configuration
- `profile-management`: Per-app account/profile management supporting multiple simultaneous profiles
- `media-calling`: Voice and video call support using Electron media APIs with PipeWire/PulseAudio integration on Linux
- `screen-sharing`: Screen and window capture for sharing during calls, with Wayland portal support (xdg-desktop-portal)
- `notifications`: Native Linux desktop notifications (libnotify/D-Bus) bridged from webview content
- `wayland-support`: Wayland-first configuration with proper flags, Ozone platform, and portal integrations

### Modified Capabilities

## Impact

- **New project**: No existing codebase; greenfield Electron app
- **Dependencies**: Electron (latest LTS), Electron Builder (packaging), PipeWire/PulseAudio (audio/video), xdg-desktop-portal (screen sharing on Wayland), libnotify (notifications)
- **Platforms**: Linux only (Wayland primary, XWayland fallback)
- **Distribution**: AppImage and/or Flatpak packaging
