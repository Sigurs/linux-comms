import { ipcMain, desktopCapturer, BrowserWindow, screen } from 'electron';
import { join } from 'path';
import { IPC } from '../../shared/ipc-channels';
import { isWayland } from '../platform/wayland';
import { getPortalStatus } from '../platform/portal';
import type { DesktopSource } from '../../shared/types';

export function registerScreenShareIpc(): void {
  ipcMain.handle(IPC.PORTAL_STATUS, () => ({
    status: getPortalStatus(),
    isWayland: isWayland(),
  }));

  // On Wayland, Chromium routes getDisplayMedia through xdg-desktop-portal automatically.
  // This handler is only needed on X11 where we show our own source picker.
  ipcMain.handle(IPC.SCREEN_SHARE_GET_SOURCES, async (): Promise<DesktopSource[]> => {
    if (isWayland()) {
      // Not needed on Wayland; portal handles it
      return [];
    }
    const sources = await desktopCapturer.getSources({
      types: ['screen', 'window'],
      thumbnailSize: { width: 320, height: 180 },
    });
    return sources.map((s) => ({
      id: s.id,
      name: s.name,
      thumbnailDataUrl: s.thumbnail.toDataURL(),
      displayId: s.display_id,
    }));
  });

  // Opens a small picker window and resolves with the chosen source id (or null)
  ipcMain.handle(IPC.SCREEN_SHARE_SHOW_PICKER, async (): Promise<string | null> => {
    if (isWayland()) return null;
    return showSourcePickerWindow();
  });

  ipcMain.on(IPC.SCREEN_SHARE_PICK_SOURCE, (event, sourceId: string | null) => {
    // Picker window sends this; we close the picker and relay to the waiting handle
    const win = BrowserWindow.fromWebContents(event.sender);
    if (win) {
      pendingPickerResolve?.(sourceId);
      pendingPickerResolve = null;
      win.close();
    }
  });
}

let pendingPickerResolve: ((id: string | null) => void) | null = null;

async function showSourcePickerWindow(): Promise<string | null> {
  return new Promise((resolve) => {
    pendingPickerResolve = resolve;

    const { width, height } = screen.getPrimaryDisplay().workAreaSize;
    const pickerWidth = 800;
    const pickerHeight = 520;

    const picker = new BrowserWindow({
      width: pickerWidth,
      height: pickerHeight,
      x: Math.round((width - pickerWidth) / 2),
      y: Math.round((height - pickerHeight) / 2),
      resizable: false,
      minimizable: false,
      maximizable: false,
      title: 'Choose what to share',
      webPreferences: {
        contextIsolation: true,
        nodeIntegration: false,
        preload: join(__dirname, '../../preload/picker-preload.js'),
      },
    });

    picker.loadFile(join(__dirname, '../../renderer/picker.html'));
    picker.once('closed', () => {
      pendingPickerResolve?.(null);
      pendingPickerResolve = null;
    });
  });
}
