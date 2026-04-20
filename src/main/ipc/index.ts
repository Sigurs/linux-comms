import { ipcMain, shell } from 'electron';
import { IPC } from '../../shared/ipc-channels';
import { isWayland } from '../platform/wayland';
import { debugLinkOpen, registerLinkOpenIpc } from './link-open';
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
		if (/^https?:\/\//.test(url)) {
			if (debugLinkOpen) console.log('[link-open] shell:open-external dispatched url=' + url);
			void shell.openExternal(url);
		} else {
			if (debugLinkOpen) {
				let scheme = '';
				try { scheme = new URL(url).protocol; } catch (_) { scheme = url.split(':')[0] + ':'; }
				console.log('[link-open] shell:open-external rejected scheme=' + scheme + ' url=' + url);
			}
		}
	});
}
