import { BrowserWindow, session } from 'electron';
import { join } from 'path';
import { getAllProfiles } from './store/profile-store';
import { getProvider } from '../providers';

let mainWindow: BrowserWindow | null = null;

export function createMainWindow(): BrowserWindow {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    title: 'Linux Comms',
    autoHideMenuBar: true,
    show: false,
    backgroundColor: '#1e1e2e',
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      webviewTag: true,
      preload: join(__dirname, '../preload/shell-preload.js'),
      sandbox: false, // needed for webview preload scripts to work
    },
  });

  mainWindow.loadFile(join(__dirname, '../renderer/index.html'));

  mainWindow.once('ready-to-show', () => {
    mainWindow!.show();
  });

  // Configure permission handler for all sessions
  configurePermissions();

  return mainWindow;
}

export function getMainWindow(): BrowserWindow | null {
  return mainWindow;
}

/**
 * Configure media/notification permission handlers for all profile sessions.
 * Called once after the main window is created; also applied lazily when new
 * profiles are added.
 */
export function configurePermissions(): void {
  const profiles = getAllProfiles();

  for (const profile of profiles) {
    const provider = getProvider(profile.providerId);
    if (!provider) continue;
    applySessionPermissions(profile.partition, provider.webviewOptions.allowedPermissions ?? []);
  }
}

export function applySessionPermissions(
  partition: string,
  allowedPermissions: string[]
): void {
  const sess = session.fromPartition(partition);

  const alwaysAllowed = ['notifications', 'media'];

  sess.setPermissionRequestHandler((_webContents, permission, callback) => {
    const allowed =
      allowedPermissions.includes(permission) ||
      alwaysAllowed.includes(permission);
    callback(allowed);
  });

  sess.setPermissionCheckHandler((_webContents, permission) => {
    return (
      allowedPermissions.includes(permission) ||
      alwaysAllowed.includes(permission)
    );
  });
}
