import type { Profile, ProfileIcon } from '../shared/types';
import { ZOOM_MIN, ZOOM_MAX } from '../shared/types';
import { Sidebar } from './sidebar';
import { WebviewManager } from './webview-manager';
import { DragDropWrapper } from './drag-drop-wrapper';
import { RocketChatPoller } from '../services/rocketchat-poller';
import lucideIndex from './lucide-index';

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

const rocketChatPoller = new RocketChatPoller((profileId, count) => {
  sidebar.updateBadge(profileId, count);
  const total = sidebar.getTotalBadgeCount();
  window.electronAPI.setActiveProfile(activeProfileId ?? '');
  // Update tray via title
  document.title = total > 0 ? `(${total}) Linux Comms` : 'Linux Comms';
});

const sidebar = new Sidebar(webviewManager, (id) => activateProfile(id));
sidebar.setLucideIndex(lucideIndex);
sidebar.setOnChangeIcon(async (profile) => {
  const icon = await showIconPicker(profile);
  if (icon) {
    await window.electronAPI.updateProfileIcon(profile.id, icon);
    // Optimistic update: reflect immediately via the profile update broadcast
    const idx = profiles.findIndex((p) => p.id === profile.id);
    if (idx !== -1) {
      profiles[idx] = { ...profiles[idx], icon };
      renderSidebar();
    }
  }
});
const dragDropWrapper = new DragDropWrapper(
  document.getElementById('profile-list')!,
  async (fromIndex, toIndex) => {
    // Get current profile IDs in order
    const profileElements = Array.from(document.querySelectorAll('.profile-entry'));
    const profileIds = profileElements.map((el) => el.dataset.profileId);

    // Reorder the array
    const [movedId] = profileIds.splice(fromIndex, 1);
    profileIds.splice(toIndex, 0, movedId);

    // Optimistic UI update - re-render immediately
    renderSidebar();

    // Update backend with debouncing to handle rapid reordering
    try {
      await window.electronAPI.updateProfileOrder(profileIds);
    } catch (error) {
      console.error('Failed to update profile order:', error);
      // Show error to user or revert UI
    }
  }
);

