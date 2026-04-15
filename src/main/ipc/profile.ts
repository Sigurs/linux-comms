import { ipcMain, session, BrowserWindow } from 'electron';
import { IPC } from '../../shared/ipc-channels';
import * as store from '../store/profile-store';
import { providers } from '../../providers';

export function registerProfileIpc(): void {
  ipcMain.handle(IPC.PROFILE_GET_ALL, () => {
    return { profiles: store.getAllProfiles(), providers };
  });

  ipcMain.handle(
    IPC.PROFILE_ADD,
    (_event, providerId: string, name: string, config: Record<string, string>) => {
      const profile = store.addProfile(providerId, name, config);
      broadcastProfileUpdate();
      return profile;
    }
  );

  ipcMain.handle(IPC.PROFILE_REMOVE, (_event, profileId: string, partition: string) => {
    const sess = session.fromPartition(partition);
    store.removeProfile(profileId, sess);
    broadcastProfileUpdate();
  });

  ipcMain.handle(IPC.PROFILE_RENAME, (_event, profileId: string, newName: string) => {
    const profile = store.renameProfile(profileId, newName);
    broadcastProfileUpdate();
    return profile;
  });

  ipcMain.on(IPC.PROFILE_SET_ACTIVE, (_event, profileId: string) => {
    store.setLastActiveProfileId(profileId);
  });

  ipcMain.handle(IPC.PROFILE_UPDATE_ZOOM, (_event, profileId: string, zoomLevel: number) => {
    const profile = store.updateZoomLevel(profileId, zoomLevel);
    broadcastProfileUpdate();
    return profile;
  });

  ipcMain.handle(IPC.PROFILE_UPDATE_ORDER, (_event, profileIds: string[]) => {
    const success = store.updateProfileOrder(profileIds);
    if (success) {
      broadcastProfileUpdate();
    }
    return success;
  });
}

function broadcastProfileUpdate(): void {
  const data = { profiles: store.getAllProfiles(), providers };
  for (const win of BrowserWindow.getAllWindows()) {
    if (!win.isDestroyed()) {
      win.webContents.send(IPC.PROFILE_UPDATED, data);
    }
  }
}
