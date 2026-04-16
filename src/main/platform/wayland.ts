import { app } from 'electron';

export function isWayland(): boolean {
	return !!process.env.WAYLAND_DISPLAY;
}

/**
 * Apply Wayland or X11 command-line flags before app is ready.
 * Must be called before app.whenReady().
 */
export function applyPlatformFlags(): void {
	if (isWayland()) {
		app.commandLine.appendSwitch('ozone-platform', 'wayland');

		// Merge additively — appendSwitch replaces, so read first to keep existing flags
		const existing = app.commandLine.getSwitchValue('enable-features');
		const required = ['WaylandWindowDecorations', 'UseOzonePlatform', 'WebRTCPipeWireCapturer'];
		const merged = existing
			? [...new Set([...existing.split(',').filter(Boolean), ...required])].join(',')
			: required.join(',');
		app.commandLine.appendSwitch('enable-features', merged);

		app.commandLine.appendSwitch('enable-wayland-ime');
		console.log('[platform] Running with Wayland backend');

		// xdg-desktop-portal requires these env vars; warn early so the log is actionable
		if (!process.env.DBUS_SESSION_BUS_ADDRESS) {
			console.warn('[platform] DBUS_SESSION_BUS_ADDRESS not set — xdg-desktop-portal may fail');
		}
		if (!process.env.XDG_RUNTIME_DIR) {
			console.warn('[platform] XDG_RUNTIME_DIR not set — xdg-desktop-portal may fail');
		}
	} else {
		console.log('[platform] Running with X11 backend');
	}

	// Needed for screen sharing and media APIs in all environments
	app.commandLine.appendSwitch('enable-usermedia-screen-capturing');
}
