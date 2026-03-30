import type { Profile } from '../shared/types';

/** Injected into each webview after dom-ready to bridge Notifications and screen sharing */
const INJECTION_SCRIPT = `
(function() {
  if (!window.__linuxComms || window.__linuxCommsInjected) return;
  window.__linuxCommsInjected = true;
  const lc = window.__linuxComms;

  // ── Notification override ──
  const OrigNotif = window.Notification;
  const MockNotif = function(title, options) {
    lc.sendNotification(lc.__profileId || '', title, options && options.body ? options.body : '');
    try { return new OrigNotif(title, options); } catch(e) { return {}; }
  };
  MockNotif.permission = 'granted';
  MockNotif.requestPermission = function() { return Promise.resolve('granted'); };
  Object.defineProperty(window, 'Notification', { value: MockNotif, writable: true });

  // ── window.open override for link choice dialog ──
  window.open = function(url, target, features) {
    lc.openLinkChoice(url || '');
    return null;
  };

  // ── Page Visibility API override ──
  // Webviews always report 'visible' by default, which prevents web apps like
  // RocketChat from accumulating unread counts in the title when not active.
  // We override the API and expose a setter so the renderer can flip it on profile switch.
  var _hidden = false;
  try {
    Object.defineProperty(document, 'hidden', { get: function() { return _hidden; }, configurable: true });
    Object.defineProperty(document, 'visibilityState', { get: function() { return _hidden ? 'hidden' : 'visible'; }, configurable: true });
  } catch(e) {}
  window.__linuxCommsSetHidden = function(hidden) {
    _hidden = !!hidden;
    document.dispatchEvent(new Event('visibilitychange'));
  };

  // ── getDisplayMedia override (X11 only) ──
  if (!lc.isWayland && navigator.mediaDevices) {
    const origGetDisplayMedia = navigator.mediaDevices.getDisplayMedia
      ? navigator.mediaDevices.getDisplayMedia.bind(navigator.mediaDevices)
      : null;
    navigator.mediaDevices.getDisplayMedia = async function(constraints) {
      const sourceId = await lc.requestScreenShare();
      if (!sourceId) throw new DOMException('Permission denied', 'NotAllowedError');
      return navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          mandatory: {
            chromeMediaSource: 'desktop',
            chromeMediaSourceId: sourceId,
          }
        }
      });
    };
  }
})();
`;

type WebviewEl = Electron.WebviewTag & { profileId?: string };

export class WebviewManager {
  private webviews: Map<string, WebviewEl> = new Map();
  private profiles: Map<string, Profile> = new Map();
  private readyWebviews: Set<string> = new Set();
  private activeProfileId: string | null = null;
  private container: HTMLElement;
  private onBadgeChange: (profileId: string, count: number) => void;

  constructor(container: HTMLElement, onBadgeChange: (profileId: string, count: number) => void) {
    this.container = container;
    this.onBadgeChange = onBadgeChange;
  }

  ensureWebview(profile: Profile): WebviewEl {
    this.profiles.set(profile.id, profile);

    if (this.webviews.has(profile.id)) {
      return this.webviews.get(profile.id)!;
    }

    const wv = document.createElement('webview') as WebviewEl;
    wv.profileId = profile.id;

    // Security settings
    wv.setAttribute('src', profile.url);
    wv.setAttribute('partition', profile.partition);
    wv.setAttribute(
      'preload',
      // The preload path is resolved relative to the app bundle
      `file://${getPreloadPath()}`
    );

    if (profile.providerId === 'teams') {
      // Teams requires Chrome UA — set at webview level too (belt-and-suspenders)
      wv.setAttribute(
        'useragent',
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36'
      );
    }

    // DOM-ready: inject overrides and store the profile ID in the preload context
    wv.addEventListener('dom-ready', () => {
      // Inject the profile ID into the webview so notifications carry the right ID
      wv.executeJavaScript(
        `window.__linuxComms && (window.__linuxComms.__profileId = "${profile.id}");`
      ).catch(() => {});
      wv.executeJavaScript(INJECTION_SCRIPT).catch(() => {});

      // Mark as ready so switchTo() knows it's safe to call executeJavaScript.
      this.readyWebviews.add(profile.id);

      // If this webview is not the active one, mark it as hidden so web apps
      // (e.g. RocketChat) accumulate unread counts while the user is elsewhere.
      if (this.activeProfileId !== profile.id) {
        wv.executeJavaScript('window.__linuxCommsSetHidden && window.__linuxCommsSetHidden(true)').catch(() => {});
      }

      // Apply profile's zoom level
      if (this.activeProfileId === profile.id) {
        wv.setZoomLevel(profile.zoomLevel ?? 0);
      }
    });

    // Title update → badge parsing
    wv.addEventListener('page-title-updated', (e) => {
      const title = (e as Event & { title: string }).title ?? '';
      const match = /^\((\d+)\)/.exec(title);
      const count = match ? parseInt(match[1], 10) : 0;
      this.onBadgeChange(profile.id, count);
    });

    // Relay ipc-message from webview preload (badge updates via sendToHost)
    wv.addEventListener('ipc-message', (e) => {
      const ev = e as Event & { channel: string; args: unknown[] };
      if (ev.channel === 'badge-update') {
        this.onBadgeChange(profile.id, (ev.args[0] as number) ?? 0);
      } else if (ev.channel === 'link-open-request') {
        const url = ev.args[0] as string;
        if (url) {
          window.electronAPI.openLinkChoice(url, profile.id);
        }
      }
    });

    // Handle anchor-based new-window requests (e.g. <a target="_blank">).
    // These bypass the window.open() JS override and fire as native webview events.
    wv.addEventListener('new-window', (e) => {
      const ev = e as Event & { url: string };
      if (ev.url) {
        window.electronAPI.openLinkChoice(ev.url, profile.id);
      }
    });

    this.container.appendChild(wv);
    this.webviews.set(profile.id, wv);
    return wv;
  }

