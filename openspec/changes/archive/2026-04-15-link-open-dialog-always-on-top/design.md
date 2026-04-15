## Context

`dialog.showMessageBox` has two signatures:

```typescript
dialog.showMessageBox(options)                      // no parent — free-floating window
dialog.showMessageBox(browserWindow, options)       // parented — stays in front of parent
```

The current call uses the parentless form. On Linux (and Windows), parentless dialogs are independent windows with no z-order relationship to the app, so they can be obscured by the main window. Passing the main `BrowserWindow` as the first argument makes the dialog a child window that the OS keeps in front of its parent.

`getMainWindow()` is already exported from `src/main/window.ts` and available to import in `link-open.ts`.

## Goals / Non-Goals

**Goals:**
- Dialog stays in front of the main window at all times

**Non-Goals:**
- Making the dialog float above unrelated applications (system-wide always-on-top)
- Changing dialog behaviour when the main window is null (app startup edge case — fall back to parentless)

## Decisions

**Decision: pass `getMainWindow() ?? undefined` as the parent**

If `getMainWindow()` returns `null` (app not yet fully initialised), fall back to the parentless form. This avoids a runtime crash while still handling the normal case correctly.

```typescript
const result = await dialog.showMessageBox(
  getMainWindow() ?? undefined,  // undefined falls back to parentless
  { ... }
);
```

Wait — `showMessageBox` is overloaded: the two-argument form requires a `BrowserWindow`, not `BrowserWindow | undefined`. The correct pattern is a conditional:

```typescript
const win = getMainWindow();
const result = win
  ? await dialog.showMessageBox(win, { ... })
  : await dialog.showMessageBox({ ... });
```

Alternative: `setAlwaysOnTop(true)` on the dialog — not possible; `showMessageBox` does not expose the underlying `BrowserWindow`.

Alternative: Create a custom HTML dialog window — significant complexity for no added benefit.

## Risks / Trade-offs

- [Null main window] → Guarded by the conditional; falls back to existing parentless behaviour.
- [macOS sheet behaviour] → On macOS, parented dialogs become sheets attached to the parent window title bar. This is standard macOS UX and acceptable.
