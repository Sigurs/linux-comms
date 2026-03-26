import { ipcMain, BrowserWindow } from 'electron';
import { join } from 'path';
import { IPC } from '../../shared/ipc-channels';
import { getAllProfiles } from '../store/profile-store';
import { getProvider } from '../../providers';
import { applySessionPermissions } from '../window';

const popoutWindows = new Map<string, BrowserWindow>();

export function registerPopoutIpc(): void {
  ipcMain.on(IPC.POPOUT_OPEN, (_event, profileId: string) => {
    if (popoutWindows.has(profileId)) {
      const existing = popoutWindows.get(profileId)!;
      existing.show();
      existing.focus();
      return;
    }

    const profiles = getAllProfiles();
    const profile = profiles.find((p) => p.id === profileId);
    if (!profile) return;

    const provider = getProvider(profile.providerId);
    if (!provider) return;

    applySessionPermissions(
      profile.partition,
      provider.webviewOptions.allowedPermissions ?? []
    );

    const win = new BrowserWindow({
      width: 1200,
      height: 800,
      title: `${provider.name} — ${profile.name}`,
      icon: join(__dirname, '../../../assets/icons/256x256.png'),
      autoHideMenuBar: true,
      webPreferences: {
        contextIsolation: true,
        nodeIntegration: false,
        partition: profile.partition,
        preload: join(__dirname, '../../preload/webview-preload.js'),
      },
    });

    if (provider.webviewOptions.userAgent) {
      win.webContents.setUserAgent(provider.webviewOptions.userAgent);
    }

    win.loadURL(profile.url);

    win.webContents.on('page-title-updated', (e, title) => {
      e.preventDefault();
      win.setTitle(`${title} - ${profile.name}`);
    });

    win.on('closed', () => {
      popoutWindows.delete(profileId);
      // Notify shell renderer to re-embed the profile
      const mainWins = BrowserWindow.getAllWindows().filter(
        (w) => !w.isDestroyed() && !popoutWindows.has(profileId)
      );
      for (const mw of mainWins) {
        mw.webContents.send(IPC.POPOUT_CLOSED, profileId);
      }
    });

    popoutWindows.set(profileId, win);
  });
}