  switchTo(profileId: string): void {
    if (this.activeProfileId === profileId) return;

    // Hide previous
    if (this.activeProfileId) {
      const prev = this.webviews.get(this.activeProfileId);
      if (prev) {
        prev.classList.remove('active');
        if (this.readyWebviews.has(this.activeProfileId)) {
          prev.executeJavaScript('window.__linuxCommsSetHidden && window.__linuxCommsSetHidden(true)').catch(() => {});
        }
      }
    }

    // Show new
    const next = this.webviews.get(profileId);
    if (next) {
      next.classList.add('active');
      if (this.readyWebviews.has(profileId)) {
        next.executeJavaScript('window.__linuxCommsSetHidden && window.__linuxCommsSetHidden(false)').catch(() => {});
      }
      const profile = this.profiles.get(profileId);
      if (profile) {
        try {
          next.setZoomLevel(profile.zoomLevel ?? 0);
        } catch {
          // Webview not ready yet; dom-ready handler will apply zoom
        }
      }
    }

    this.activeProfileId = profileId;
    window.electronAPI.setActiveProfile(profileId);
    document.getElementById('empty-state')!.style.display = 'none';
  }

  applyZoom(profileId: string, zoomLevel: number): void {
    this.profiles.set(profileId, { ...this.profiles.get(profileId)!, zoomLevel });
    const wv = this.webviews.get(profileId);
    if (wv) {
      wv.setZoomLevel(zoomLevel);
    }
  }

  getProfile(profileId: string): Profile | undefined {
    return this.profiles.get(profileId);
  }

  getActiveProfileId(): string | null {
    return this.activeProfileId;
  }

  removeWebview(profileId: string): void {
    const wv = this.webviews.get(profileId);
    if (!wv) return;
    wv.remove();
    this.webviews.delete(profileId);
    this.readyWebviews.delete(profileId);
    if (this.activeProfileId === profileId) {
      this.activeProfileId = null;
    }
  }

  popOut(profileId: string): void {
    window.electronAPI.openPopout(profileId);
    // Hide the embedded webview while it's popped out
    const wv = this.webviews.get(profileId);
    if (wv) {
      wv.classList.remove('active');
      if (this.readyWebviews.has(profileId)) {
        wv.executeJavaScript('window.__linuxCommsSetHidden && window.__linuxCommsSetHidden(true)').catch(() => {});
      }
    }
    if (this.activeProfileId === profileId) {
      this.activeProfileId = null;
    }
  }

  restorePopout(profileId: string): void {
    this.switchTo(profileId);
  }

  restorePopoutSilent(_profileId: string): void {
    // Re-embed the webview into the DOM without switching to it.
    // The webview was only hidden (active class removed) when popped out,
    // so no DOM re-attachment is needed — it remains ready for manual selection.
  }

  reload(profileId: string): void {
    const wv = this.webviews.get(profileId);
    const profile = this.profiles.get(profileId);
    if (wv && profile) {
      wv.loadURL(profile.url);
    }
  }
}

function getPreloadPath(): string {
  // In packaged app __dirname is inside asar; build a path to the preload
  // dist/renderer/bundle.js is the running script, preload is at dist/preload/webview-preload.js
  const base = window.location.pathname.replace(/\/renderer\/.*$/, '');
  return `${base}/preload/webview-preload.js`;
}

// Extend Window type for our API
declare global {
  interface Window {
    electronAPI: {
      isWayland: () => Promise<boolean>;
      getAll: () => Promise<{
        profiles: Profile[];
        providers: { id: string; name: string; icon: string }[];
      }>;
      addProfile: (
        providerId: string,
        name: string,
        config: Record<string, string>
      ) => Promise<Profile>;
      removeProfile: (profileId: string, partition: string) => Promise<void>;
      renameProfile: (profileId: string, newName: string) => Promise<Profile>;
      setActiveProfile: (profileId: string) => void;
      updateZoomLevel: (profileId: string, zoomLevel: number) => Promise<Profile | undefined>;
      getPortalStatus: () => Promise<{ status: string; isWayland: boolean }>;
      showScreenSharePicker: () => Promise<string | null>;
      openPopout: (profileId: string) => void;
      openLinkChoice: (url: string, profileId: string) => Promise<void>;
      onProfileUpdated: (
        cb: (data: { profiles: Profile[]; providers: unknown[] }) => void
      ) => () => void;
      onNotificationClick: (cb: (profileId: string) => void) => () => void;
      onPortalStatus: (cb: (data: { status: string; isWayland: boolean }) => void) => () => void;
      onPopoutClosed: (cb: (profileId: string) => void) => () => void;
    };
  }
}
