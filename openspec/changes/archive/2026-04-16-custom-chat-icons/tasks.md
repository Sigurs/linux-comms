## 1. Dependencies & Build Setup

- [x] 1.1 Add `lucide-static` as a dev dependency in `package.json`
- [x] 1.2 Create `scripts/generate-lucide-index.mjs` — reads the curated allowlist of icon names, reads their SVG files from `node_modules/lucide-static/icons/`, writes `src/renderer/lucide-index.ts` exporting a `Record<string, string>` of name → inline SVG string
- [x] 1.3 Add the generate script to the build pipeline (`prebuild` or prepended to `build:renderer` and `build:renderer:prod` in `package.json`)

## 2. Data Model

- [x] 2.1 Add `ProfileIcon` interface to `src/shared/types.ts`: `{ type: 'server' | 'library' | 'emoji'; value: string }`
- [x] 2.2 Add optional `icon?: ProfileIcon` field to the `Profile` interface in `src/shared/types.ts`

## 3. Main Process — Store & IPC

- [x] 3.1 Add `updateProfileIcon(id, icon)` to `src/main/store/profile-store.ts` — sets `profile.icon` and saves; returns updated profile or `undefined` if not found
- [x] 3.2 Add `PROFILE_UPDATE_ICON` channel to `src/shared/ipc-channels.ts`
- [x] 3.3 Register the IPC handler for `PROFILE_UPDATE_ICON` in `src/main/ipc/profile.ts`, calling `updateProfileIcon` and broadcasting `PROFILE_UPDATED`
- [x] 3.4 Expose `updateProfileIcon(profileId, icon)` on the `electronAPI` object in `src/preload/shell-preload.ts`

## 4. Webview Bridge — `reportOrgLogo`

- [x] 4.1 Add `reportOrgLogo(url: string): void` to `window.__linuxComms` in `src/preload/webview-preload.ts`, implemented as `ipcRenderer.sendToHost('org-logo-found', url)`
- [x] 4.2 Add handler for `'org-logo-found'` in the webview's `ipc-message` listener in `src/renderer/webview-manager.ts` — cache the URL in a `Map<profileId, string>` (in-memory, not persisted)
- [x] 4.3 Expose `getCachedOrgLogo(profileId: string): string | undefined` on `WebviewManager` so the picker can retrieve the cached URL

## 5. Teams DOM Observer

- [x] 5.1 Write a `TEAMS_LOGO_OBSERVER_SCRIPT` constant in `src/renderer/webview-manager.ts` — a self-contained IIFE that uses `MutationObserver` to watch for org logo `<img>` elements using a priority-ordered selector list; calls `window.__linuxComms.reportOrgLogo(resolvedUrl)` on first match; self-terminates after 10 s
- [x] 5.2 In `WebviewManager.ensureWebview`, after the Teams webview fires `page-title-updated` (indicating post-login render), inject `TEAMS_LOGO_OBSERVER_SCRIPT` via `executeJavaScript` — guard with `profile.providerId === 'teams'` and inject only once per webview lifecycle

## 6. Sidebar Rendering

- [x] 6.1 Add `renderIcon(profile: Profile, provider: Provider, lucideIndex: Record<string, string>): string` helper in `src/renderer/sidebar.ts` — returns `<img src="...">` for `server`, inline SVG for `library`, emoji `<span>` for `emoji` or absent
- [x] 6.2 Pass `lucideIndex` into `Sidebar` constructor (or `render` method) so `renderIcon` can look up SVG strings
- [x] 6.3 Replace the hardcoded `${emoji}` in `createEntry` with a call to `renderIcon`

## 7. Icon Picker Modal — HTML & CSS

- [x] 7.1 Add icon picker overlay markup to `src/renderer/index.html`: overlay wrapper, Company Logo section (initially hidden), search input, library grid, confirm/cancel buttons
- [x] 7.2 Add picker styles to `src/renderer/styles.css`: grid layout, selected state ring, company logo row, search input styling, empty-state message, scrollable grid

## 8. Icon Picker Modal — Logic

- [x] 8.1 Add `showIconPicker(profile: Profile): Promise<ProfileIcon | null>` in `src/renderer/index.ts` — orchestrates the picker and returns the chosen icon or null
- [x] 8.2 Implement Company Logo section: for RocketChat, attempt to load `{profile.url}/assets/favicon.png` via `<img>`; for Teams, call `webviewManager.getCachedOrgLogo(profile.id)`; show section if an icon is available, hide otherwise; pre-select it when no icon is already saved
- [x] 8.3 Implement library grid: render all icons from `lucide-index`, wire search input to filter icons on every keystroke (case-insensitive substring match on name), show "No icons found" when filter is empty
- [x] 8.4 Pre-select the currently saved icon when the picker opens — for `server` type highlight the company logo tile; for `library` type highlight and scroll the matching grid cell into view
- [x] 8.5 On confirm, build the `ProfileIcon` object from the selected tile and call `window.electronAPI.updateProfileIcon(profile.id, selectedIcon)`; resolve the promise and close the modal
- [x] 8.6 On cancel or Escape key, resolve the promise with `null` and close the modal without making any IPC call

## 9. Context Menu Integration

- [x] 9.1 Add "Change Icon…" `<button data-action="change-icon">` to the context menu HTML in `src/renderer/sidebar.ts`
- [x] 9.2 Handle `action === 'change-icon'` in the context menu click handler: call `showIconPicker(profile)` and, if a non-null icon is returned, update the sidebar immediately (optimistic re-render)

## 10. Verification

- [x] 10.1 Build succeeds (`npm run build`) including the lucide-index generation step
- [x] 10.2 Existing profiles without `icon` still render the provider emoji (no regression)
- [x] 10.3 Selecting a library icon persists across app restart
- [x] 10.4 Selecting the RocketChat server favicon shows it in the sidebar; stale URL shows broken image gracefully
- [x] 10.5 Teams webview eventually reports an org logo (or silently skips) — verify via console log in dev build
- [x] 10.6 Search input filters the icon grid in real time; "No icons found" state shown when filter matches nothing; clearing search restores all icons
- [x] 10.7 Priority order in picker: Company Logo section appears above Library section when a logo is detected
