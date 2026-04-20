import { join } from 'node:path';
import { app, BrowserWindow, dialog, ipcMain, shell } from 'electron';
import { getProvider } from '../../providers';
import { IPC } from '../../shared/ipc-channels';
import { getAllProfiles } from '../store/profile-store';
import { applySessionPermissions, getMainWindow } from '../window';

export const debugLinkOpen = app.commandLine.hasSwitch('debug');

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
	if (dialogOpen) {
		if (debugLinkOpen) console.log('[link-open] duplicate discarded profileId=' + profileId + ' url=' + url);
		return;
	}

	try {

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
			if (debugLinkOpen) console.log('[link-open] profile not found profileId=' + profileId + ' url=' + url + ' — falling back to browser');
			await shell.openExternal(url);
			return;
		}

		const provider = getProvider(profile.providerId);
		let urlScheme = '';
		try { urlScheme = new URL(url).protocol; } catch (_) {}

		if (debugLinkOpen) console.log('[link-open] entry profileId=' + profileId + ' profile=' + profile.name + ' provider=' + profile.providerId + ' partition=' + profile.partition + ' scheme=' + urlScheme + ' url=' + url);

		if (debugLinkOpen) {
			const trustedDomains = provider?.trustedDomains;
			if (!trustedDomains || trustedDomains.length === 0) {
				console.log('[link-open] trusted-domains: none configured for provider=' + profile.providerId);
			} else {
				const matched = trustedDomains.find((pattern) => {
					try {
						const hostname = new URL(url).hostname;
						if (pattern.startsWith('*.')) {
							const suffix = pattern.slice(1);
							return hostname === pattern.slice(2) || hostname.endsWith(suffix);
						}
						return hostname === pattern;
					} catch (_) { return false; }
				});
				console.log('[link-open] trusted-domains provider=' + profile.providerId + ' matched=' + (matched ?? 'no match'));
			}
		}

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

		const actions = ['browser', 'popup', 'cancel'] as const;
		if (debugLinkOpen) console.log('[link-open] user choice response=' + result.response + ' action=' + (actions[result.response] ?? 'unknown'));

		if (result.response === 2) {
			return;
		}

		if (result.response === 0) {
			if (debugLinkOpen) console.log('[link-open] opening in browser url=' + url);
			await shell.openExternal(url);
			return;
		}

		if (result.response === 1) {
			if (debugLinkOpen) console.log('[link-open] opening in popup partition=' + profile.partition + ' url=' + url);

			if (provider) {
				applySessionPermissions(
					profile.partition,
					provider.webviewOptions.allowedPermissions ?? [],
				);
			}
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
