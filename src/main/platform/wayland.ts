import { app } from 'electron';

export function isWayland(): boolean {
  return !!process.env['WAYLAND_DISPLAY'];
}

/**
 * Apply Wayland or X11 command-line flags before app is ready.
 * Must be called before app.whenReady().
 */
export function applyPlatformFlags(): void {
  if (isWayland()) {
    app.commandLine.appendSwitch('ozone-platform', 'wayland');
    app.commandLine.appendSwitch('enable-features', 'WaylandWindowDecorations,UseOzonePlatform,WebRTCPipeWireCapturer');
    app.commandLine.appendSwitch('enable-wayland-ime');
    console.log('[platform] Running with Wayland backend');
  } else {
    console.log('[platform] Running with X11 backend');
  }

  // Needed for screen sharing and media APIs in all environments
  app.commandLine.appendSwitch('enable-usermedia-screen-capturing');
}
