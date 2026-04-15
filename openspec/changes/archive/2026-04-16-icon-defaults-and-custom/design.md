## Context

`chat-icon-customization` was implemented with a `PROVIDER_EMOJI` map in `sidebar.ts` as the fallback when a profile has no saved icon. This means a freshly added profile shows emoji (🚀, 🟦) until the user explicitly picks something else. The Lucide icons `rocket` (for Rocket.Chat) and `users-round` (for Teams) are already in the bundled `lucide-index.ts`, so no new build-time work is needed.

`ProfileIcon.type` currently supports `'server' | 'library' | 'emoji'`. The `'emoji'` type was intended as a future option for manually entering an emoji; it was never exposed in the picker UI and exists only in the type union and `renderIcon`'s fallback chain.

## Goals / Non-Goals

**Goals:**
- Replace the emoji fallback in `renderIcon` with a provider-keyed Lucide icon lookup
- Extend `ProfileIcon.type` with `'custom'` for user-supplied image URLs
- Add a Custom URL section to the picker (text input + live preview)
- Keep backwards compatibility: stored `type: 'emoji'` values render the provider Lucide default instead of crashing

**Non-Goals:**
- Local file upload / drag-and-drop image import
- Icon colour customisation
- Removing `'emoji'` from the TypeScript type union (kept for stored-data compatibility)

## Decisions

### D1 — Provider default icon map (Lucide names, not emoji)

Replace `PROVIDER_EMOJI: Record<string, string>` with `PROVIDER_DEFAULT_ICON: Record<string, string>` mapping provider ID → Lucide icon name:

```
rocketchat → 'rocket'
teams      → 'users-round'
(fallback) → 'message-circle'
```

`renderIcon` falls back to `lucideIndex[PROVIDER_DEFAULT_ICON[providerId] ?? 'message-circle']` when `profile.icon` is absent or deprecated (`type: 'emoji'`).

**Why not keep emoji?** Emoji rendering is font-dependent, varies across Linux distributions, and looks inconsistent at small sidebar sizes. Lucide SVGs scale perfectly and inherit CSS colour.

**Alternative considered:** Using a data URL of a bundled PNG per provider — rejected as heavier and less themeable than SVG.

### D2 — `'custom'` type for user-supplied URLs

Add `'custom'` to the `ProfileIcon` type union. Distinct from `'server'` (auto-detected branding logo) to allow different UX in the picker: `'server'` pre-selects the company logo tile; `'custom'` pre-fills the Custom URL input. Both render as `<img>` in the sidebar.

**Why not reuse `'server'`?** The picker needs to know whether the saved URL came from auto-detection (should show in the company logo tile) or manual entry (should restore into the text input). Conflating them forces fragile URL-matching heuristics.

### D3 — Custom URL section in the picker

A third section below Company Logo and Icon Library:
1. A labelled text `<input type="url">` for the image URL
2. A small `<img>` preview that appears once the URL loads (hidden on error)
3. The section is always visible — the input starts empty unless a `type: 'custom'` icon is already saved, in which case the URL is pre-filled and the preview shown

Validation: only require that the `<img>` `load` event fires before the user can confirm. No server-side fetch or MIME-type check.

## Risks / Trade-offs

**Stored `type: 'emoji'` data** → Treated as absent: renders provider Lucide default. No data migration needed; worst case is the user sees a different (better) icon on next launch.

**Custom URL points to HTTP (not HTTPS)** → The renderer CSP already allows `img-src https:` only. HTTP URLs will silently fail to load; the preview stays hidden and the Confirm button stays enabled (user may not notice). Acceptable for v1 — the preview's failure is a sufficient signal.

**Teams / RocketChat default icon "wrong" for a specific workspace** → The user can immediately override via "Change Icon…". The Lucide default is still better than a mismatched emoji.

## Migration Plan

No migration script needed. `Profile.icon` is optional; absent or `type: 'emoji'` both fall through to the new Lucide default. Existing saved `type: 'server'` and `type: 'library'` icons continue to work unchanged.
