/**
 * Webview preload — injected into every provider webview.
 * Exposes a minimal bridge (window.__linuxComms) to the page's main world,
 * which the dom-ready injection scripts use to relay notifications and
 * handle screen sharing on X11.
 */
export {};
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { ipcRenderer, contextBridge } = require('electron') as typeof import('electron');

const isWayland = !!process.env['WAYLAND_DISPLAY'];

contextBridge.exposeInMainWorld('__linuxComms', {
  isWayland,

  /** Send a notification to main process to display natively */
  sendNotification: (profileId: string, title: string, body: string) => {
    ipcRenderer.send('notification:send', { profileId, title, body });
  },

  /** Request screen share sources (X11 only — on Wayland portal handles it) */
  requestScreenShare: async (): Promise<string | null> => {
    return ipcRenderer.invoke('screen-share:show-picker');
  },

  /** Report badge/unread count update to host shell */
  reportBadge: (count: number) => {
    ipcRenderer.sendToHost('badge-update', count);
  },

  /** Notify host that a link wants to open */
  openLinkChoice: (url: string): void => {
    ipcRenderer.sendToHost('link-open-request', url);
  },
});

// Grant Notification permission at the preload level
// (the actual override is injected post dom-ready via executeJavaScript)
ipcRenderer.on('inject-notification-override', (_event, profileId: string) => {
  // This channel is sent by the webview manager after dom-ready
  // The actual injection is done via webview.executeJavaScript in the renderer
  void profileId;
});
