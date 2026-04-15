import { ipcMain, shell } from 'electron';
import { IPC } from '../../shared/ipc-channels';
import { isWayland } from '../platform/wayland';
import { registerLinkOpenIpc } from './link-open';
import { registerNotificationIpc } from './notifications';
import { registerPopoutIpc } from './popout';
import { registerProfileIpc } from './profile';
import { registerScreenShareIpc } from './screen-share';

export function registerAllIpc(): void {
	registerProfileIpc();
	registerScreenShareIpc();
	registerNotificationIpc();
	registerPopoutIpc();
	registerLinkOpenIpc();

	ipcMain.handle(IPC.APP_IS_WAYLAND, () => isWayland());

	ipcMain.handle(IPC.SHELL_OPEN_EXTERNAL, (_event, url: string) => {
		// Only allow http/https URLs
		if (/^https?:\/\//.test(url)) {
			void shell.openExternal(url);
		}
	});
}
