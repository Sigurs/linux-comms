import { join } from 'node:path';
import { app, Menu, nativeImage, Tray } from 'electron';
import { getMainWindow } from './window';

let tray: Tray | null = null;

export function createTray(): void {
	const iconPath = join(__dirname, '../../assets/icons/16x16.png');
	const icon = nativeImage.createFromPath(iconPath);
	tray = new Tray(icon.isEmpty() ? nativeImage.createEmpty() : icon);
	tray.setToolTip('Linux Comms');
	updateTrayMenu();

	tray.on('click', () => {
		const win = getMainWindow();
		if (!win) return;
		if (win.isVisible()) {
			win.hide();
		} else {
			win.show();
			win.focus();
		}
	});
}

export function updateTrayMenu(): void {
	if (!tray) return;
	const contextMenu = Menu.buildFromTemplate([
		{
			label: 'Show Linux Comms',
			click: () => {
				const win = getMainWindow();
				if (win) {
					win.show();
					win.focus();
				}
			},
		},
		{ type: 'separator' },
		{
			label: 'Quit',
			click: () => app.quit(),
		},
	]);
	tray.setContextMenu(contextMenu);
}

export function setTrayBadge(hasActivity: boolean): void {
	if (!tray) return;
	// On Linux we update the tooltip to indicate activity; native badge overlay
	// is compositor-specific and not universally supported via Electron's tray API.
	tray.setToolTip(
		hasActivity ? 'Linux Comms • Unread messages' : 'Linux Comms',
	);
	// Use overlay icon if available
	const win = getMainWindow();
	if (win) {
		win.setTitle(hasActivity ? '• Linux Comms' : 'Linux Comms');
	}
}
