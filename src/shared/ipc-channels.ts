/** IPC channel name constants shared between main, preload, and renderer */
export const IPC = {
  // Profile management
  PROFILE_GET_ALL: 'profile:get-all',
  PROFILE_ADD: 'profile:add',
  PROFILE_REMOVE: 'profile:remove',
  PROFILE_RENAME: 'profile:rename',
  PROFILE_SET_ACTIVE: 'profile:set-active',
  PROFILE_UPDATED: 'profile:updated', // main → renderer (push)

  // Screen sharing
  SCREEN_SHARE_GET_SOURCES: 'screen-share:get-sources',
  SCREEN_SHARE_SHOW_PICKER: 'screen-share:show-picker',
  SCREEN_SHARE_PICK_SOURCE: 'screen-share:pick-source', // picker → main
  PORTAL_STATUS: 'portal:status',

  // Notifications (webview preload → main)
  NOTIFICATION_SEND: 'notification:send',
  NOTIFICATION_CLICK: 'notification:click', // main → renderer

  // Badge/title updates (renderer → renderer via host msg, then renderer → main)
  BADGE_UPDATE: 'badge:update',

  // Pop-out
  POPOUT_OPEN: 'popout:open',
  POPOUT_CLOSED: 'popout:closed', // main → renderer

  // App info
  APP_GET_PLATFORM: 'app:get-platform',
  APP_IS_WAYLAND: 'app:is-wayland',

  // Window management
  WINDOW_FOCUS: 'window:focus',
} as const;

export type IpcChannel = (typeof IPC)[keyof typeof IPC];
