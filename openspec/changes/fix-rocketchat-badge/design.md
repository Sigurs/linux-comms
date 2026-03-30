## Context

The badge system works by listening for `page-title-updated` events on each webview and parsing the `(N)` prefix from the title. Web apps like RocketChat only add this prefix when `document.visibilityState === 'hidden'` — they consider the page "visible" and mark messages as read immediately. Because Electron webviews always report `visibilityState = 'visible'`, non-active webviews never accumulate unread counts.

Teams is immune: it synchronises unread state server-side and forces title updates regardless of the Visibility API.

The Page Visibility API surface that needs overriding:
- `document.visibilityState` — `"visible"` or `"hidden"`
- `document.hidden` — `true` when hidden
- `visibilitychange` event — dispatched when state changes

All three must be controlled to satisfy web apps that check any combination of these.

## Goals / Non-Goals

**Goals:**
- Override the Page Visibility API in each webview via the existing `INJECTION_SCRIPT` mechanism
- Toggle visibility state from the renderer when profiles are switched, newly loaded, or popped out
- Keep the solution self-contained in `webview-manager.ts` with no new IPC channels or preload changes

**Non-Goals:**
- Changing how badge counts are rendered in the sidebar (already correct)
- Handling providers that don't use page title for unread counts (e.g., favicon-only updates) — this fix handles the common `(N) title` pattern
- Modifying Teams behaviour (it already works)

## Decisions

**Use `executeJavaScript` to toggle visibility state from the renderer**

The renderer already calls `executeJavaScript` after `dom-ready` to inject the profile ID and the INJECTION_SCRIPT. Extending this pattern to control visibility state requires no new IPC, no preload changes, and no inter-process round trips.

The injection script exposes `window.__linuxCommsSetHidden(hidden: boolean)`, which:
1. Updates a module-level `_hidden` variable
2. Redefines `document.visibilityState` and `document.hidden` (using `Object.defineProperty` so they're always read from the live variable)
3. Dispatches a `visibilitychange` event on `document`

Toggle points in `WebviewManager`:
- `dom-ready`: if this webview is NOT the active profile, immediately call `__linuxCommsSetHidden(true)`
- `switchTo()`: call `__linuxCommsSetHidden(true)` on the departing webview, `__linuxCommsSetHidden(false)` on the arriving webview

**Alternative considered: preload-based IPC listener**

Could listen for a `set-visibility` IPC message in the webview preload and use `ipcRenderer.on` to update state. Rejected — requires preload changes and an additional IPC round-trip. The `executeJavaScript` approach achieves the same result with less complexity.

## Risks / Trade-offs

- **Redefining `document.visibilityState` on a live document**: `Object.defineProperty` with `configurable: true` is safe and widely used. Web apps that snapshot the value at startup instead of reading it dynamically won't respond — but those apps wouldn't respond to `visibilitychange` either, so this is an inherent limitation of the approach rather than a regression.
- **Timing**: the injection runs after `dom-ready`. If a page registers its `visibilitychange` listener before `dom-ready`, our override is in place before the first user interaction. If the app loads lazily, the override is still in place from the moment the injection runs.
- **Pop-out windows**: when a profile is popped out, `WebviewManager` hides the embedded webview and clears `activeProfileId`. These webviews should be marked hidden; the existing `popOut()` path already hides the webview — we need to also call `__linuxCommsSetHidden(true)` there.
