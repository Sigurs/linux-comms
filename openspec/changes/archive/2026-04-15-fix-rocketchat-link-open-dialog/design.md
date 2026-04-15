## Context

The link-open-choice feature intercepts external link clicks inside webviews and shows the user a dialog to choose between opening in a popup or the system browser. Three interception paths exist:

1. **`window.open()` override** — `INJECTION_SCRIPT` replaces `window.open` in the webview's JS context so any programmatic window-open call is caught immediately. Teams relies on this path.
2. **`new-window` DOM event** — fires on the `<webview>` element in the renderer when the guest page tries to open a new window. Added as a fallback for anchor-based links.
3. **`will-navigate` DOM event** — fires when the guest page navigates the current frame to an external URL. Catches plain `<a href>` clicks without `target="_blank"`.

RocketChat renders message links as `<a href="..." target="_blank" rel="noopener noreferrer">`. These do not call `window.open()` (path 1 misses them) and do not navigate the current frame (path 3 misses them). They should trigger path 2 (`new-window`), but in Electron 41 this event is not reliably emitted for anchor clicks with `rel="noopener"` due to changes in Chromium's site isolation and the deprecation of the legacy `new-window` event path.

## Goals / Non-Goals

**Goals:**
- RocketChat anchor links (`<a target="_blank">`) reliably trigger the link-open dialog.
- Fix works for all providers, not just RocketChat.
- Minimal code surface change — no main-process changes, no new IPC channels.

**Non-Goals:**
- Replacing the `will-navigate` or `new-window` handlers (they remain as secondary coverage).
- Handling links that navigate the current frame without `target="_blank"` (already covered by `will-navigate`).
- Deep investigation of Electron 41's `new-window` deprecation path.

## Decisions

### Add a capture-phase anchor-click interceptor in INJECTION_SCRIPT

**Decision:** Add a `document.addEventListener('click', ..., true)` (capture phase) listener in `INJECTION_SCRIPT` that detects clicks on `<a target="_blank">` elements, calls `preventDefault()` on them, and routes the URL through `lc.openLinkChoice()`.

**Rationale:** This intercepts the link at the JavaScript layer — the same layer where `window.open` is overridden. It runs before the browser's native link-handling code, so it is not affected by Electron's evolving `new-window` event behavior. Capture-phase ensures the listener runs even if the clicked element is a child of `<a>` (e.g., an icon inside a link).

**Alternatives considered:**
- *Fix the `new-window` handler with `setWindowOpenHandler` in the main process*: Requires `did-attach-webview` or `web-contents-created` wiring to correlate the guest WebContents back to a profile ID. More invasive and harder to test.
- *Add `allowpopups` attribute and rely on `new-window`*: `allowpopups` would also allow unintended popup windows if the `new-window` handler fails; adds risk.
- *Rely on the existing `new-window` handler*: Already tried in previous commits; unreliable in Electron 41 for `rel="noopener"` anchors.

**Guard against infinite loops / same-origin clicks:**
The interceptor should only route URLs that are external (different origin from the current page), consistent with how `will-navigate` works. Same-origin anchor clicks that happen to have `target="_blank"` (e.g., internal navigation within a SPA) should be allowed through.

## Risks / Trade-offs

- **SPAs that deliberately use `target="_blank"` for internal routes** → The origin check guards this; internal links pass through unchanged.
- **Right-click → "Open in New Tab" context menu** — context menu actions may not fire the `click` event; they're already covered by the `new-window` and `will-navigate` handlers.
- **`<area target="_blank">` image map elements** — rare, not currently handled by any path; out of scope.

## Migration Plan

Single-file change to `INJECTION_SCRIPT` in `src/renderer/webview-manager.ts`. No migration required — existing webviews pick up the updated script on their next `dom-ready` event.
