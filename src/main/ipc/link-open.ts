import { join } from 'node:path';
import { BrowserWindow, dialog, ipcMain, shell } from 'electron';
import { getProvider } from '../../providers';
import { IPC } from '../../shared/ipc-channels';
import { getAllProfiles } from '../store/profile-store';
import { applySessionPermissions, getMainWindow } from '../window';

function truncateUrl(url: string, maxLength: number = 60): string {
	if (url.length <= maxLength) return url;
	return `${url.substring(0, maxLength - 3)}...`;
}

let dialogOpen = false;

export async function showLinkOpenDialog(
	url: string,
	profileId: string,
	parentWin: BrowserWindow | null,
): Promise<void> {
	if (dialogOpen) return;

	try {
		console.log('[link-open] URL:', url, 'ProfileId:', profileId);

		// Validate URL early to fail fast with malformed URLs
		try {
			new URL(url);
		} catch (urlErr) {
			console.log(
				'[link-open] Invalid URL format:',
				url,
				'Error:',
				urlErr instanceof Error ? urlErr.message : String(urlErr),
			);
			// Show error to user instead of crashing
			const errorDialogOptions = {
				type: 'error' as const,
				title: 'Invalid Link',
				message: 'Cannot open this link',
				detail: `The URL "${truncateUrl(url, 100)}" is not valid.`,
				buttons: ['OK'],
			};
			if (parentWin) {
				await dialog.showMessageBox(parentWin, errorDialogOptions);
			} else {
				await dialog.showMessageBox(errorDialogOptions);
			}
			return;
		}

		const profiles = getAllProfiles();
		const profile = profiles.find((p) => p.id === profileId);

		if (!profile) {
			console.log('[link-open] Profile not found for ID:', profileId);
			// Fall back to opening in browser if profile is missing
			await shell.openExternal(url);
			return;
		}

		console.log(
			'[link-open] Profile found:',
			profile?.name,
			'Partition:',
			profile?.partition,
		);

		const truncatedUrl = truncateUrl(url, 60);

		const dialogOptions = {
			type: 'question' as const,
			title: 'Open Link',
			message: `How would you like to open this link?`,
			detail: truncatedUrl,
			buttons: ['Open in Browser', 'Open in Popup', 'Cancel'],
			defaultId: 0,
			cancelId: 2,
		};

		dialogOpen = true;
		let result: any;
		try {
			result = parentWin
				? await dialog.showMessageBox(parentWin, dialogOptions)
				: await dialog.showMessageBox(dialogOptions);
		} finally {
			dialogOpen = false;
		}

		console.log('[link-open] User choice:', result.response);

		if (result.response === 2) {
			return;
		}

		if (result.response === 0) {
			console.log('[link-open] Opening in browser');
			await shell.openExternal(url);
			return;
		}

		if (result.response === 1) {
			console.log('[link-open] Opening in popup');

			const provider = getProvider(profile.providerId);
			if (provider) {
				applySessionPermissions(
					profile.partition,
					provider.webviewOptions.allowedPermissions ?? [],
				);
			}

			console.log(
				'[link-open] Creating BrowserWindow with partition:',
				profile.partition,
			);
			const win = new BrowserWindow({
				width: 1200,
				height: 800,
				title: `Loading... — ${profile.name}`,
				webPreferences: {
					contextIsolation: true,
					nodeIntegration: false,
					partition: profile.partition,
					preload: join(__dirname, '../../preload/webview-preload.js'),
				},
			});

			if (provider?.webviewOptions.userAgent) {
				win.webContents.setUserAgent(provider.webviewOptions.userAgent);
			}

			win.webContents.on('page-title-updated', (_event, title) => {
				win.setTitle(`${title} — ${profile.name}`);
			});

			win.loadURL(url);
			console.log('[link-open] Popup window created');
		}
	} catch (err) {
		console.log(
			'[link-open] Unexpected error:',
			err instanceof Error ? err.message : String(err),
		);
		dialogOpen = false; // Ensure dialog state is reset
		// Show generic error to user
		const errorDialogOptions = {
			type: 'error' as const,
			title: 'Error Opening Link',
			message: 'An unexpected error occurred',
			detail: 'The link could not be opened due to an internal error.',
			buttons: ['OK'],
		};
		if (parentWin) {
			await dialog.showMessageBox(parentWin, errorDialogOptions);
		} else {
			await dialog.showMessageBox(errorDialogOptions);
		}
	}
}

export function registerLinkOpenIpc(): void {
	ipcMain.handle(
		IPC.LINK_OPEN_PROMPT,
		(_event, url: string, profileId: string) =>
			showLinkOpenDialog(url, profileId, getMainWindow()),
	);
}
