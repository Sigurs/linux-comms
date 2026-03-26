## Context

The sidebar displays profile entries as buttons. Each button contains the provider emoji, a label, an optional badge, and a three-dots (`⋮`) span that appears on hover. Clicking the three-dots span calls `showContextMenu`. The change replaces this interaction with a standard right-click (`contextmenu` event) on the profile button itself.

## Goals / Non-Goals

**Goals:**
- Open the profile context menu on right-click of the profile entry
- Remove the three-dots button element and its hover CSS

**Non-Goals:**
- Changing the contents or behaviour of the context menu itself
- Changing keyboard navigation or accessibility bindings beyond what is affected

## Decisions

**Use the native `contextmenu` event on the profile button**

The `contextmenu` event fires on right-click (and long-press on touch), maps directly to user expectations for a desktop app context menu, and requires no additional input detection logic. The alternative (a `mousedown` handler filtering for `button === 2`) would be more verbose with no benefit.

`e.preventDefault()` should be called inside the `contextmenu` handler to suppress the browser/Electron default context menu before showing the custom one.

**Remove the `.ctx-menu-btn` span entirely**

Since the trigger moves to the parent button, the span serves no purpose and should be removed from both the HTML template and the CSS.

## Risks / Trade-offs

- [Accidental right-click] Users who right-click while not intending to open the menu will see it. → Acceptable trade-off; this is the standard desktop pattern and the menu can be dismissed by clicking elsewhere.
- [No hover affordance] Without the three-dots button there is no visible indicator that a context menu is available. → Acceptable; right-click discoverability is a common desktop convention and the current hover indicator is already subtle.

## Migration Plan

No data migration required. The change is entirely UI/event-handler level. Deployment is a standard app build and release.
