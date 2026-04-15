import type { Profile, ProfileIcon } from '../shared/types';
import { getProvider } from '../providers';

/**
 * Injected into Teams webviews post-login to find the organisation logo.
 * Uses MutationObserver with a priority-ordered selector list; calls
 * window.__linuxComms.reportOrgLogo() on first match, then stops.
 * Self-terminates after 10 s if nothing is found.
 */
const TEAMS_LOGO_OBSERVER_SCRIPT = `
(function() {
  if (window.__linuxCommsLogoInjected) return;
  window.__linuxCommsLogoInjected = true;

  const SELECTORS = [
    // Teams web specific — org avatar in header
    '[data-testid="orgAvatar"] img',
    '[data-testid="org-avatar"] img',
    '[class*="orgAvatar"] img',
    '[class*="org-avatar"] img',
    // Broader: any img inside the top app bar or header with a tenant/org hint
    'header [aria-label*="organization"] img',
    'header [aria-label*="company"] img',
    'header [title*="organization"] img',
    'header [title*="company"] img',
    // Generic header image fallback (first img in header that isn't a user avatar)
    'header img[src*="tenant"]',
    'header img[src*="organization"]',
    'header img[src*="logo"]',
  ];

  function tryFind() {
    for (const sel of SELECTORS) {
      try {
        const el = document.querySelector(sel);
        if (el && el.src) {
          const url = new URL(el.src, location.origin).href;
          if (window.__linuxComms && window.__linuxComms.reportOrgLogo) {
            window.__linuxComms.reportOrgLogo(url);
          }
          return true;
        }
      } catch(e) {}
    }
    return false;
  }

  if (tryFind()) return;

  const observer = new MutationObserver(() => {
    if (tryFind()) observer.disconnect();
  });
  observer.observe(document.body, { childList: true, subtree: true });

  // Self-terminate after 10 s
  setTimeout(() => observer.disconnect(), 10000);
})();
`;

