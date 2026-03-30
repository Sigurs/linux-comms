## Context

When a profile is popped out, the embedded webview is hidden and `activeProfileId` is cleared in the renderer. When the pop-out window is closed, the main process sends `POPOUT_CLOSED` to the renderer. The renderer currently handles this by calling `webviewManager.restorePopout(profileId)` (which calls `switchTo`, making the profile the visible/active one) and then explicitly setting `sidebar.setActive(profileId)` and `activeProfileId = profileId`.

The result is an involuntary profile switch in the main window every time a pop-out is closed.

## Goals / Non-Goals

**Goals:**
- Re-embed the webview into the main window silently when the pop-out closes (so it is ready for manual selection)
- Leave the main window's active profile and sidebar state unchanged

**Non-Goals:**
- Changing what happens when the user manually clicks the profile after closing the pop-out
- Changing any other pop-out behaviour (open, focus, session isolation)

## Decisions

**Add a dedicated `restorePopoutSilent` path in `WebviewManager`**

`restorePopout` currently delegates to `switchTo`, which makes the profile active. A new method (or a parameter on the existing one) should re-attach the webview without calling `switchTo`. Using a separate method keeps the intent explicit and avoids a boolean flag.

The renderer `onPopoutClosed` handler will call the new silent restore and skip updating `activeProfileId` and the sidebar.

**Do not show the empty-state if another profile is already active**

`switchTo` hides the empty-state element. Since we're no longer calling `switchTo`, we must ensure the empty-state is not inadvertently shown. Because the active profile's webview is still visible (we only hide the popped-out one), the empty-state will not appear—no extra logic needed.

## Risks / Trade-offs

- [Pop-out was the only active profile] If no profile was active before the pop-out closed, the main window will show the empty-state. This is correct—the user must choose a profile. → No mitigation needed; this is the desired behaviour.
- [Webview re-embedded but not visible] The restored webview sits hidden in the DOM. This is identical to any non-active profile and carries no risk.
