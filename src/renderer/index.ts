import type { Profile } from '../shared/types';
import { ZOOM_MIN, ZOOM_MAX } from '../shared/types';
import { Sidebar } from './sidebar';
import { WebviewManager } from './webview-manager';

type Provider = { id: string; name: string; icon: string };
type ProviderField = {
  key: string;
  label: string;
  type: string;
  required: boolean;
  placeholder?: string;
};

let profiles: Profile[] = [];
let providerList: Provider[] = [];
let activeProfileId: string | null = null;

const webviewContainer = document.getElementById('webview-container')!;
const emptyState = document.getElementById('empty-state')!;

const webviewManager = new WebviewManager(webviewContainer, (profileId, count) => {
  sidebar.updateBadge(profileId, count);
  const total = sidebar.getTotalBadgeCount();
  window.electronAPI.setActiveProfile(activeProfileId ?? '');
  // Update tray via title
  document.title = total > 0 ? `(${total}) Linux Comms` : 'Linux Comms';
});

const sidebar = new Sidebar(webviewManager, (id) => activateProfile(id));

async function init() {
  const { profiles: p, providers } = await window.electronAPI.getAll();
  profiles = p;
  providerList = providers as Provider[];

  renderSidebar();
  initWebviews();
  setupEventListeners();
  setupKeyboardShortcuts();
  checkPortalStatus();
}

function renderSidebar() {
  sidebar.render(profiles, providerList, activeProfileId);
}

function initWebviews() {
  if (profiles.length === 0) {
    emptyState.style.display = '';
    return;
  }
  emptyState.style.display = 'none';

  // Create webviews for all profiles eagerly so they load in background
  for (const profile of profiles) {
    webviewManager.ensureWebview(profile);
  }

  // Activate last used profile or first available
  const firstId = profiles[0]?.id;
  if (firstId) {
    activeProfileId = firstId;
    webviewManager.switchTo(firstId);
    sidebar.setActive(firstId);
  }
}

function setupEventListeners() {
  // Add profile buttons
  const btnAdd = document.getElementById('btn-add-profile')!;
  const btnAddEmpty = document.getElementById('btn-add-profile-empty')!;
  btnAdd.addEventListener('click', openAddProfileModal);
  btnAddEmpty.addEventListener('click', openAddProfileModal);

  // Modal
  const overlay = document.getElementById('modal-overlay')!;
  const form = document.getElementById('add-profile-form') as HTMLFormElement;
  const btnCancel = document.getElementById('btn-modal-cancel')!;
  const providerSelect = document.getElementById('provider-select') as HTMLSelectElement;

  btnCancel.addEventListener('click', closeModal);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });

  providerSelect.addEventListener('change', () => {
    renderProviderExtraFields(providerSelect.value);
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const providerId = providerSelect.value;
    const name = (document.getElementById('profile-name') as HTMLInputElement).value.trim();
    const config: Record<string, string> = {};

    const extraFields = document.querySelectorAll<HTMLInputElement>('#provider-extra-fields input');
    for (const field of extraFields) {
      config[field.name] = field.value.trim();
    }

    try {
      const profile = await window.electronAPI.addProfile(providerId, name, config);
      profiles.push(profile);
      webviewManager.ensureWebview(profile);
      activateProfile(profile.id);
      closeModal();
    } catch (err) {
      alert(`Failed to add profile: ${(err as Error).message}`);
    }
  });

  // Profile updates from main (after add/remove/rename)
  window.electronAPI.onProfileUpdated(({ profiles: newProfiles, providers }) => {
    profiles = newProfiles as Profile[];
    providerList = providers as Provider[];
    renderSidebar();
    // Remove webviews for deleted profiles
    const newIds = new Set(newProfiles.map((p: Profile) => p.id));
    for (const profile of profiles) {
      if (!newIds.has(profile.id)) {
        webviewManager.removeWebview(profile.id);
      }
    }
    // Ensure webviews for new profiles
    for (const profile of newProfiles as Profile[]) {
      webviewManager.ensureWebview(profile);
    }
    if (newProfiles.length === 0) {
      emptyState.style.display = '';
    } else {
      emptyState.style.display = 'none';
      if (!webviewManager.getActiveProfileId()) {
        activateProfile((newProfiles as Profile[])[0].id);
      }
    }
  });

  // Notification click: focus the relevant profile
  window.electronAPI.onNotificationClick((profileId) => {
    activateProfile(profileId);
  });

  // Portal warning
  window.electronAPI.onPortalStatus(({ status, isWayland: wl }) => {
    if (wl && status === 'unavailable') {
      document.getElementById('portal-warning')!.classList.remove('hidden');
    }
  });

  document.getElementById('btn-dismiss-warning')!.addEventListener('click', () => {
    document.getElementById('portal-warning')!.classList.add('hidden');
  });

  // Pop-out restored
  window.electronAPI.onPopoutClosed((profileId) => {
    webviewManager.restorePopout(profileId);
    sidebar.setActive(profileId);
    activeProfileId = profileId;
  });
}

function setupKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key >= '1' && e.key <= '9') {
      const idx = parseInt(e.key, 10) - 1;
      const profile = profiles[idx];
      if (profile) activateProfile(profile.id);
    }
  });

  webviewContainer.addEventListener(
    'wheel',
    (e: WheelEvent) => {
      if (!e.ctrlKey || !activeProfileId) return;

      e.preventDefault();

      const profile = webviewManager.getProfile(activeProfileId);
      if (!profile) return;

      const currentZoom = profile.zoomLevel ?? 0;
      const delta = e.deltaY < 0 ? 1 : -1;
      const newZoom = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, currentZoom + delta));

      if (newZoom !== currentZoom) {
        webviewManager.applyZoom(activeProfileId, newZoom);
        window.electronAPI.updateZoomLevel(activeProfileId, newZoom);
      }
    },
    { passive: false }
  );
}

function activateProfile(profileId: string) {
  webviewManager.switchTo(profileId);
  sidebar.setActive(profileId);
  activeProfileId = profileId;
}

function openAddProfileModal() {
  const overlay = document.getElementById('modal-overlay')!;
  const providerSelect = document.getElementById('provider-select') as HTMLSelectElement;
  const nameInput = document.getElementById('profile-name') as HTMLInputElement;

  // Populate provider dropdown
  providerSelect.innerHTML = providerList
    .map((p) => `<option value="${p.id}">${p.name}</option>`)
    .join('');
  nameInput.value = '';
  renderProviderExtraFields(providerSelect.value);

  overlay.classList.remove('hidden');
  nameInput.focus();
}

function closeModal() {
  document.getElementById('modal-overlay')!.classList.add('hidden');
}

function renderProviderExtraFields(providerId: string) {
  const container = document.getElementById('provider-extra-fields')!;
  container.innerHTML = '';

  // We need the provider's configFields. They're embedded in the provider data.
  // For now, hardcode the RocketChat server URL field.
  if (providerId === 'rocketchat') {
    container.innerHTML = `
      <label>
        Server URL
        <input type="url" name="serverUrl" placeholder="https://your.rocket.chat" required />
      </label>
    `;
  }
}

async function checkPortalStatus() {
  const { status, isWayland: wl } = await window.electronAPI.getPortalStatus();
  if (wl && status === 'unavailable') {
    document.getElementById('portal-warning')!.classList.remove('hidden');
  }
}

// Boot
init().catch((err) => {
  console.error('Linux Comms renderer init failed:', err);
});
