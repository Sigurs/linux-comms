import { join } from 'node:path';
import { app, BrowserWindow, desktopCapturer, ipcMain, screen, session } from 'electron';
import { IPC } from '../../shared/ipc-channels';
import type { DesktopSource } from '../../shared/types';
import { getPortalStatus } from '../platform/portal';
import { isWayland } from '../platform/wayland';

export const debugScreenShare = app.commandLine.hasSwitch('debug');

/**
 * Register a setDisplayMediaRequestHandler for a provider session on Wayland.
 * Without this, Electron 30+ drops getDisplayMedia() requests from webview contexts
 * before they reach the xdg-desktop-portal. Calling callback({}) with no streams
 * tells Chromium to use its built-in portal path (PipeWire via WebRTCPipeWireCapturer).
 * No-op on X11 — the existing custom picker flow handles that path.
 */
export function applyWaylandDisplayMediaHandler(partition: string): void {
	if (!isWayland()) return;
	const sess = session.fromPartition(partition);
	sess.setDisplayMediaRequestHandler((_request, callback) => {
		if (debugScreenShare) {
			console.log(
				`[screen-share] handler invoked wayland=true portalStatus=${getPortalStatus()} partition=${partition}`,
			);
		}
		// No video/audio specified → Chromium routes to xdg-desktop-portal on Wayland
		callback({});
	});
}

export function registerScreenShareIpc(): void {
	ipcMain.handle(IPC.PORTAL_STATUS, () => ({
		status: getPortalStatus(),
		isWayland: isWayland(),
	}));

	// On Wayland, Chromium routes getDisplayMedia through xdg-desktop-portal automatically.
	// This handler is only needed on X11 where we show our own source picker.
	ipcMain.handle(
		IPC.SCREEN_SHARE_GET_SOURCES,
		async (): Promise<DesktopSource[]> => {
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
		},
	);

	// Opens a small picker window and resolves with the chosen source id (or null)
	ipcMain.handle(
		IPC.SCREEN_SHARE_SHOW_PICKER,
		async (): Promise<string | null> => {
			if (isWayland()) return null;
			return showSourcePickerWindow();
		},
	);

	ipcMain.on(IPC.SCREEN_SHARE_PICK_SOURCE, (event, sourceId: string | null) => {
		// Picker window sends this; we close the picker and relay to the waiting handle
		const win = BrowserWindow.fromWebContents(event.sender);
		if (win) {
			pendingPickerResolve?.(sourceId);
			pendingPickerResolve = null;
			win.close();
		}
	});

	ipcMain.on(IPC.SCREEN_SHARE_DEBUG_ERROR, (_event, name: string, message: string) => {
		if (debugScreenShare) {
			console.log(`[screen-share] webview error name=${name} message=${message}`);
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
