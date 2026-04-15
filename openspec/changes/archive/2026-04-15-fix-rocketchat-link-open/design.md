## Context

Electron `<webview>` elements fire different events depending on how a navigation originates:

| User action | Event fired |
|---|---|
| `window.open(url)` | `new-window` (already handled via JS injection) |
| `<a href="..." target="_blank">` | `new-window` (already handled) |
| `<a href="...">` (no target) | `will-navigate` — **not handled** |
| Right-click → Open Link | `will-navigate` — **not handled** |

The `will-navigate` event on a webview is cancelable via `event.preventDefault()` from the renderer process. We can intercept it, prevent the navigation, and invoke `openLinkChoice` instead.

We must not intercept *internal* navigation (SPA route changes within the RocketChat server itself), so we compare origins: if the navigating URL's origin differs from the profile's configured server URL origin, it is external and should be intercepted.

## Goals / Non-Goals

**Goals:**
- Intercept external `will-navigate` events and route them through `openLinkChoice`
- Preserve internal SPA navigation within the provider (same-origin URLs pass through unchanged)

**Non-Goals:**
- Changing how `new-window` or `window.open` links are handled (already working)
- Provider-specific logic — the handler is generic and applies to all providers

## Decisions

**Decision: Compare origins, not full URLs.**

Rationale: RocketChat is a SPA. Internal navigation (e.g. switching rooms) changes the pathname within the same origin. Comparing only the origin (protocol + host + port) correctly distinguishes internal from external navigations without needing per-provider configuration.

Alternative: compare with `profile.url` prefix string match. Rejected — fragile if the URL has a trailing slash or the SPA changes the path format.

**Decision: Cancel navigation and call `openLinkChoice`.**

Rationale: `event.preventDefault()` on `will-navigate` cancels the navigation atomically in the renderer. This is simpler than handling it in the main process and keeps the logic collocated with the other webview event handlers.

## Risks / Trade-offs

- [Same-origin external link is misclassified as internal] → Unlikely: external services virtually never share the RocketChat server's origin. No mitigation needed.
- [Infinite loop if `openLinkChoice` triggers another navigation] → Not possible: the dialog opens a separate BrowserWindow or system browser; the webview is not involved.
