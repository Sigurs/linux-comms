## Why

Currently, when a link is opened from within a webview (e.g., clicking an external link in Teams or Rocket.Chat), it automatically opens in a popup window using the profile's session. Users have no choice whether to open the link in a popup (with profile cookies) or in their default browser. This is problematic for links that don't need the session context, where users would prefer their regular browser.

## What Changes

- Intercept popup/new-window events from webviews
- Show a dialog asking the user how they want to open the link
- Provide two options:
  1. Open in popup (keeps the profile's session/cookies)
  2. Open in browser (uses the system's default browser)
- Remember the user's preference (optional, per-session or persistent)

## Capabilities

### New Capabilities

- `link-open-choice`: User choice dialog for how to open external links from webviews (popup vs browser)

### Modified Capabilities

- `app-shell`: Modify webview handling to intercept new-window events and delegate to the link-open-choice capability

## Impact

- `src/renderer/webview-manager.ts`: Add `new-window` event handler to webviews
- `src/main/ipc/popout.ts`: May need refactoring to support URL-based popouts (not just profile-based)
- `src/shared/ipc-channels.ts`: New IPC channels for link handling
- `src/preload/shell-preload.ts`: Add IPC methods for link dialog
- New dialog component or use Electron's `dialog.showMessageBox` for the choice prompt
