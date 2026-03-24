import { registerProfileIpc } from './profile';
import { registerScreenShareIpc } from './screen-share';
import { registerNotificationIpc } from './notifications';
import { registerPopoutIpc } from './popout';
import { ipcMain } from 'electron';
import { IPC } from '../../shared/ipc-channels';
import { isWayland } from '../platform/wayland';

export function registerAllIpc(): void {
  registerProfileIpc();
  registerScreenShareIpc();
  registerNotificationIpc();
  registerPopoutIpc();

  ipcMain.handle(IPC.APP_IS_WAYLAND, () => isWayland());
}
