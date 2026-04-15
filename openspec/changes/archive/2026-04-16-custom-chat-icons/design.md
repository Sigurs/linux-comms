## Context

The app renders profile entries in a vertical sidebar. Currently each entry shows a hardcoded emoji (🟦 for Teams, 🚀 for RocketChat) sourced from a static `PROVIDER_EMOJI` map in `sidebar.ts`. There is no per-profile differentiation — two RocketChat workspaces look identical.

Profiles are stored in `profiles.json` via `profile-store.ts`. The `Profile` type lives in `shared/types.ts` and is shared between the main process and renderer.

The renderer communicates with the main process exclusively through IPC channels defined in `shared/ipc-channels.ts` and exposed via `shell-preload.ts`.

Webviews have a two-layer injection system: `webview-preload.ts` runs as a preload (contextBridge, isolated world) and exposes `window.__linuxComms`. After dom-ready, `WebviewManager` calls `executeJavaScript` to inject `INJECTION_SCRIPT` into the main world, which calls `window.__linuxComms` methods. `sendToHost` relays events to the renderer's `ipc-message` listener.

## Goals / Non-Goals

**Goals:**
- Store a per-profile icon choice that persists across restarts
- In the picker, show the service's own branding icon first (company logo) as the pre-selected default when detectable
- Provide a curated MIT-licensed SVG icon set (Lucide) as a searchable fallback
- Cover both RocketChat (simple favicon URL) and Teams (DOM-extracted org logo)
- Keep the sidebar rendering lightweight — no heavy frameworks

**Non-Goals:**
- Custom image upload (user-supplied local files)
- Animated icons
- Icon theming / colour overrides
- Syncing icon choices across devices
- Graph API OAuth flow for Teams (too complex; DOM extraction is sufficient)

## Decisions

### D1 — Icon storage format on `Profile`

**Chosen:** `icon?: { type: 'server' | 'library' | 'emoji'; value: string }`

- `type: 'server'` → `value` is the resolved branding icon URL (absolute HTTP/S URL saved at pick time)
- `type: 'library'` → `value` is a Lucide icon name (e.g. `"message-square"`)
- `type: 'emoji'` → `value` is a single emoji character (kept for graceful degradation / future manual emoji entry)

**Why not a bare string?** A typed discriminated union makes rendering logic explicit and avoids fragile URL-vs-name sniffing.

### D2 — Icon library: Lucide (`lucide-static`)

**Chosen:** `lucide-static` npm package (ISC/MIT, ~4 MB unpacked, plain SVG files, no framework dependency).

Why Lucide over alternatives:
- Phosphor Icons — larger package, similar quality
- Heroicons — Tailwind-centric, smaller set
- `react-icons` — pulls in React, overkill for an Electron renderer built without a framework

`lucide-static` ships individual `.svg` files under `icons/`. At build time a script generates a `lucide-index.ts` module (name → inline SVG string) for the curated subset (~50–80 communication/app icons). This keeps the bundle small and avoids runtime file-system reads from the renderer.

### D3 — RocketChat server icon resolution

Attempt to load `{serverUrl}/assets/favicon.png` in an `<img>` element inside the picker. If the `load` event fires the icon is available; if `error` fires it is silently skipped.

Resolution happens client-side in the picker UI — no extra IPC round-trip needed.

### D4 — Teams organisation logo extraction

**Chosen:** DOM injection via the existing `executeJavaScript` mechanism, relayed over the `__linuxComms` bridge.

After the Teams webview fires `dom-ready` and the page title changes (indicating the user is authenticated and the app has rendered), `WebviewManager` injects a small observer script that:

1. Waits for the org logo element to appear in the DOM using `MutationObserver` (up to 10 s timeout)
2. Tries a priority-ordered list of selectors (e.g. `[data-testid*="org"] img`, `header img[src*="tenant"]`, and fallback broad selectors for `<img>` in `<header>`)
3. Reads the `src` attribute; if it's a relative URL, resolves it against `location.origin`
4. Calls `window.__linuxComms.reportOrgLogo(resolvedUrl)` which relays it via `ipcRenderer.sendToHost('org-logo-found', url)`
5. The renderer's `ipc-message` handler on the webview caches the URL in a `Map<profileId, string>` and makes it available to the picker

The cached URL (not a data URL) is stored in-memory only — not persisted — because the webview session always reloads on restart.

**Why not Graph API?** Requires tenant discovery and a separate OAuth flow. The Teams web app already authenticates; DOM extraction reuses that session without additional credentials.

**Why not `page-favicon-updated`?** Electron's `page-favicon-updated` event on a webview fires with the page's generic favicon (the Microsoft Teams icon), not the organisation logo.

**Fragility mitigation:** Selectors are tried in priority order; if all fail, the company logo row is simply not shown. The Teams DOM structure does change between Teams updates, but the org logo is a prominent UI element unlikely to disappear entirely.

### D5 — Picker UI and priority order

A modal overlay within the main renderer (`index.html`). Triggered from the context menu ("Change Icon…"). Three sections displayed in order:

1. **Company Logo** (shown when a branding icon was detected for the profile) — pre-selected if no icon is saved yet
2. **Icon Library** — searchable grid of Lucide SVGs; pre-selected if company logo unavailable and no icon saved
3. *(Provider emoji is the implicit fallback when no icon is set — not shown as a picker option)*

The picker calls the new IPC handler `updateProfileIcon(profileId, icon)` on confirm.

### D6 — Sidebar rendering

Replace `<span class="profile-icon">${emoji}</span>` with a `renderIcon(profile, provider)` helper that returns:
- An `<img src="...">` for `type: 'server'`
- An inline SVG string (from the bundled manifest) for `type: 'library'`
- An emoji `<span>` when `profile.icon` is absent or `type: 'emoji'`

## Risks / Trade-offs

**Teams selectors break on app update** → Mitigated by a multi-selector fallback list and a hard timeout; failure is silent (no company logo row shown). Users can still pick a library icon.

**Server icon URL becomes stale** → The stored URL is used for sidebar rendering; the picker always re-resolves the live URL at open time. Low impact — stale URLs just show a broken image in the sidebar until the user re-opens the picker.

**`lucide-static` package size** → Mitigated by bundling only a curated subset (~80 icons × ~1 KB SVG ≈ 80 KB uncompressed, negligible after gzip).

**Profile data migration** → The new `icon` field is optional; existing profiles without it continue to render the provider emoji.

## Migration Plan

1. Deploy: the new `icon` field is opt-in. Existing profiles are unaffected at startup.
2. Rollback: removing the field from `Profile` requires a one-line store change; stored `icon` values are simply ignored if the field is removed.

## Open Questions

- Should a `reportOrgLogo` call from a Teams webview update the *stored* icon automatically (without user opening the picker), or only pre-populate the picker? → Recommendation: only pre-populate; the user should confirm their icon choice.
- Should we support a plain colour-dot or initials fallback when no icon is set and the provider emoji feels wrong? → Deferred, out of scope for v1.
