import { BrowserWindow, ipcMain, Notification } from 'electron';
import { IPC } from '../../shared/ipc-channels';
import type { NotificationPayload } from '../../shared/types';

export function registerNotificationIpc(): void {
	ipcMain.on(IPC.NOTIFICATION_SEND, (_event, payload: NotificationPayload) => {
		if (!Notification.isSupported()) return;

		const notif = new Notification({
			title: payload.title,
			body: payload.body,
			silent: false,
		});

		notif.on('click', () => {
			// Focus the main window and tell renderer to switch to this profile
			const mainWin = BrowserWindow.getAllWindows().find(
				(w) => !w.isDestroyed(),
			);
			if (mainWin) {
				if (mainWin.isMinimized()) mainWin.restore();
				mainWin.show();
				mainWin.focus();
				mainWin.webContents.send(IPC.NOTIFICATION_CLICK, payload.profileId);
			}
		});

		notif.show();
	});
}
