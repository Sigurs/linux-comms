## Why

RocketChat (and any standard web app) uses the Page Visibility API (`document.visibilityState`, `document.hidden`, and the `visibilitychange` event) to decide when to increment unread counts in the page title. Because all webviews always report `visibilityState = 'visible'` — regardless of which profile is active — RocketChat never accumulates unread counts, never updates the page title with the `(N) ...` prefix, and the sidebar badge never appears.

Teams is unaffected because it tracks unread state server-side and pushes title updates to the client independently of the Visibility API.

## What Changes

- Override `document.visibilityState` and `document.hidden` in the webview injection script, backed by a controllable variable
- Expose `window.__linuxCommsSetHidden(hidden: boolean)` in the injection script so the renderer can flip the visibility state and dispatch a `visibilitychange` event
- In `WebviewManager.switchTo()`, call `executeJavaScript` to mark the departing webview as hidden and the arriving webview as visible
- On `dom-ready`, if this webview is not the active profile, immediately mark it as hidden

## Capabilities

### New Capabilities

_(none)_

### Modified Capabilities

- `notifications`: The existing badge requirement already covers all providers — this is a bug fix to make it work correctly for web-first providers that rely on the Page Visibility API

## Impact

- `src/renderer/webview-manager.ts` — injection script gets Visibility API override; `switchTo()` and `dom-ready` handler get `executeJavaScript` calls to toggle visibility state
