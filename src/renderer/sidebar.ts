import type { Profile } from '../shared/types';
import { ZOOM_MAX, ZOOM_MIN } from '../shared/types';
import type { WebviewManager } from './webview-manager';

type Provider = { id: string; name: string; icon: string };

const PROVIDER_DEFAULT_ICON: Record<string, string> = {
	rocketchat: 'rocket',
	teams: 'users-round',
};

function providerDefaultSvg(
	providerId: string,
	lucideIndex: Record<string, string>,
): string {
	const name = PROVIDER_DEFAULT_ICON[providerId] ?? 'message-circle';
	const svg = lucideIndex[name] ?? lucideIndex['message-circle'] ?? '';
	return `<span class="profile-icon profile-icon-svg">${svg}</span>`;
}

function renderIcon(
	profile: Profile,
	_provider: Provider | undefined,
	lucideIndex: Record<string, string>,
): string {
	const icon = profile.icon;
	if (!icon || icon.type === 'emoji') {
		return providerDefaultSvg(profile.providerId, lucideIndex);
	}
	if (icon.type === 'server' || icon.type === 'custom') {
		return `<img class="profile-icon profile-icon-img" src="${escapeHtml(icon.value)}" alt="" draggable="false" />`;
	}
	if (icon.type === 'library') {
		const svg = lucideIndex[icon.value];
		if (svg) {
			return `<span class="profile-icon profile-icon-svg">${svg}</span>`;
		}
		return providerDefaultSvg(profile.providerId, lucideIndex);
	}
	return providerDefaultSvg(profile.providerId, lucideIndex);
}

export class Sidebar {
	private profileList: HTMLElement;
	private badges: Map<string, number> = new Map();
	private zoomLevels: Map<string, number> = new Map();
	private onZoomChange?: (profileId: string, zoomLevel: number) => void;
	private onChangeIcon?: (profile: Profile) => void;
	private lucideIndex: Record<string, string> = {};

	constructor(
		private webviewManager: WebviewManager,
		private onActivate: (profileId: string) => void,
	) {
		this.profileList = document.getElementById('profile-list')!;
	}

	setLucideIndex(index: Record<string, string>): void {
		this.lucideIndex = index;
	}

	setOnZoomChange(cb: (profileId: string, zoomLevel: number) => void): void {
		this.onZoomChange = cb;
	}

	setOnChangeIcon(cb: (profile: Profile) => void): void {
		this.onChangeIcon = cb;
	}

	render(
		profiles: Profile[],
		providers: Provider[],
		activeProfileId: string | null,
	): void {
		this.profileList.innerHTML = '';

		// Sort profiles by position if available, otherwise maintain original order
		const sortedProfiles = [...profiles].sort((a, b) => {
			const posA = a.position ?? Number.MAX_SAFE_INTEGER;
			const posB = b.position ?? Number.MAX_SAFE_INTEGER;
			return posA - posB;
		});

		for (const profile of sortedProfiles) {
			this.zoomLevels.set(profile.id, profile.zoomLevel ?? 0);
			const entry = this.createEntry(profile, providers, activeProfileId);
			this.profileList.appendChild(entry);
		}
	}

	private createEntry(
		profile: Profile,
		providers: Provider[],
		activeProfileId: string | null,
	): HTMLElement {
		const provider = providers.find((p) => p.id === profile.providerId);
		const isActive = profile.id === activeProfileId;
		const badgeCount = this.badges.get(profile.id) ?? 0;

		const btn = document.createElement('button');
		btn.className = `profile-entry${isActive ? ' active' : ''}`;
		btn.dataset.profileId = profile.id;
		btn.title = `${provider?.name ?? profile.providerId} — ${profile.name}`;
		btn.setAttribute('aria-label', btn.title);

		btn.innerHTML = `
      ${renderIcon(profile, provider, this.lucideIndex)}
      <span class="profile-label">${escapeHtml(profile.name)}</span>
      ${badgeCount > 0 ? `<span class="badge">${badgeCount > 99 ? '99+' : badgeCount}</span>` : ''}
    `;

		btn.addEventListener('click', () => {
			this.onActivate(profile.id);
		});

		btn.addEventListener('contextmenu', (e) => {
			e.preventDefault();
			this.showContextMenu(profile, e);
		});

		return btn;
	}

	setActive(profileId: string): void {
		for (const el of this.profileList.querySelectorAll<HTMLElement>(
			'.profile-entry',
		)) {
			el.classList.toggle('active', el.dataset.profileId === profileId);
		}
	}

	updateBadge(profileId: string, count: number): void {
		this.badges.set(profileId, count);
		const entry = this.profileList.querySelector<HTMLElement>(
			`.profile-entry[data-profile-id="${profileId}"]`,
		);
		if (!entry) return;
		let badge = entry.querySelector<HTMLElement>('.badge');
		if (count > 0) {
			if (!badge) {
				badge = document.createElement('span');
				badge.className = 'badge';
				entry.appendChild(badge);
			}
			badge.textContent = count > 99 ? '99+' : String(count);
		} else {
			badge?.remove();
		}
	}

