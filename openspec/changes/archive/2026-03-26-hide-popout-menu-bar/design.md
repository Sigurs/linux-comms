## Context

The main window is created in `src/main/window.ts` with `autoHideMenuBar: true`. Pop-out windows are created in `src/main/ipc/popout.ts` without this option, so they show the native menu bar by default.

`autoHideMenuBar: true` hides the menu bar unless the user presses Alt, which mirrors typical Electron app behaviour and matches the main window.

## Goals / Non-Goals

**Goals:**
- Hide the menu bar in pop-out windows by default, consistent with the main window

**Non-Goals:**
- Removing the menu bar entirely (users can still reveal it with Alt)
- Changing any other window chrome or behaviour

## Decisions

**Use `autoHideMenuBar: true` in the `BrowserWindow` constructor**

This is a single-property change identical to what the main window already does. No runtime calls or IPC needed.

## Risks / Trade-offs

None. This is a one-line configuration change with no behavioural side effects beyond hiding the menu bar.
