## Why

A previous change (fix-rocketchat-badge) attempted to fix RocketChat badge counts by overriding the Page Visibility API via `Object.defineProperty` on the `document` instance. The fix is in place but DMs and highlights still do not produce sidebar badge counts. The override likely silently fails in Chromium 130 because `document.hidden` and `document.visibilityState` may be non-configurable own properties on the document instance, and/or RocketChat also gates badge accumulation on `document.hasFocus()` which was not overridden.

## What Changes

- Replace the `Object.defineProperty(document, ...)` instance-level approach with prototype-chain overrides (`Document.prototype`), which are reliably configurable in Blink
- Additionally override `document.hasFocus()` to return `false` when the webview is marked hidden, closing a second signal RocketChat may use
- Dispatch the `visibilitychange` event with `bubbles: false` (correct per spec) to ensure RocketChat's event listener fires
- Add a provider-aware Notification-based badge fallback: when a `new Notification()` is intercepted from a RocketChat webview while it is hidden, increment the badge counter via the existing `reportBadge` IPC path, clearing on profile switch

## Capabilities

### New Capabilities

_(none)_

### Modified Capabilities

- `notifications`: The badge-on-title requirement must also be satisfiable via Notification interception for providers (like RocketChat) that may not reliably update the page title when the Visibility API override is not fully effective.

## Impact

- `src/renderer/webview-manager.ts` — update INJECTION_SCRIPT: swap instance `Object.defineProperty` for `Document.prototype` overrides, add `hasFocus` override, fix `visibilitychange` event options, add notification-count tracking via `lc.reportBadge`; clear badge on `switchTo()`
