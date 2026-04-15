import { ipcMain, dialog, shell, BrowserWindow } from 'electron';
import { join } from 'path';
import { IPC } from '../../shared/ipc-channels';
import { getAllProfiles } from '../store/profile-store';
import { getProvider } from '../../providers';
import { applySessionPermissions, getMainWindow } from '../window';

function truncateUrl(url: string, maxLength: number = 60): string {
  if (url.length <= maxLength) return url;
  return url.substring(0, maxLength - 3) + '...';
}

let dialogOpen = false;

export function registerLinkOpenIpc(): void {
  ipcMain.handle(IPC.LINK_OPEN_PROMPT, async (_event, url: string, profileId: string) => {
    if (dialogOpen) return;
    console.log('[link-open] URL:', url, 'ProfileId:', profileId);
    const profiles = getAllProfiles();
    const profile = profiles.find((p) => p.id === profileId);
    console.log('[link-open] Profile found:', profile?.name, 'Partition:', profile?.partition);

    const truncatedUrl = truncateUrl(url, 60);

    const dialogOptions = {
      type: 'question' as const,
      title: 'Open Link',
      message: `How would you like to open this link?`,
      detail: truncatedUrl,
      buttons: ['Open in Browser', 'Open in Popup', 'Cancel'],
      defaultId: 0,
      cancelId: 2,
    };
    const mainWindow = getMainWindow();

    dialogOpen = true;
    let result: Electron.MessageBoxReturnValue;
    try {
      result = mainWindow
        ? await dialog.showMessageBox(mainWindow, dialogOptions)
        : await dialog.showMessageBox(dialogOptions);
    } finally {
      dialogOpen = false;
    }

    console.log('[link-open] User choice:', result.response);

    if (result.response === 2) {
      return;
    }

    if (result.response === 0) {
      console.log('[link-open] Opening in browser');
      await shell.openExternal(url);
      return;
    }

    if (result.response === 1) {
      console.log('[link-open] Opening in popup');
      if (!profile) {
        console.log('[link-open] No profile, falling back to browser');
        await shell.openExternal(url);
        return;
      }

      const provider = getProvider(profile.providerId);
      if (provider) {
        applySessionPermissions(
          profile.partition,
          provider.webviewOptions.allowedPermissions ?? []
        );
      }

      console.log('[link-open] Creating BrowserWindow with partition:', profile.partition);
      const win = new BrowserWindow({
        width: 1200,
        height: 800,
        title: `Loading... — ${profile.name}`,
        webPreferences: {
          contextIsolation: true,
          nodeIntegration: false,
          partition: profile.partition,
          preload: join(__dirname, '../../preload/webview-preload.js'),
        },
      });

      if (provider?.webviewOptions.userAgent) {
        win.webContents.setUserAgent(provider.webviewOptions.userAgent);
      }

      win.webContents.on('page-title-updated', (_event, title) => {
        win.setTitle(`${title} — ${profile.name}`);
      });

      win.loadURL(url);
      console.log('[link-open] Popup window created');
    }
  });
}
