## Context

`BrowserWindow` accepts an `icon` option (path string or `NativeImage`) that sets the window icon on Linux. When omitted, Electron falls back to its bundled default, which on Wayland-enabled systems appears as the Wayland logo.

The tray already resolves icons via `join(__dirname, '../../assets/icons/16x16.png')`, confirming the relative path from the compiled `dist/main/` output directory. The same pattern applies for window icons.

## Goals / Non-Goals

**Goals:**
- Show the app icon in the title bar, taskbar, and window switcher for the main window and all pop-out windows

**Non-Goals:**
- Changing the tray icon (already working)
- Packaging or generating new icon assets

## Decisions

**Use `256x256.png` for window icons**

Window icons on Linux are typically displayed at 16–128 px. A 256×256 PNG is a good default — large enough for HiDPI, supported by all compositors, and already present in `assets/icons/`. The 512×512 asset is unnecessarily large for this purpose.

**Reuse the same `join(__dirname, ...)` pattern as the tray**

This is already established in the codebase and resolves correctly from the compiled output path.

## Risks / Trade-offs

None. Setting `icon` on `BrowserWindow` is a standard, well-supported Electron option with no side effects.
