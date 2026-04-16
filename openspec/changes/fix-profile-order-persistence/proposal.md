## Why

Dragging profiles in the sidebar to reorder them has no effect on disk — the new order is lost on restart. The bug is in `DragDropWrapper.handleDragEnd`: both `fromIndex` and `toIndex` are computed from the post-drag DOM (after the element has already been moved), so they are always equal, the `onReorder` callback is never invoked, and `updateProfileOrder` is never called. The persistence infrastructure (profile-store, IPC handler) is correct and complete; only the drag-end logic is broken.

## What Changes

- Fix `DragDropWrapper.handleDragEnd` to record the pre-drag index at drag-start and use it as `fromIndex`, so `onReorder` is called with the correct indices when a drag completes.
- Simplify the reorder callback in `index.ts`: since the DOM is already in the correct final order after a drag, read the current DOM order directly instead of manually re-applying a splice (which produces a wrong order when given incorrect `fromIndex`/`toIndex`). Remove the premature `renderSidebar()` call that snaps the sidebar back to the pre-drag order.

## Capabilities

### New Capabilities

*(none)*

### Modified Capabilities

- `profile-management`: Add requirement that sidebar profile order persists across restarts.

## Impact

- `src/renderer/drag-drop-wrapper.ts` — store pre-drag index; fix `handleDragEnd` index calculation
- `src/renderer/index.ts` — simplify reorder callback; remove incorrect splice and premature re-render
