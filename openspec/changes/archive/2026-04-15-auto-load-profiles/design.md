## Context

The renderer already calls `webviewManager.ensureWebview(profile)` for every profile at startup (with a comment "load in background"), but inactive webviews have `display: none` applied via CSS. Electron's `<webview>` element does not load its content when `display: none` — loading only begins once the element becomes visible. This is why each profile appears empty until the user first clicks it.

The layout uses `position: absolute; inset: 0` for all webviews, so they naturally stack. There is no need to restructure the DOM — only the visibility technique needs to change.

## Goals / Non-Goals

**Goals:**
- All profiles start loading immediately on app startup, in the background
- The active profile is displayed as before; inactive ones load silently
- Inactive webviews remain non-interactive (no accidental pointer capture)

**Non-Goals:**
- Lazy/deferred loading, loading priority, or cancellation
- Any change to how profiles are added, removed, or ordered

## Decisions

**Replace `display: none` with `visibility: hidden` + `pointer-events: none` for inactive webviews**

`visibility: hidden` hides the element visually but keeps it in the layout and — critically — does not prevent Electron `<webview>` elements from loading. `pointer-events: none` ensures hidden webviews don't capture clicks or hover events.

Alternatives considered:
- `opacity: 0` — also keeps the element loading, but doesn't suppress pointer events by default; requires an extra `pointer-events: none` rule and leaves the element in the accessibility tree as visible.
- `position: absolute; left: -9999px` — off-screen trick; works but is fragile with absolute-positioned layouts and doesn't scale cleanly when window resizes.

**No JS changes required**

`initWebviews()` already iterates all profiles and calls `ensureWebview()`. The webview-manager's `dom-ready` handler already calls `__linuxCommsSetHidden(true)` for non-active profiles, so visibility tracking is correct. Only the CSS needs updating.

## Risks / Trade-offs

- **Memory/CPU at startup**: All webviews load simultaneously instead of on-demand. On a low-end machine with many profiles, this could increase startup time or memory use. Acceptable trade-off for a communication app where all profiles are expected to be in use.
- **`visibility: hidden` vs `display: none` in accessibility trees**: Hidden webviews remain in the layout box model. This is fine since they are behind the active webview spatially and have `pointer-events: none`.
