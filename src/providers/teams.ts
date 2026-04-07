import type { CommunicationProvider } from '../shared/types';

// Chrome 130 user agent — Teams web app requires a modern Chrome UA to enable all features
const CHROME_UA =
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36';

export const teamsProvider: CommunicationProvider = {
  id: 'teams',
  name: 'Microsoft Teams',
  icon: 'teams',
  defaultUrl: 'https://teams.microsoft.com',
  webviewOptions: {
    userAgent: CHROME_UA,
    allowedPermissions: ['media', 'display-capture', 'notifications', 'microphone', 'camera'],
  },
  configFields: [],
  // Domains used during Teams auth/startup that should not trigger the link-open dialog.
  // Deliberately narrow: *.cloud.microsoft covers the loginHint redirect on startup;
  // *.microsoftonline.com covers Azure AD OAuth flows.
  // *.microsoft.com is intentionally excluded — it's too broad and would suppress dialogs
  // for docs, support pages, and other external Microsoft content links.
  trustedDomains: ['*.cloud.microsoft', '*.microsoftonline.com'],
};
