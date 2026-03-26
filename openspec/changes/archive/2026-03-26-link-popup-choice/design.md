## Context

The application embeds multiple communication providers (Teams, Rocket.Chat) as webviews. When a user clicks a link that opens a new window (e.g., OAuth flows, external links), the webview's `allowpopups` attribute currently allows these to open as Electron popup windows with the profile's session.

Users want control over where these links open:

- **Popup**: Keeps the profile's session/cookies (needed for OAuth, SSO flows)
- **Browser**: Uses the system browser (preferred for regular external links)

## Goals / Non-Goals

**Goals:**

- Intercept new-window events from webviews
- Show a native dialog asking user preference
- Support both popup and browser options
- Open popup with the same partition/session as the source webview

**Non-Goals:**

- Remembering user preference across sessions (could be future enhancement)
- Customizing which domains open where automatically
- In-app browser functionality

## Decisions

### 1. Use Electron's `dialog.showMessageBox` for the choice dialog

**Rationale**: Native dialog, no need for custom UI, consistent with OS look-and-feel. Alternatives considered:

- Custom HTML dialog in renderer: More control but adds complexity and inconsistent with native dialogs
- Always-remember checkbox: Adds state management complexity; defer to future iteration

### 2. Handle `new-window` event on webview element

**Rationale**: The `<webview>` tag fires `new-window` event when `allowpopups` is set and a popup is requested. We can intercept this, show the dialog, and either:

- Create a new BrowserWindow with the same partition (popup option)
- Call `shell.openExternal(url)` (browser option)

**Note**: The `allowpopups` attribute must remain for the event to fire, but we prevent the default popup behavior.

### 3. Reuse existing popout window infrastructure

**Rationale**: The existing `popout.ts` creates BrowserWindows with the correct partition. We can create a similar window but with an arbitrary URL instead of a profile URL. This avoids code duplication.

### 4. IPC flow: Renderer → Main → Dialog → Action

1. Webview fires `new-window` event in renderer
2. Renderer sends URL to main via IPC
3. Main shows dialog, gets user choice
4. Main either creates popup window or opens in browser
5. Returns result to renderer (optional, for logging)

## Risks / Trade-offs

**Popup windows don't have back/forward navigation** → Users may expect browser-like navigation. Accept as-is for MVP; popup windows are for temporary flows like OAuth.

**Dialog interrupting user flow** → Could be annoying for frequent popup users. Consider adding "always use browser" preference in future.

**Some apps may break if popup is blocked** → We're not blocking, just redirecting. The URL always opens somewhere.

## Migration Plan

1. Add IPC channel for link opening
2. Add `new-window` event handler to WebviewManager
3. Test with various providers (Teams OAuth, Rocket.Chat links)
4. No rollback needed - feature is additive
