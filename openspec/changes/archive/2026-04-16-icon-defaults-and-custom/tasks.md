## 1. Data Model

- [x] 1.1 Add `'custom'` to the `ProfileIcon.type` union in `src/shared/types.ts` (`'server' | 'library' | 'custom' | 'emoji'`)
- [x] 1.2 Update the JSDoc comment on `Profile.icon` to note that `type: 'emoji'` is deprecated

## 2. Sidebar — Provider Default Icons

- [x] 2.1 Replace `PROVIDER_EMOJI: Record<string, string>` with `PROVIDER_DEFAULT_ICON: Record<string, string>` in `src/renderer/sidebar.ts`, mapping `rocketchat → 'rocket'`, `teams → 'users-round'`
- [x] 2.2 Update `renderIcon` in `src/renderer/sidebar.ts`: remove the `type === 'emoji'` branch; add `type === 'custom'` rendering as `<img>`; change all emoji fallback paths to look up `lucideIndex[PROVIDER_DEFAULT_ICON[profile.providerId] ?? 'message-circle']` and return an inline SVG span

## 3. Icon Picker — Custom URL Section

- [x] 3.1 Add Custom URL section markup to the icon picker in `src/renderer/index.html`: a section label, a `<input type="url" id="icon-picker-custom-url">`, and an `<img id="icon-picker-custom-preview">` (hidden initially)
- [x] 3.2 Add styles to `src/renderer/styles.css` for the custom URL section: input full-width styling, preview image sizing (max 48×48, border-radius), hidden state, selected highlight on the preview
- [x] 3.3 In `showIconPicker` in `src/renderer/index.ts`, wire the custom URL input:
  - Pre-fill with `profile.icon.value` when `profile.icon.type === 'custom'`; show preview image
  - On `input` event: attempt to load the URL in the preview `<img>`; on `load` call `selectCustomUrl(url)`; on `error` clear selection if custom was selected
  - `selectCustomUrl(url)` deselects all other cells and marks the custom preview as selected; sets `selected = { type: 'custom', value: url }`
- [x] 3.4 Pre-select the custom URL option when the picker opens with a saved `type: 'custom'` icon (pre-fill input, show preview, mark as selected)

## 4. Verification

- [x] 4.1 Build succeeds (`npm run build`) with no TypeScript errors
- [x] 4.2 New Rocket.Chat profile shows `rocket` Lucide icon in sidebar before any icon is chosen
- [x] 4.3 New Teams profile shows `users-round` Lucide icon in sidebar before any icon is chosen
- [x] 4.4 Existing profiles with `type: 'server'` or `type: 'library'` icons are unaffected
- [x] 4.5 Pasting a valid image URL in the picker shows the preview; confirming saves as `type: 'custom'` and renders `<img>` in the sidebar
- [x] 4.6 Pasting an invalid / non-image URL shows no preview and does not allow selecting the custom option
