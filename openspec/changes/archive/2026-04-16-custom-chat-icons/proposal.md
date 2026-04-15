## Why

Profiles in the sidebar currently display hardcoded emoji (🟦, 🚀) with no way to distinguish instances of the same provider — e.g., two RocketChat workspaces look identical. Giving each profile a meaningful icon makes navigation faster and the app feel more personalised. The best default icon for any instance is the organisation/company logo the service already shows — that should be the first and pre-selected choice.

## What Changes

- Add an optional `icon` field to the `Profile` type that overrides the provider default
- Detect and display each service's own branding icon as the first and default choice in the picker:
  - **RocketChat**: fetch `{serverUrl}/assets/favicon.png` from the server
  - **Teams**: inject a DOM observer into the webview post-login to extract the organisation logo; relay it to the renderer via the existing `__linuxComms` IPC bridge
- Integrate a curated MIT-licensed icon library (Lucide) as a searchable second option
- The picker presents options in priority order: **1. Company Logo → 2. Icon Library → 3. Provider Emoji**
- Add an icon-picker UI accessible from the profile context menu ("Change Icon…")
- Render chosen icons (SVG or `<img>`) in the sidebar instead of the current emoji span

## Capabilities

### New Capabilities

- `chat-icon-customization`: Per-profile icon selection — storing a chosen icon on the `Profile`, rendering it in the sidebar, and providing a picker dialog reachable from the context menu
- `company-icon-integration`: Detecting and surfacing the service's own branding icon (RocketChat favicon, Teams organisation logo extracted via DOM injection) as the first/default picker option
- `icon-library`: Bundling a curated subset of Lucide icons (MIT) as a searchable, filterable SVG set in the picker

### Modified Capabilities

_(none — no existing spec-level requirements change)_

## Impact

- **`src/shared/types.ts`** — `Profile` gains optional `icon` field (`{ type: 'server' | 'library' | 'emoji'; value: string }`)
- **`src/main/store/profile-store.ts`** — persist and update the new icon field
- **`src/main/ipc/profile.ts`** — new IPC handler `updateProfileIcon`
- **`src/preload/webview-preload.ts`** — add `reportOrgLogo(url)` to the `__linuxComms` bridge; relay as `sendToHost('org-logo-found', url)`
- **`src/renderer/webview-manager.ts`** — listen for `org-logo-found` IPC message; cache logo URL per profile
- **`src/renderer/sidebar.ts`** — replace emoji span with `<img>` / inline SVG rendering
- **`src/renderer/index.ts`** — wire icon-picker modal; call `updateProfileIcon`; inject DOM observer script into Teams webviews post-login
- **`src/services/rocketchat-api.ts`** — no change needed (RocketChat favicon resolved client-side in picker)
- **Dependencies** — add `lucide-static` (MIT, static SVG distribution, no runtime framework required)
