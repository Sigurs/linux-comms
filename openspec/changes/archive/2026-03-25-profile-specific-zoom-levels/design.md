## Context

Linux Comms manages multiple communication profiles (Teams, RocketChat, etc.) as webviews. Each profile has isolated session storage but shares the same hardcoded zoom level (0 = 100%). Users with visual preferences or varying screen sizes need per-profile zoom control.

Current state:

- `Profile` type in `src/shared/types.ts` has no zoom field
- `WebviewManager` calls `setZoomLevel(0)` unconditionally on `dom-ready`
- Profile metadata persisted via `profile-store.ts` to `$XDG_CONFIG_HOME/linux-comms/profiles.json`
- No UI exists for zoom control

## Goals / Non-Goals

**Goals:**

- Store per-profile zoom level in profile metadata
- Apply saved zoom level when webview becomes active
- Provide zoom controls (in/out/reset) in profile context menu
- Support Electron's standard zoom range (-1 to +9)
- Gracefully handle profiles without zoom level (default to 0)

**Non-Goals:**

- Global/default zoom level for new profiles (use 0 as implicit default)
- Keyboard shortcuts for zoom (future enhancement)
- Zoom persistence in popout windows (separate concern)
- Synchronizing zoom across multiple instances (out of scope)

## Decisions

### 1. Storage: Add `zoomLevel` to Profile type

**Decision:** Add optional `zoomLevel?: number` field to `Profile` interface.

**Rationale:** Keeps zoom tightly coupled with profile metadata. Alternative of separate zoom config file would add unnecessary complexity.

**Alternative considered:** Store zoom in localStorage keyed by profile ID. Rejected to avoid data fragmentation.

### 2. Zoom application point: `switchTo()` in WebviewManager

**Decision:** Apply zoom in `switchTo()` when activating a webview, and in `dom-ready` handler for initial load.

**Rationale:** Ensures zoom is applied when user switches profiles and when a new webview is created. The current hardcoded `setZoomLevel(0)` in `dom-ready` will read from profile instead.

**Alternative considered:** Apply zoom immediately after webview creation. Rejected because webview may not be ready for zoom commands before `dom-ready`.

### 3. UI: Profile context menu additions

**Decision:** Add "Zoom In", "Zoom Out", "Reset Zoom" items to the profile right-click context menu.

**Rationale:** Consistent with existing profile actions (rename, remove). Keeps UI simple without adding a dedicated settings panel.

**Alternative considered:** Toolbar zoom controls. Rejected to avoid UI clutter and maintain consistency with other profile-level actions.

### 4. IPC channel: `profile:update-zoom`

**Decision:** Add new IPC channel `profile:update-zoom` accepting `{ profileId: string, zoomLevel: number }`.

**Rationale:** Mirrors existing `profile:rename` pattern. Keeps zoom updates in main process for persistence.

### 5. Zoom validation: Clamp to Electron range

**Decision:** Validate zoom level is within Electron's supported range (-1 to +9) before saving. Clamp values outside range.

**Rationale:** Electron silently ignores invalid zoom levels, which could confuse users. Clamping provides predictable behavior.

## Risks / Trade-offs

**Risk:** Existing profiles have no `zoomLevel` field
→ Mitigation: Default to 0 in code when field is undefined

**Risk:** Popout windows won't sync zoom with main window
→ Mitigation: Out of scope for this change; can be addressed separately

**Risk:** Invalid zoom values could be imported from manual config edits
→ Mitigation: Validate and clamp on read/write operations
