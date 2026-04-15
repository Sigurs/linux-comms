## Context

`registerLinkOpenIpc` in `src/main/ipc/link-open.ts` handles the `LINK_OPEN_PROMPT` IPC channel with `ipcMain.handle`. Each invocation calls `dialog.showMessageBox`, which is async and returns a Promise. Because `ipcMain.handle` does not queue or serialize calls, concurrent invocations each get their own `showMessageBox` call, producing stacked dialogs.

## Goals / Non-Goals

**Goals:**
- Ensure at most one "Open Link" dialog is visible at any time
- Silently drop duplicate requests while a dialog is open (no queue, no error)

**Non-Goals:**
- Queuing deferred link openings for after the dialog closes
- Per-URL or per-profile deduplication (any open dialog blocks all others)

## Decisions

**Decision: module-level boolean flag**

A single `let dialogOpen = false` at module scope in `link-open.ts`. At the top of the handler, return immediately if `dialogOpen` is `true`. Set it to `true` before `await dialog.showMessageBox` and reset it in a `finally` block so it is always cleared even if the dialog throws.

```typescript
let dialogOpen = false;

// inside handler:
if (dialogOpen) return;
dialogOpen = true;
try {
  const result = await dialog.showMessageBox(...);
  // ...handle result
} finally {
  dialogOpen = false;
}
```

Alternative: use a `Promise` reference and re-attach to the in-flight promise — unnecessary complexity for this use case; the user gets no value from the result of a deduplicated call.

Alternative: debounce on the renderer side — does not protect against calls from multiple webviews or different IPC paths.

## Risks / Trade-offs

- [A dialog that never resolves leaves the flag stuck] → The `finally` block ensures the flag is always cleared, including on thrown exceptions from `dialog.showMessageBox`.
- [Silent drop may surprise the user] → Acceptable: the user already has a dialog open. Showing a second one would be more surprising.