/** Injected into each webview after dom-ready to bridge Notifications and screen sharing */
const INJECTION_SCRIPT = `
(function() {
  if (!window.__linuxComms || window.__linuxCommsInjected) return;
  window.__linuxCommsInjected = true;
  const lc = window.__linuxComms;

  // ── Notification override ──
  const OrigNotif = window.Notification;
  var _notifCount = 0;
  const MockNotif = function(title, options) {
    lc.sendNotification(lc.__profileId || '', title, options && options.body ? options.body : '');
    if (_hidden) {
      _notifCount++;
      lc.reportBadge(_notifCount);
    }
    try { return new OrigNotif(title, options); } catch(e) { return {}; }
  };
  MockNotif.permission = 'granted';
  MockNotif.requestPermission = function() { return Promise.resolve('granted'); };
  Object.defineProperty(window, 'Notification', { value: MockNotif, writable: true });

  // ── window.open override for link choice dialog ──
  window.open = function(url, target, features) {
    console.log('[link] window.open intercepted:', url, 'target:', target);
    lc.openLinkChoice(url || '');
    return null;
  };

  // ── Anchor click interceptor for <a target="_blank"> links ──
  // Catches links that don't go through window.open() (e.g. RocketChat's
  // <a href="..." target="_blank" rel="noopener noreferrer"> message links),
  // which are not reliably caught by the webview new-window event in Electron 41.
  document.addEventListener('click', function(e) {
    var anchor = e.target && e.target.closest ? e.target.closest('a') : null;
    if (!anchor || !anchor.href || anchor.target !== '_blank') return;
    try {
      var destOrigin = new URL(anchor.href).origin;
      if (destOrigin === location.origin) return; // same-origin — let browser handle it
    } catch(err) {
      console.log('[link] anchor click error - malformed URL:', anchor.href, 'Error:', err.message);
      return; // Let browser handle malformed URLs
    }
    console.log('[link] anchor click intercepted:', anchor.href);
    e.preventDefault();
    lc.openLinkChoice(anchor.href);
  }, true); // capture phase so we run before any SPA click handlers

  // ── Page Visibility API override ──
  // Webviews always report 'visible' by default, which prevents web apps like
  // RocketChat from accumulating unread counts in the title when not active.
  // We override via the prototype chain (not the instance) because document.hidden
  // and document.visibilityState are defined on Document.prototype in Chromium, where
  // they are configurable — instance-level Object.defineProperty may fail silently.
  var _hidden = false;
  function _overrideDocProp(name, getFn) {
    var proto = document;
    while (proto && !Object.getOwnPropertyDescriptor(proto, name)) {
      proto = Object.getPrototypeOf(proto);
    }
    if (proto) {
      try { Object.defineProperty(proto, name, { get: getFn, configurable: true }); } catch(e) {}
    }
  }
  _overrideDocProp('hidden', function() { return _hidden; });
  _overrideDocProp('visibilityState', function() { return _hidden ? 'hidden' : 'visible'; });
  // Also override hasFocus() so apps that gate unread accumulation on focus agree with
  // the visibility state we report.
  var _origHasFocus = document.hasFocus.bind(document);
  document.hasFocus = function() { return _hidden ? false : _origHasFocus(); };
  window.__linuxCommsSetHidden = function(hidden) {
    var wasHidden = _hidden;
    _hidden = !!hidden;
    if (wasHidden && !_hidden) {
      // Becoming active: clear notification-based badge counter.
      _notifCount = 0;
      lc.reportBadge(0);
    }
    document.dispatchEvent(new Event('visibilitychange', { bubbles: false }));
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

function matchesTrustedDomain(url: string, trustedDomains: string[]): boolean {
  let hostname: string;
  try {
    hostname = new URL(url).hostname;
  } catch (err) {
    console.log(
      '[link] matchesTrustedDomain error - malformed URL:',
      url,
      'Error:',
      err instanceof Error ? err.message : String(err)
    );
    return false;
  }
  return trustedDomains.some((pattern) => {
    if (pattern.startsWith('*.')) {
      const suffix = pattern.slice(1); // e.g. ".microsoft.com"
      return hostname === pattern.slice(2) || hostname.endsWith(suffix);
    }
    return hostname === pattern;
  });
}

type WebviewEl = Electron.WebviewTag & { profileId?: string; logoObserverInjected?: boolean };

export class WebviewManager {
  private webviews: Map<string, WebviewEl> = new Map();
  private profiles: Map<string, Profile> = new Map();
  private readyWebviews: Set<string> = new Set();
  private activeProfileId: string | null = null;
  private container: HTMLElement;
  private onBadgeChange: (profileId: string, count: number) => void;
  private orgLogoCache: Map<string, string> = new Map();

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
        wv.executeJavaScript(
          'window.__linuxCommsSetHidden && window.__linuxCommsSetHidden(true)'
        ).catch(() => {});
      }

      // Apply profile's zoom level
      if (this.activeProfileId === profile.id) {
        wv.setZoomLevel(profile.zoomLevel ?? 0);
      }
    });

    // Title update → badge parsing + Teams logo detection (post-login)
    wv.addEventListener('page-title-updated', (e) => {
      const title = (e as Event & { title: string }).title ?? '';
      const match = /^\((\d+)\)/.exec(title);
      const count = match ? parseInt(match[1], 10) : 0;
      this.onBadgeChange(profile.id, count);

      // Inject Teams logo observer once after the page title is non-empty
      // (indicates the app has rendered and the user is authenticated)
      if (
        profile.providerId === 'teams' &&
        !wv.logoObserverInjected &&
        title.length > 0 &&
        this.readyWebviews.has(profile.id)
      ) {
        wv.logoObserverInjected = true;
        wv.executeJavaScript(TEAMS_LOGO_OBSERVER_SCRIPT).catch(() => {});
      }
    });

    // Relay ipc-message from webview preload (badge updates via sendToHost)
    wv.addEventListener('ipc-message', (e) => {
      const ev = e as Event & { channel: string; args: unknown[] };
      if (ev.channel === 'badge-update') {
        this.onBadgeChange(profile.id, (ev.args[0] as number) ?? 0);
      } else if (ev.channel === 'org-logo-found') {
        const url = ev.args[0] as string;
        if (url) {
          this.orgLogoCache.set(profile.id, url);
          console.log(`[webview-manager] Org logo cached for profile ${profile.id}:`, url);
        }
      } else if (ev.channel === 'link-open-request') {
        const url = ev.args[0] as string;
        console.log('[link] ipc-message link-open-request:', url, 'profile:', profile.id);
        if (url) {
          window.electronAPI.openLinkChoice(url, profile.id);
        }
      }
    });

    // Handle anchor-based new-window requests (e.g. <a target="_blank">).
    // These bypass the window.open() JS override and fire as native webview events.
    wv.addEventListener('new-window', (e) => {
      const ev = e as Event & { url: string };
      console.log('[link] new-window event:', ev.url, 'profile:', profile.id);
      if (ev.url) {
        window.electronAPI.openLinkChoice(ev.url, profile.id);
      }
    });

    // Handle plain <a href> clicks and right-click → "Open Link" context menu actions.
    // These fire will-navigate instead of new-window. Intercept external URLs only —
    // same-origin navigations (SPA room switching) and provider-trusted domains pass through.
    wv.addEventListener('will-navigate', (e) => {
      const ev = e as Event & { url: string };
      if (!ev.url) return;
      console.log('[link] will-navigate:', ev.url, 'profile:', profile.id);
      try {
        const destOrigin = new URL(ev.url).origin;
        const profileOrigin = new URL(profile.url).origin;
        if (destOrigin !== profileOrigin) {
          const provider = getProvider(profile.providerId);
          if (provider?.trustedDomains && matchesTrustedDomain(ev.url, provider.trustedDomains)) {
            console.log('[link] will-navigate: trusted domain, allowing through:', ev.url);
            return; // Internal auth/redirect navigation — let it proceed silently
          }
          console.log('[link] will-navigate: external URL, showing dialog:', ev.url);
          e.preventDefault();
          window.electronAPI.openLinkChoice(ev.url, profile.id);
        }
      } catch (err) {
        console.log(
          '[link] will-navigate error - malformed URL:',
          ev.url,
          'Error:',
          err instanceof Error ? err.message : String(err)
        );
        // Malformed URL — let the webview handle it
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
          prev
            .executeJavaScript('window.__linuxCommsSetHidden && window.__linuxCommsSetHidden(true)')
            .catch(() => {});
        }
      }
    }

    // Show new
    const next = this.webviews.get(profileId);
    if (next) {
      next.classList.add('active');
      if (this.readyWebviews.has(profileId)) {
        next
          .executeJavaScript('window.__linuxCommsSetHidden && window.__linuxCommsSetHidden(false)')
          .catch(() => {});
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

  getCachedOrgLogo(profileId: string): string | undefined {
    return this.orgLogoCache.get(profileId);
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
        wv.executeJavaScript(
          'window.__linuxCommsSetHidden && window.__linuxCommsSetHidden(true)'
        ).catch(() => {});
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
      updateProfileOrder: (profileIds: (string | undefined)[]) => Promise<boolean>;
      updateProfileIcon: (profileId: string, icon: ProfileIcon | undefined) => Promise<Profile | undefined>;
      getPortalStatus: () => Promise<{ status: string; isWayland: boolean }>;
      showScreenSharePicker: () => Promise<string | null>;
      openPopout: (profileId: string) => void;
      openLinkChoice: (url: string, profileId: string) => Promise<void>;
      openExternal: (url: string) => Promise<void>;
      onProfileUpdated: (
        cb: (data: { profiles: Profile[]; providers: unknown[] }) => void
      ) => () => void;
      onNotificationClick: (cb: (profileId: string) => void) => () => void;
      onPortalStatus: (cb: (data: { status: string; isWayland: boolean }) => void) => () => void;
      onPopoutClosed: (cb: (profileId: string) => void) => () => void;
    };
  }
}
