## 1. Fix DragDropWrapper pre-drag index tracking

- [x] 1.1 Add `private dragStartIndex = -1` field to `DragDropWrapper` class in `src/renderer/drag-drop-wrapper.ts`
- [x] 1.2 In `startDrag()`, capture the element's current index before drag begins: `this.dragStartIndex = Array.from(this.container.querySelectorAll('.profile-entry')).indexOf(entry)`
- [x] 1.3 In `handleDragEnd()`, replace the broken `fromIndex` calculation with `this.dragStartIndex`; keep `toIndex` as `entries.indexOf(draggingEntry)` (post-drag DOM position)
- [x] 1.4 In `cancelDrag()`, reset `this.dragStartIndex = -1` so a cancelled drag does not pollute a subsequent drag

## 2. Simplify reorder callback in index.ts

- [x] 2.1 In the `DragDropWrapper` reorder callback in `src/renderer/index.ts`, replace the manual splice logic with a direct DOM-order read: `Array.from(document.querySelectorAll('.profile-entry')).map(el => (el as HTMLElement).dataset.profileId).filter((id): id is string => !!id)`
- [x] 2.2 Remove the premature `renderSidebar()` call from the reorder callback (DOM is already correct; `PROFILE_UPDATED` handles the in-memory re-render)

## 3. Verification

- [x] 3.1 Build (`npm run build`) — confirm no TypeScript errors
- [ ] 3.2 Run the app, drag a profile to a new position, restart — confirm the order is preserved
- [ ] 3.3 Drag multiple times in a row — confirm each final order persists correctly
