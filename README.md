# 🎯 Linux Comms

<span style="color:#4CC9F0">**Unified Linux Desktop Client for Teams & Rocket.Chat**</span>

A modern, Wayland-native Electron application that brings Microsoft Teams and Rocket.Chat together in a single, integrated desktop experience with full voice/video and screen sharing support.

## ⚡ Key Features

### 🔄 **Multi-Provider Integration**

- ✅ Microsoft Teams and Rocket.Chat in one window
- ✅ Seamless switching between platforms
- ✅ Unified notification system

### 👤 **Profile Management**

- ✅ Multiple accounts per platform
- ✅ Complete session isolation
- ✅ Easy profile switching

### 🖥️ **Wayland Native**

- ✅ Full Wayland support via Ozone backend
- ✅ Automatic X11 fallback
- ✅ Native screen sharing on Wayland

### 🎤 **Advanced Communication**

- ✅ Voice & video calls (WebRTC)
- ✅ Screen sharing (PipeWire/xdg-desktop-portal)
- ✅ Native system notifications

### 💼 **System Integration**

- ✅ System tray with unread indicators
- ✅ Native Linux notifications
- ✅ Proper window management

## 📦 Installation

### AppImage (Recommended)

```bash
# Download the latest AppImage from releases
chmod +x Linux-Comms-*.AppImage
./Linux-Comms-*.AppImage
```

### Flatpak

```bash
# Coming soon - Flatpak build available in future releases
```

## 🚀 Usage

1. **Add your first profile**: Click "Add Profile" and select Teams or Rocket.Chat
2. **Sign in**: Complete the authentication process in the webview
3. **Switch profiles**: Use the sidebar to navigate between accounts
4. **System tray**: Minimize to tray for quick access

## 🛠️ Building from Source

### Requirements

- Linux 5.15+ (Wayland recommended)
- Node.js 20+ LTS
- PipeWire 0.3.48+ (for screen sharing)
- xdg-desktop-portal 1.15+

### Build Commands

```bash
# Install dependencies (without optional packages)
npm install --no-optional

# Development mode
npm start

# Build AppImage
npm run dist:appimage
```

### Dependency Management

This project follows strict dependency management practices:
- Optional dependencies are excluded by default
- Platform-specific dependencies are minimized for Linux targets
- See [DEPENDENCIES.md](DEPENDENCIES.md) for full documentation

To add new dependencies:
```bash
npm install --save-exact --no-optional <package>
```

## 🔧 Technical Details

### Architecture

- **Frontend**: Electron with React-based UI
- **Backend**: Node.js with custom IPC channels
- **Webviews**: Isolated sessions for each profile
- **Platform**: Wayland (Ozone) with X11 fallback

### Supported Platforms

- **Wayland**: GNOME 42+, KDE Plasma 5.27+, Sway 1.8+
- **X11**: Full fallback support
- **Screen Sharing**: xdg-desktop-portal integration

## ⚠️ Important Notes

<span style="color:#F72585">**Personal Project Disclaimer**</span>

This is an **independent hobby project** with **no affiliation** to:

- Microsoft Corporation
- Rocket.Chat Technologies Corp.
- Any other official communication platforms

All trademarks, service marks, and intellectual property belong to their respective owners. This project is developed purely for personal use and experimentation.

### Known Limitations

- Some corporate SSO flows may require manual intervention
- Screen sharing requires proper xdg-desktop-portal setup
- Wayland performance depends on compositor capabilities

## 🤝 Contributing

While this is primarily a personal project, contributions are welcome:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📜 License

<span style="color:#4361EE">MIT License</span> © 2026 sigurs

See [LICENSE](LICENSE) for full details.

---

<span style="color:#7209B7">Made with ❤️ for Linux users who want unified communication</span>
