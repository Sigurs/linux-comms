## Context

The main-window flow for link interception works through two layers:
1. **Renderer** (`webview-manager.ts`): listens for `new-window` and `will-navigate` events on `<webview>` elements and calls `window.electronAPI.openLinkChoice(url, profileId)`
2. **Main** (`link-open.ts`): the `LINK_OPEN_PROMPT` IPC handler shows `dialog.showMessageBox`

The popout window bypasses both layers — there is no `<webview>` and no renderer-side event wiring. The fix moves interception into the main process for popout windows, where we have direct access to `win.webContents`.

## Goals / Non-Goals

**Goals:**
- Show the Open Link dialog for links clicked in popout windows
- Respect trusted-domain bypass (same logic as `webview-manager.ts`)
- Reuse the existing `dialogOpen` deduplication guard

**Non-Goals:**
- Changing how link interception works in the main (webview) window
- Intercepting navigations that are same-origin to the profile URL (SPA routing)

## Decisions

**Decision: extract `showLinkOpenDialog` from `link-open.ts`**

The current handler body in `registerLinkOpenIpc` contains both the guard logic and the dialog/action logic. Extracting it into an exported async function lets `popout.ts` call it directly without going through IPC. The IPC handler becomes a thin wrapper:

```typescript
export async function showLinkOpenDialog(
  url: string,
  profileId: string,
  parentWin: BrowserWindow | null
): Promise<void> { ... }

export function registerLinkOpenIpc(): void {
  ipcMain.handle(IPC.LINK_OPEN_PROMPT, (_event, url, profileId) =>
    showLinkOpenDialog(url, profileId, getMainWindow())
  );
}
```

**Decision: `setWindowOpenHandler` + `will-navigate` in `popout.ts`**

`setWindowOpenHandler` is Electron's standard hook for intercepting `window.open()` and `target="_blank"` navigations in a `BrowserWindow`. Returning `{ action: 'deny' }` suppresses the default new-window behaviour. `will-navigate` covers plain `<a href>` clicks and right-click → Open Link.

```typescript
win.webContents.setWindowOpenHandler(({ url }) => {
  void showLinkOpenDialog(url, profileId, win);
  return { action: 'deny' };
});

win.webContents.on('will-navigate', (event, url) => {
  try {
    if (new URL(url).origin === new URL(profile.url).origin) return;
    const provider = getProvider(profile.providerId);
    if (provider?.trustedDomains && matchesTrustedDomain(url, provider.trustedDomains)) return;
  } catch { return; }
  event.preventDefault();
  void showLinkOpenDialog(url, profileId, win);
});
```

`matchesTrustedDomain` is already in `webview-manager.ts` (renderer). Since `popout.ts` is in the main process, we duplicate the small helper there (or move it to `src/shared/`). Duplicating is simpler — the function is 3 lines.

## Risks / Trade-offs

- [Duplicate `matchesTrustedDomain`] → The function is trivial; duplication is low cost. Moving it to `src/shared/` would be a separate refactor.
- [Popout uses `webview-preload.js` — `window.open` is already overridden by the injection script] → The injection script overrides `window.open` to call `lc.openLinkChoice`, which calls `ipcRenderer.sendToHost` (goes nowhere in a `BrowserWindow`). `setWindowOpenHandler` catches these anyway since `window.open` returning `null` may still trigger the handler in some Electron versions, and native `<a target="_blank">` clicks definitely fire it. Belt-and-suspenders is fine.
