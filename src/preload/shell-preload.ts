import { contextBridge, ipcRenderer } from 'electron';
import { IPC } from '../shared/ipc-channels';
import type { Profile, NotificationPayload } from '../shared/types';

// Expose a typed, minimal API surface to the shell renderer
contextBridge.exposeInMainWorld('electronAPI', {
  // Platform
  isWayland: () => ipcRenderer.invoke(IPC.APP_IS_WAYLAND),

  // Profiles
  getAll: () => ipcRenderer.invoke(IPC.PROFILE_GET_ALL),
  addProfile: (providerId: string, name: string, config: Record<string, string>) =>
    ipcRenderer.invoke(IPC.PROFILE_ADD, providerId, name, config),
  removeProfile: (profileId: string, partition: string) =>
    ipcRenderer.invoke(IPC.PROFILE_REMOVE, profileId, partition),
  renameProfile: (profileId: string, newName: string) =>
    ipcRenderer.invoke(IPC.PROFILE_RENAME, profileId, newName),
  setActiveProfile: (profileId: string) => ipcRenderer.send(IPC.PROFILE_SET_ACTIVE, profileId),
  updateZoomLevel: (profileId: string, zoomLevel: number) =>
    ipcRenderer.invoke(IPC.PROFILE_UPDATE_ZOOM, profileId, zoomLevel),
  updateProfileOrder: (profileIds: string[]) =>
    ipcRenderer.invoke(IPC.PROFILE_UPDATE_ORDER, profileIds),

  // Portal / screen share (X11 only)
  getPortalStatus: () => ipcRenderer.invoke(IPC.PORTAL_STATUS),
  showScreenSharePicker: () => ipcRenderer.invoke(IPC.SCREEN_SHARE_SHOW_PICKER),

  // Pop-out
  openPopout: (profileId: string) => ipcRenderer.send(IPC.POPOUT_OPEN, profileId),

  // Link opening
  openLinkChoice: (url: string, profileId: string) =>
    ipcRenderer.invoke(IPC.LINK_OPEN_PROMPT, url, profileId),

  // Event subscriptions
  onProfileUpdated: (cb: (data: { profiles: Profile[]; providers: unknown[] }) => void) => {
    const listener = (_: unknown, data: { profiles: Profile[]; providers: unknown[] }) => cb(data);
    ipcRenderer.on(IPC.PROFILE_UPDATED, listener);
    return () => ipcRenderer.removeListener(IPC.PROFILE_UPDATED, listener);
  },
  onNotificationClick: (cb: (profileId: string) => void) => {
    const listener = (_: unknown, profileId: string) => cb(profileId);
    ipcRenderer.on(IPC.NOTIFICATION_CLICK, listener);
    return () => ipcRenderer.removeListener(IPC.NOTIFICATION_CLICK, listener);
  },
  onPortalStatus: (cb: (data: { status: string; isWayland: boolean }) => void) => {
    const listener = (_: unknown, data: { status: string; isWayland: boolean }) => cb(data);
    ipcRenderer.on(IPC.PORTAL_STATUS, listener);
    return () => ipcRenderer.removeListener(IPC.PORTAL_STATUS, listener);
  },
  onPopoutClosed: (cb: (profileId: string) => void) => {
    const listener = (_: unknown, profileId: string) => cb(profileId);
    ipcRenderer.on(IPC.POPOUT_CLOSED, listener);
    return () => ipcRenderer.removeListener(IPC.POPOUT_CLOSED, listener);
  },
});
