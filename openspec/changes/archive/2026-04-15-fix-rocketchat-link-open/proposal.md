## Why

Links in RocketChat that use plain `<a href>` anchors (no `target="_blank"`) are not intercepted by the existing link-open dialog. The previous fix (commit 9c48993) only added a `new-window` handler, which fires for `target="_blank"` links. Regular anchor clicks fire `will-navigate` on the webview instead — the webview navigates away silently without prompting the user.

## What Changes

- Add a `will-navigate` event listener on each webview that intercepts external URLs (origin differs from the profile's configured server URL), cancels the navigation, and routes the URL through the existing `openLinkChoice` dialog
- This covers: plain `<a href>` clicks and right-click → "Open Link" context menu actions in RocketChat

## Capabilities

### New Capabilities

_(none)_

### Modified Capabilities

- `link-open-choice`: The dialog must now also trigger for `will-navigate` events on webviews, not only for `window.open()` calls and `new-window` events

## Impact

- `src/renderer/webview-manager.ts`: add `will-navigate` handler inside `ensureWebview`
- No IPC, API, or spec schema changes
- Applies to all providers, but primarily fixes RocketChat
