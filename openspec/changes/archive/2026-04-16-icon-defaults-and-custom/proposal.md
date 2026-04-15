## Why

The emoji fallback (🟦, 🚀, 💬) for provider icons looks out of place alongside the crisp Lucide SVGs chosen via the picker, and gives the app a low-fidelity feel on first launch before a user has customised anything. Additionally, power users need an escape hatch to use any image they like — not just server-detected logos or the curated library.

## What Changes

- Replace the per-provider emoji defaults with provider-specific Lucide icons: `rocket` for Rocket.Chat, `users-round` for Teams, `message-circle` as the generic fallback
- Remove the `PROVIDER_EMOJI` map and the `type: 'emoji'` branch in `ProfileIcon` (no longer needed as a persisted type)
- Add a "Custom URL" section at the bottom of the icon picker: a text input where the user pastes any image URL; a live `<img>` preview appears once the URL resolves
- Persist custom URL icons as `{ type: 'custom', value: url }`; add `'custom'` to the `ProfileIcon` type union
- `type: 'emoji'` kept in the type union for backwards compatibility with any stored data but treated the same as absent (renders the provider Lucide default)

## Capabilities

### New Capabilities

_(none)_

### Modified Capabilities

- `chat-icon-customization`: Fallback rendering changes from provider emoji to provider-specific Lucide icon; picker gains a Custom URL input section; `ProfileIcon.type` gains `'custom'`; `type: 'emoji'` is deprecated

## Impact

- **`src/shared/types.ts`** — `ProfileIcon.type` union gains `'custom'`; `'emoji'` remains but is deprecated
- **`src/renderer/sidebar.ts`** — `PROVIDER_EMOJI` map removed; `renderIcon` fallback replaced with provider-keyed Lucide icon names; `type: 'custom'` rendered as `<img>`
- **`src/renderer/index.ts`** — `showIconPicker`: new Custom URL section added; `type: 'emoji'` pre-selection removed
- **`src/renderer/styles.css`** — styles for custom URL input + preview in picker
- **`scripts/generate-lucide-index.mjs`** — no change (both `rocket` and `users-round` are already in the allowlist)
