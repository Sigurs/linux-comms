## Context

The badge system relies on `page-title-updated` events: when a provider updates the page title to `(N) ...`, the renderer parses the count and updates the sidebar badge. For this to work, RocketChat must accumulate unread counts in the title, which it only does when `document.visibilityState === 'hidden'`.

A prior change (fix-rocketchat-badge) added a Page Visibility API override in `INJECTION_SCRIPT` using `Object.defineProperty(document, 'hidden', ...)` and `Object.defineProperty(document, 'visibilityState', ...)`. This approach was implemented and deployed but DMs and highlights still produce no badge.

Two probable failure modes:

1. **Instance-level `Object.defineProperty` silently fails.** In Chromium 130 (Electron 41), `document.hidden` and `document.visibilityState` are defined as getter attributes on `Document.prototype`, not as own properties of the document instance. Attempting to redefine them on the instance may throw a TypeError (caught and swallowed by the `try/catch`) because the property might be present as a non-configurable interceptor at the instance level in Blink's V8 bindings.

2. **`document.hasFocus()` not overridden.** RocketChat (and other Meteor/web apps) may check `document.hasFocus()` in addition to or instead of `visibilityState` to decide whether to suppress badge accumulation. Even with `visibilityState = 'hidden'`, if `hasFocus()` returns `true` for the embedded webview, RocketChat considers the user present and does not increment the unread count.

Additionally, as a defence-in-depth fallback that is independent of RocketChat's title-update logic: we already intercept every `new Notification()` call from the webview. For hidden webviews we can increment a local notification counter and report it via `lc.reportBadge()`, clearing it on profile switch.

## Goals / Non-Goals

**Goals:**
- Make the Page Visibility API override reliable in Chromium 130 by overriding on `Document.prototype` instead of the instance
- Override `document.hasFocus()` to return `false` when the webview is marked hidden
- Add notification-interception badge counting as a secondary signal for providers that may not update the title reliably
- Keep all changes self-contained in `webview-manager.ts` (INJECTION_SCRIPT only)

**Non-Goals:**
- Changing sidebar rendering or badge display (already correct)
- Modifying Teams behavior (already works via server-side title updates)
- Adding new IPC channels or preload changes

## Decisions

**Prototype-chain override instead of instance override**

Replace:
```js
Object.defineProperty(document, 'hidden', { get: ... });
Object.defineProperty(document, 'visibilityState', { get: ... });
```

With a prototype-walk that finds the descriptor owner and redefines it there:
```js
function overrideDocProp(name, getFn) {
  let proto = document;
  while (proto && !Object.getOwnPropertyDescriptor(proto, name)) {
    proto = Object.getPrototypeOf(proto);
  }
  if (proto) {
    Object.defineProperty(proto, name, { get: getFn, configurable: true });
  }
}
overrideDocProp('hidden', function() { return _hidden; });
overrideDocProp('visibilityState', function() { return _hidden ? 'hidden' : 'visible'; });
```

This targets the actual owner in the prototype chain (usually `Document.prototype` in Blink), where the descriptor is `configurable: true`, and redefines it in-place — no risk of a "redefine own property" TypeError.

**Override `document.hasFocus()` when hidden**

Store the original `hasFocus` and replace it:
```js
var _origHasFocus = document.hasFocus.bind(document);
document.hasFocus = function() { return _hidden ? false : _origHasFocus(); };
```

This ensures RocketChat's focus guard agrees with the visibility state.

**Notification-interception badge counting**

The existing `MockNotif` already calls `lc.sendNotification()`. Add a counter for the hidden state:
```js
// In MockNotif constructor (already intercepts all Notifications):
if (_hidden) {
  _notifCount++;
  lc.reportBadge(_notifCount);
}
```

On `__linuxCommsSetHidden(false)` (profile becomes active), reset `_notifCount = 0` and call `lc.reportBadge(0)` — the title-based clearing already does this via `switchTo()` but this makes the reset explicit for the notification path.

This path is intentionally additive: if the title-based path already works after the prototype fix, both paths fire but produce the same result (title provides the authoritative count; the notification counter acts as a floor).

**`visibilitychange` event options**

Dispatch with `{ bubbles: false }` to match the spec: the `visibilitychange` event does not bubble. This is a minor correctness fix with no practical impact for RocketChat but avoids surprising ancestor listeners.

## Risks / Trade-offs

- **Prototype mutation is global to the webview context.** Overriding `Document.prototype.hidden` affects all `document` access in the page, including RocketChat's own framework code. This is intentional — and is the same effect we want — but is more impactful than instance overrides. If RocketChat upgrades and adds internal checks that conflict, the behaviour may need revisiting.
- **Notification counter vs. title counter divergence.** If both paths are active and RocketChat also updates the title, the sidebar may show the title-based count (more accurate) or the notification-based count (simpler increment), whichever fires last via `onBadgeChange`. Since `page-title-updated` fires after the title is set and carries the authoritative total, it will overwrite the notification counter. This is acceptable.
- **Notification count not persisted across reloads.** If the webview reloads, `_notifCount` resets to 0 and the title-based path takes over. This is consistent with existing behavior.
