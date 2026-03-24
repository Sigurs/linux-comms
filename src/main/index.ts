import { app, BrowserWindow } from 'electron';
import { join } from 'path';
import { applyPlatformFlags, isWayland } from './platform/wayland';
import { checkPortalAvailability } from './platform/portal';
import { createMainWindow, getMainWindow } from './window';
import { createTray } from './tray';
import { registerAllIpc } from './ipc';
import { IPC } from '../shared/ipc-channels';

// Apply Wayland/X11 flags before app is ready (must be before app.whenReady)
applyPlatformFlags();

// Set XDG-compliant userData path so Electron uses ~/.config/linux-comms
// This must be done before app is ready
const xdgConfigHome = process.env['XDG_CONFIG_HOME'] || join(process.env['HOME'] || '~', '.config');
const xdgCacheHome = process.env['XDG_CACHE_HOME'] || join(process.env['HOME'] || '~', '.cache');
app.setPath('userData', join(xdgConfigHome, 'linux-comms'));
app.setPath('cache', join(xdgCacheHome, 'linux-comms'));

// Enforce single instance
const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
  process.exit(0);
}

app.on('second-instance', () => {
  const win = getMainWindow();
  if (win) {
    if (win.isMinimized()) win.restore();
    win.show();
    win.focus();
  }
});

// Register IPC handlers before any window is created
registerAllIpc();

app.whenReady().then(async () => {
  const mainWindow = createMainWindow();
  createTray();

  // Check portal availability and warn if unavailable
  const portalStatus = await checkPortalAvailability();
  if (isWayland() && portalStatus === 'unavailable') {
    // Defer notification until window is ready to show
    mainWindow.once('show', () => {
      mainWindow.webContents.send(IPC.PORTAL_STATUS, { status: 'unavailable', isWayland: true });
    });
  }

  let isQuitting = false;
  app.on('before-quit', () => { isQuitting = true; });

  mainWindow.on('close', (event) => {
    // Minimize to tray instead of quitting
    if (!isQuitting) {
      event.preventDefault();
      mainWindow.hide();
    }
  });
});

app.on('window-all-closed', () => {
  // On Linux, keep alive in tray; only quit explicitly
});

app.on('activate', () => {
  const win = getMainWindow();
  if (win) {
    win.show();
    win.focus();
  } else if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow();
  }
});
