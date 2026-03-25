import { app } from 'electron';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import { randomUUID } from 'crypto';
import type { Profile, ProfilesData } from '../../shared/types';
import { ZOOM_MIN, ZOOM_MAX } from '../../shared/types';
import { getProvider } from '../../providers';

function getProfilesPath(): string {
  return join(app.getPath('userData'), 'profiles.json');
}

function load(): ProfilesData {
  const filePath = getProfilesPath();
  if (!existsSync(filePath)) {
    return { version: 1, profiles: [] };
  }
  try {
    const raw = readFileSync(filePath, 'utf-8');
    return JSON.parse(raw) as ProfilesData;
  } catch (err) {
    console.error('[profile-store] Failed to read profiles.json:', err);
    return { version: 1, profiles: [] };
  }
}

function save(data: ProfilesData): void {
  const filePath = getProfilesPath();
  mkdirSync(join(filePath, '..'), { recursive: true });
  writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

export function getAllProfiles(): Profile[] {
  return load().profiles;
}

export function getLastActiveProfileId(): string | undefined {
  return load().lastActiveProfileId;
}

export function setLastActiveProfileId(id: string): void {
  const data = load();
  data.lastActiveProfileId = id;
  save(data);
}

export function addProfile(
  providerId: string,
  name: string,
  config: Record<string, string>
): Profile {
  const provider = getProvider(providerId);
  if (!provider) throw new Error(`Unknown provider: ${providerId}`);

  const id = randomUUID();
  const partition = `persist:${providerId}-${id}`;

  // Resolve URL: for RocketChat, use serverUrl from config; otherwise use provider default
  let url = provider.defaultUrl;
  if (providerId === 'rocketchat' && config['serverUrl']) {
    url = config['serverUrl'].replace(/\/$/, '');
  }

  const profile: Profile = { id, name, providerId, partition, config, url };

  const data = load();
  data.profiles.push(profile);
  save(data);
  return profile;
}

export function removeProfile(id: string, session: Electron.Session): void {
  const data = load();
  const idx = data.profiles.findIndex((p) => p.id === id);
  if (idx === -1) return;

  data.profiles.splice(idx, 1);
  if (data.lastActiveProfileId === id) {
    data.lastActiveProfileId = data.profiles[0]?.id;
  }
  save(data);

  // Clear partition storage
  session.clearStorageData().catch((err) => {
    console.error('[profile-store] Failed to clear partition storage:', err);
  });
}

export function renameProfile(id: string, newName: string): Profile | undefined {
  const data = load();
  const profile = data.profiles.find((p) => p.id === id);
  if (!profile) return undefined;
  profile.name = newName;
  save(data);
  return profile;
}

export function updateZoomLevel(id: string, zoomLevel: number): Profile | undefined {
  const data = load();
  const profile = data.profiles.find((p) => p.id === id);
  if (!profile) return undefined;

  const clampedZoom = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, zoomLevel));
  if (clampedZoom !== zoomLevel) {
    console.warn(`[profile-store] Zoom level ${zoomLevel} clamped to ${clampedZoom}`);
  }

  if (clampedZoom === 0) {
    delete profile.zoomLevel;
  } else {
    profile.zoomLevel = clampedZoom;
  }

  save(data);
  return profile;
}

export function getProfile(id: string): Profile | undefined {
  const data = load();
  const profile = data.profiles.find((p) => p.id === id);
  if (!profile) return undefined;
  return { ...profile, zoomLevel: profile.zoomLevel ?? 0 };
}