async function init() {
  const { profiles: p, providers } = await window.electronAPI.getAll();
  profiles = p;
  providerList = providers as Provider[];

  renderSidebar();
  initWebviews();
  setupEventListeners();
  setupKeyboardShortcuts();
  checkPortalStatus();

  // Setup app focus/blur handling for RocketChat polling
  window.addEventListener('focus', () => {
    rocketChatPoller.setAppActive(true);
  });

  window.addEventListener('blur', () => {
    rocketChatPoller.setAppActive(false);
  });

  // Display build version in sidebar footer
  const versionEl = document.getElementById('app-version');
  if (versionEl) {
    const version = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : 'dev';
    versionEl.textContent = version;
    versionEl.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      navigator.clipboard.writeText(version);
    });
  }
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

    // Start RocketChat poller for RocketChat profiles
    if (profile.providerId === 'rocketchat') {
      rocketChatPoller.startPolling(profile);
    }
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

  // Pop-out closed — re-embed without switching active profile
  window.electronAPI.onPopoutClosed((profileId) => {
    webviewManager.restorePopoutSilent(profileId);
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
  const profile = profiles.find((p) => p.id === profileId);

  // Mark previous active profile as inactive if it was RocketChat
  if (activeProfileId && activeProfileId !== profileId) {
    const prevProfile = profiles.find((p) => p.id === activeProfileId);
    if (prevProfile?.providerId === 'rocketchat') {
      rocketChatPoller.setProfileActive(activeProfileId, false);
    }
  }

  // Update poller state before switching (so it knows the profile is becoming active)
  if (profile?.providerId === 'rocketchat') {
    rocketChatPoller.setProfileActive(profileId, true);
  }

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

function showIconPicker(profile: Profile): Promise<ProfileIcon | null> {
  return new Promise((resolve) => {
    const overlay = document.getElementById('icon-picker-overlay')!;
    const companySection = document.getElementById('icon-picker-company')!;
    const companyGrid = document.getElementById('icon-picker-company-grid')!;
    const libraryGrid = document.getElementById('icon-picker-grid')!;
    const searchInput = document.getElementById('icon-picker-search') as HTMLInputElement;
    const emptyMsg = document.getElementById('icon-picker-empty')!;
    const customUrlInput = document.getElementById('icon-picker-custom-url') as HTMLInputElement;
    const customPreviewWrap = document.getElementById('icon-picker-custom-preview-wrap')!;
    const customPreview = document.getElementById('icon-picker-custom-preview') as HTMLImageElement;
    const confirmBtn = document.getElementById('btn-icon-picker-confirm')!;
    const cancelBtn = document.getElementById('btn-icon-picker-cancel')!;

    let selected: ProfileIcon | null = profile.icon ?? null;

    // ── Helper: mark a cell as selected, deselect others ──
    function selectCell(cell: HTMLElement, icon: ProfileIcon) {
      overlay.querySelectorAll<HTMLElement>('.icon-picker-cell').forEach((c) =>
        c.classList.remove('selected')
      );
      customPreview.classList.remove('selected');
      cell.classList.add('selected');
      selected = icon;
    }

    // ── Helper: select the custom URL preview ──
    function selectCustomUrl(url: string) {
      overlay.querySelectorAll<HTMLElement>('.icon-picker-cell').forEach((c) =>
        c.classList.remove('selected')
      );
      customPreview.classList.add('selected');
      selected = { type: 'custom', value: url };
    }

    // ── Section 1: Company Logo ──
    companyGrid.innerHTML = '';
    companySection.classList.add('hidden');

    const buildCompanyCell = (src: string) => {
      const icon: ProfileIcon = { type: 'server', value: src };
      const cell = document.createElement('button');
      cell.type = 'button';
      cell.className = 'icon-picker-cell';
      cell.title = 'Company logo';
      const img = document.createElement('img');
      img.alt = '';
      img.src = src;
      img.addEventListener('error', () => {
        cell.remove();
        if (companyGrid.childElementCount === 0) {
          companySection.classList.add('hidden');
        }
      });
      img.addEventListener('load', () => {
        companySection.classList.remove('hidden');
        // Pre-select if no icon is saved
        if (!profile.icon) {
          selectCell(cell, icon);
        }
      });
      cell.appendChild(img);
      cell.addEventListener('click', () => selectCell(cell, icon));
      companyGrid.appendChild(cell);
    };

    if (profile.providerId === 'rocketchat') {
      buildCompanyCell(`${profile.url.replace(/\/$/, '')}/assets/favicon.png`);
    } else if (profile.providerId === 'teams') {
      const cached = webviewManager.getCachedOrgLogo(profile.id);
      if (cached) {
        buildCompanyCell(cached);
        companySection.classList.remove('hidden');
      }
    }

    // ── Section 2: Library grid ──
    const allIcons = Object.keys(lucideIndex);

    function buildLibraryGrid(filter: string) {
      libraryGrid.innerHTML = '';
      const q = filter.toLowerCase();
      const visible = q ? allIcons.filter((n) => n.includes(q)) : allIcons;

      emptyMsg.classList.toggle('hidden', visible.length > 0);

      for (const name of visible) {
        const icon: ProfileIcon = { type: 'library', value: name };
        const cell = document.createElement('button');
        cell.type = 'button';
        cell.className = 'icon-picker-cell';
        cell.title = name;
        cell.dataset.iconName = name;
        cell.innerHTML = lucideIndex[name];
        cell.addEventListener('click', () => selectCell(cell, icon));
        libraryGrid.appendChild(cell);
      }

      // Restore selected state after rebuild
      if (selected?.type === 'library') {
        const cell = libraryGrid.querySelector<HTMLElement>(
          `[data-icon-name="${selected.value}"]`
        );
        if (cell) cell.classList.add('selected');
      }
    }

    searchInput.value = '';
    buildLibraryGrid('');
    searchInput.addEventListener('input', () => buildLibraryGrid(searchInput.value));

    // ── Section 3: Custom URL ──
    customUrlInput.value = '';
    customPreviewWrap.classList.add('hidden');
    customPreview.classList.remove('selected');

    function tryLoadCustomUrl(url: string) {
      if (!url) {
        customPreviewWrap.classList.add('hidden');
        customPreview.classList.remove('selected');
        if (selected?.type === 'custom') selected = null;
        return;
      }
      // Reset the preview src to trigger load/error events
      customPreview.src = '';
      customPreview.onload = () => {
        customPreviewWrap.classList.remove('hidden');
        selectCustomUrl(url);
      };
      customPreview.onerror = () => {
        customPreviewWrap.classList.add('hidden');
        customPreview.classList.remove('selected');
        if (selected?.type === 'custom') selected = null;
      };
      customPreview.src = url;
    }

    customUrlInput.addEventListener('input', () => tryLoadCustomUrl(customUrlInput.value.trim()));
    customPreview.addEventListener('click', () => {
      if (customUrlInput.value.trim()) selectCustomUrl(customUrlInput.value.trim());
    });

    // ── Pre-select currently saved icon ──
    if (profile.icon?.type === 'custom') {
      customUrlInput.value = profile.icon.value;
      tryLoadCustomUrl(profile.icon.value);
    } else if (profile.icon?.type === 'server') {
      // Company cell will be selected via its load handler if it matches
      // For previously saved server icons that differ from the live URL, just keep selection
    } else if (profile.icon?.type === 'library') {
      const cell = libraryGrid.querySelector<HTMLElement>(
        `[data-icon-name="${profile.icon.value}"]`
      );
      if (cell) {
        cell.classList.add('selected');
        cell.scrollIntoView({ block: 'nearest' });
      }
    }

    // ── Confirm / Cancel ──
    function close() {
      overlay.classList.add('hidden');
      searchInput.removeEventListener('input', () => buildLibraryGrid(searchInput.value));
      document.removeEventListener('keydown', onKeyDown);
      cancelBtn.removeEventListener('click', onCancel);
      confirmBtn.removeEventListener('click', onConfirm);
      overlay.removeEventListener('click', onOverlayClick);
    }

    function onConfirm() {
      close();
      resolve(selected);
    }

    function onCancel() {
      close();
      resolve(null);
    }

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onCancel();
    }

    function onOverlayClick(e: MouseEvent) {
      if (e.target === overlay) onCancel();
    }

    confirmBtn.addEventListener('click', onConfirm);
    cancelBtn.addEventListener('click', onCancel);
    document.addEventListener('keydown', onKeyDown);
    overlay.addEventListener('click', onOverlayClick);

    overlay.classList.remove('hidden');
    searchInput.focus();
  });
}

// Boot
init().catch((err) => {
  console.error('Linux Comms renderer init failed:', err);
});
