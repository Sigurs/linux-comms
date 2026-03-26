# Linux Comms

A unified Electron-based desktop client for Linux hosting multiple communication apps (Microsoft Teams, Rocket.Chat) with full voice/video, screen sharing, and Wayland support.

## Features

- **Multiple providers**: Microsoft Teams and Rocket.Chat in one window
- **Profile isolation**: Multiple accounts per app, fully isolated sessions
- **Wayland-native**: Runs on Wayland via Ozone backend; falls back to X11
- **Voice & video calls**: Powered by PipeWire / PulseAudio via WebRTC
- **Screen sharing**: xdg-desktop-portal on Wayland; desktopCapturer picker on X11
- **Native notifications**: Bridged from webview to OS notifications
- **System tray**: Minimize to tray, unread activity indicator

## Requirements

Linux 5.15+ with a Wayland compositor (GNOME 42+, KDE Plasma 5.27+, or Sway 1.8+). Screen sharing requires PipeWire 0.3.48+ and xdg-desktop-portal 1.15+. Node.js 20 LTS+ for building.

## Installation

**AppImage:**

```bash
chmod +x LinuxComms-*.AppImage
./LinuxComms-*.AppImage
```

**Flatpak (recommended for screen sharing):**

```bash
flatpak install io.sigurs.LinuxComms
flatpak run io.sigurs.LinuxComms
```

## Building

```bash
npm install
npm start              # Development
npm run dist:appimage  # Build AppImage
npm run dist:flatpak   # Build Flatpak
```

Generate icons before packaging:

```bash
for s in 16 32 48 64 128 256 512; do
  magick -background none -resize ${s}x${s} assets/icon.svg assets/icons/${s}x${s}.png
done
```

## Wayland

Auto-detected via `WAYLAND_DISPLAY`. Screen sharing requires:

- GNOME: `xdg-desktop-portal-gnome`
- KDE: `xdg-desktop-portal-kde`
- Sway/Hyprland: `xdg-desktop-portal-wlr`

## Known Issues

- Screen sharing unavailable on Sway < 1.8 — upgrade or use xdg-desktop-portal-wlr
- Teams login loop with some corporate SSO — remove and re-add profile
- Blurry rendering on XWayland — ensure `WAYLAND_DISPLAY` is set

## Disclaimer

This is an independent hobby project with no affiliation with Microsoft or Rocket.Chat. All trademarks, service marks, and intellectual property belong to their respective owners.

## License

MIT
