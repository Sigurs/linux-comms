## Why

RocketChat links in messages do not trigger the Open Link dialog — they are silently dropped. Teams works because its links call `window.open()`, which is intercepted by a JavaScript override injected into the webview. RocketChat renders message links as `<a href="..." target="_blank" rel="noopener noreferrer">` anchor elements; clicking these does not call `window.open()` and instead relies on the webview's `new-window` DOM event, which does not fire reliably in Electron 41 for anchors with `rel="noopener"`.

## What Changes

- Add a capture-phase `click` event listener in `INJECTION_SCRIPT` (inside `webview-manager.ts`) that intercepts `<a target="_blank">` anchor clicks and calls `lc.openLinkChoice()` instead of letting the browser process the navigation — mirroring the existing `window.open` override approach.
- Remove reliance on the `new-window` webview DOM event for anchor-based link opening (the event handler can stay as a secondary fallback but is not the primary mechanism).

## Capabilities

### New Capabilities
<!-- none -->

### Modified Capabilities
- `link-open-choice`: The capability must now cover anchor-click links (`<a target="_blank">`) as a first-class trigger path, not just `window.open()` and webview `new-window` events.

## Impact

- `src/renderer/webview-manager.ts` — `INJECTION_SCRIPT` string gets a new click listener; no structural changes elsewhere.
- No new dependencies, no IPC changes, no main-process changes.
- All providers benefit (Teams, RocketChat, and any future provider that renders external links as `<a target="_blank">`).
