## Context

The link-choice dialog is powered by two mechanisms:

1. **JS override** (`INJECTION_SCRIPT`): overrides `window.open()` in the webview's main world via `executeJavaScript`. This fires `lc.openLinkChoice(url)` → `ipcRenderer.sendToHost('link-open-request')` → renderer handles it → `electronAPI.openLinkChoice`.
2. **`new-window` webview event**: Electron fires this natively when a page triggers a new window via an HTML anchor with `target="_blank"`. It is NOT intercepted by the JS override.

Teams uses `window.open()` → mechanism 1 works. RocketChat uses `<a target="_blank">` → mechanism 2 is needed but unhandled, so clicks are silently discarded.

## Goals / Non-Goals

**Goals:**
- Intercept Electron's native `new-window` event on webview elements and route through the existing `openLinkChoice` IPC path

**Non-Goals:**
- Changing the dialog UI or IPC protocol
- Handling `will-navigate` (same-page navigation) — RocketChat navigates within its SPA; only genuine new-window requests are in scope

## Decisions

**Add `new-window` event listener in `WebviewManager.ensureWebview()`**

Rationale: All webview construction happens in one place. Adding the listener there ensures consistent behavior across all providers. The event exposes `url` directly, so no additional logic is needed — just call `window.electronAPI.openLinkChoice(url, profile.id)`, the same path used by the IPC handler today.

Alternative considered: Handle at main-process level via `webContents.setWindowOpenHandler`. Not viable here because the webview elements live in the renderer process, and `setWindowOpenHandler` applies to top-level `BrowserWindow` webContents, not embedded `<webview>` guest content.

## Risks / Trade-offs

- **Double-firing**: If a page calls `window.open()` AND also triggers `new-window` (unlikely but theoretically possible), two dialogs could appear. Mitigation: the JS `window.open()` override returns `null` immediately, which prevents Chromium from propagating the `new-window` event — so in practice these two paths are mutually exclusive.
- **Electron API deprecation**: The `new-window` event on `<webview>` was deprecated in favour of `webContents.setWindowOpenHandler` in some Electron versions. For embedded `<webview>` in a renderer, `new-window` remains the correct approach in the version this project uses.
