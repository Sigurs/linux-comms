import type { CommunicationProvider } from '../shared/types';

export const rocketchatProvider: CommunicationProvider = {
  id: 'rocketchat',
  name: 'Rocket.Chat',
  icon: 'rocketchat',
  defaultUrl: 'https://open.rocket.chat',
  webviewOptions: {
    allowedPermissions: ['media', 'display-capture', 'notifications', 'microphone', 'camera'],
  },
  configFields: [
    {
      key: 'serverUrl',
      label: 'Server URL',
      type: 'url',
      required: true,
      placeholder: 'https://your.rocket.chat',
    },
  ],
};