	getTotalBadgeCount(): number {
		let total = 0;
		for (const v of this.badges.values()) total += v;
		return total;
	}

	private showContextMenu(profile: Profile, e: MouseEvent): void {
		document.querySelector('.ctx-menu')?.remove();

		const webviews = Array.from(
			document.querySelectorAll<HTMLElement>('webview'),
		);
		webviews.forEach((wv) => {
			wv.style.pointerEvents = 'none';
		});

		const currentZoom = this.zoomLevels.get(profile.id) ?? 0;
		const canZoomIn = currentZoom < ZOOM_MAX;
		const canZoomOut = currentZoom > ZOOM_MIN;

		const menu = document.createElement('div');
		menu.className = 'ctx-menu';
		menu.style.left = `${e.clientX}px`;
		menu.style.top = `${e.clientY}px`;

		menu.innerHTML = `
      <button data-action="popout">Pop out</button>
      <button data-action="reload">Reload</button>
      <button data-action="rename">Rename</button>
      <button data-action="change-icon">Change Icon…</button>
      <hr class="separator" />
      <button data-action="zoom-in" ${!canZoomIn ? 'disabled' : ''}>Zoom In</button>
      <button data-action="zoom-out" ${!canZoomOut ? 'disabled' : ''}>Zoom Out</button>
      <button data-action="zoom-reset" ${currentZoom === 0 ? 'disabled' : ''}>Reset Zoom</button>
      <hr class="separator" />
      <button data-action="remove" class="danger">Remove Profile</button>
    `;

		const restoreAndRemove = () => {
			menu.remove();
			webviews.forEach((wv) => {
				wv.style.pointerEvents = '';
			});
		};

		menu.addEventListener('click', async (ev) => {
			const action = (ev.target as HTMLElement).dataset.action;
			restoreAndRemove();
			if (action === 'popout') {
				this.webviewManager.popOut(profile.id);
			} else if (action === 'reload') {
				this.webviewManager.reload(profile.id);
			} else if (action === 'rename') {
				const newName = await this.showRenameDialog(profile.name);
				if (newName) {
					await window.electronAPI.renameProfile(profile.id, newName);
				}
			} else if (action === 'change-icon') {
				this.onChangeIcon?.(profile);
			} else if (action === 'zoom-in') {
				await this.handleZoomChange(profile.id, currentZoom + 1);
			} else if (action === 'zoom-out') {
				await this.handleZoomChange(profile.id, currentZoom - 1);
			} else if (action === 'zoom-reset') {
				await this.handleZoomChange(profile.id, 0);
			} else if (action === 'remove') {
				if (confirm(`Remove profile "${profile.name}"?`)) {
					await window.electronAPI.removeProfile(profile.id, profile.partition);
				}
			}
		});

		document.body.appendChild(menu);
		document.addEventListener('click', restoreAndRemove, { once: true });
	}

	private async handleZoomChange(
		profileId: string,
		newZoom: number,
	): Promise<void> {
		const clampedZoom = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, newZoom));
		this.zoomLevels.set(profileId, clampedZoom);
		this.webviewManager.applyZoom(profileId, clampedZoom);
		await window.electronAPI.updateZoomLevel(profileId, clampedZoom);
		this.onZoomChange?.(profileId, clampedZoom);
	}

	private showRenameDialog(currentName: string): Promise<string | null> {
		return new Promise((resolve) => {
			const overlay = document.getElementById('rename-overlay')!;
			const input = document.getElementById('rename-input') as HTMLInputElement;
			const form = document.getElementById('rename-form') as HTMLFormElement;
			const cancelBtn = document.getElementById('btn-rename-cancel')!;

			input.value = currentName;
			overlay.classList.remove('hidden');
			input.focus();
			input.select();

			const cleanup = () => {
				overlay.classList.add('hidden');
				form.removeEventListener('submit', onSubmit);
				cancelBtn.removeEventListener('click', onCancel);
				overlay.removeEventListener('click', onOverlayClick);
			};

			const onSubmit = (e: Event) => {
				e.preventDefault();
				const value = input.value.trim();
				cleanup();
				resolve(value || null);
			};

			const onCancel = () => {
				cleanup();
				resolve(null);
			};
			const onOverlayClick = (e: MouseEvent) => {
				if (e.target === overlay) onCancel();
			};

			form.addEventListener('submit', onSubmit, { once: true });
			cancelBtn.addEventListener('click', onCancel, { once: true });
			overlay.addEventListener('click', onOverlayClick, { once: true });
		});
	}
}

function escapeHtml(s: string): string {
	return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
