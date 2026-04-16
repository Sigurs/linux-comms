## Context

The drag-drop reorder flow has two components:

1. **`DragDropWrapper`** — handles mouse events, moves DOM elements during drag, and fires `onReorder(fromIndex, toIndex)` when a drag completes.
2. **Reorder callback in `index.ts`** — receives `fromIndex`/`toIndex`, reads DOM to build the new `profileIds` array, and calls `updateProfileOrder` via IPC.

**The bug (DragDropWrapper.handleDragEnd):**
```typescript
const fromIndex = Array.from(this.container.children).indexOf(draggingEntry);
const toIndex   = entries.indexOf(draggingEntry);
```
By the time `handleDragEnd` fires, `handleDragMove` has already repositioned the element in the DOM. Both lines query the **current** (post-move) DOM, so they return the same value. `fromIndex !== toIndex` is always `false`; `onReorder` is never called.

**The secondary issue (index.ts callback):**
Even if `onReorder` were called, the callback would receive a correct `toIndex` but an incorrect `fromIndex` (both pointing to the current position). It then reads the post-drag DOM order into `profileIds` (which is already correct), and re-applies a splice using wrong indices — corrupting the order before calling `updateProfileOrder`. The `renderSidebar()` optimistic call also snaps the UI back to the stale in-memory order, fighting the DOM.

The persistence layer (`updateProfileOrder` → `save`) and the re-render path (`PROFILE_UPDATED` → `profiles = newProfiles; renderSidebar()`) are both correct.

## Goals / Non-Goals

**Goals:**
- Profile reorder is saved to disk and survives a restart.
- No visual glitch: sidebar stays in the dragged order between the drag-end and the IPC round-trip.

**Non-Goals:**
- Replacing the drag-drop implementation with a library.
- Debouncing rapid reorders (already absent, not needed for correctness).

## Decisions

### Decision 1 — Record pre-drag index in DragDropWrapper

Add `private dragStartIndex = -1` to `DragDropWrapper`. In `startDrag()`, capture:
```typescript
const entries = Array.from(this.container.querySelectorAll('.profile-entry'));
this.dragStartIndex = entries.indexOf(entry);
```
In `handleDragEnd()`, replace the broken index calculation:
```typescript
// Before (broken — both from same post-drag DOM):
const fromIndex = Array.from(this.container.children).indexOf(draggingEntry);
const toIndex   = entries.indexOf(draggingEntry);

// After:
const toIndex   = entries.indexOf(draggingEntry); // post-drag position
const fromIndex = this.dragStartIndex;             // pre-drag position (captured at start)
```

**Rationale:** The smallest targeted fix. The `onReorder` contract (`fromIndex`, `toIndex`) stays the same; callers don't need to change how they use the indices.

**Alternative considered:** Remove `fromIndex`/`toIndex` from the callback entirely — just fire `onReorder()` with no arguments and let the caller always read DOM order. Rejected because it changes the public API of `DragDropWrapper` and `fromIndex`/`toIndex` may be useful to callers who want to know *what* moved (e.g., for optimistic in-memory updates).

### Decision 2 — Simplify index.ts callback: read DOM order directly, drop the splice

After a completed drag, the DOM already reflects the user's intended order. The callback should read that order and persist it — no manual array reorder needed:

```typescript
async (_fromIndex, _toIndex) => {
    const profileIds = Array.from(document.querySelectorAll('.profile-entry'))
        .map(el => (el as HTMLElement).dataset.profileId)
        .filter((id): id is string => !!id);
    try {
        await window.electronAPI.updateProfileOrder(profileIds);
    } catch (err) {
        console.error('Failed to update profile order:', err);
    }
}
```

Remove the premature `renderSidebar()` call. The DOM is already correct; `PROFILE_UPDATED` fires after IPC and updates the in-memory `profiles` array with new `position` values, after which `renderSidebar()` will reproduce the same order.

**Rationale:** Eliminates the splice-corruption bug. No `renderSidebar()` call means no snap-back to the stale order.

**Alternative considered:** Keep the splice but fix `fromIndex`/`toIndex`. Rejected — the splice operates on the already-correct DOM order and is redundant. Removing it is simpler and removes a class of future bugs.

## Risks / Trade-offs

- Removing `renderSidebar()` from the callback means the sidebar depends on `PROFILE_UPDATED` for the position re-render. If IPC fails, the DOM stays in the correct order (good) but in-memory `profiles` positions are stale until next restart (acceptable — same as today). → Mitigation: error is logged; no regression from current behaviour.
- `dragStartIndex` is reset to `-1` only implicitly (it's overwritten on each new drag). If a drag is cancelled without completing, a subsequent immediate drag-end could use a stale index. → Mitigation: reset `dragStartIndex = -1` in `cancelDrag()`.

## Second Bug Found During Implementation

The container `mouseup`/`mouseleave` listeners called `cancelDrag()` unconditionally. During an active drag, `mouseup` bubbles to the container (firing `cancelDrag()`) before it reaches the document (where `handleDragEnd` is registered). `cancelDrag()` removes `handleDragEnd` from the document listener as part of its cleanup, so `handleDragEnd` never fires and `onReorder` is never called — regardless of whether `fromIndex`/`toIndex` are correct.

Fix: guard both container event listeners with `if (!this.isDragging)` so they only cancel the hold-timer phase, not an in-progress drag.
