export interface WebviewOptions {
  userAgent?: string;
  preloadOverrides?: Record<string, unknown>;
  allowedPermissions?: string[];
}

export interface CommunicationProvider {
  /** Unique kebab-case identifier, e.g. "teams" or "rocketchat" */
  id: string;
  /** Display name shown in sidebar */
  name: string;
  /** Path to icon (relative to assets/) or data URL */
  icon: string;
  /** Default URL to load; may be overridden per-profile */
  defaultUrl: string;
  /** Webview-level configuration (user agent, permissions) */
  webviewOptions: WebviewOptions;
  /** Provider-specific config fields shown when adding a new profile */
  configFields?: ProviderConfigField[];
  /** Domain patterns (supports leading wildcard, e.g. "*.microsoft.com") that are treated as
   *  internal navigation — will-navigate to these domains bypasses the link-open-choice dialog */
  trustedDomains?: string[];
}

export interface ProviderConfigField {
  key: string;
  label: string;
  type: 'text' | 'url' | 'password';
  required: boolean;
  placeholder?: string;
}

export interface ProfileIcon {
  type: 'server' | 'library' | 'custom' | 'emoji';
  value: string;
}

export const ZOOM_MIN = -1;
export const ZOOM_MAX = 9;

export interface Profile {
  /** Unique UUID for this profile */
  id: string;
  /** Human-readable name set by the user */
  name: string;
  /** Provider ID this profile belongs to */
  providerId: string;
  /** Electron session partition key: "persist:<providerId>-<id>" */
  partition: string;
  /** Provider-specific config (e.g. RocketChat server URL) */
  config: Record<string, string>;
  /** Resolved URL for this profile (may differ from provider default) */
  url: string;
  /** Whether this profile is currently popped out in its own window */
  poppedOut?: boolean;
  /** Zoom level for this profile (-1 to +9, where 0 is 100%) */
  zoomLevel?: number;
  /** Position in the sidebar for ordering */
  position?: number;
  /** Custom icon chosen by the user; absent (or type 'emoji') means use provider Lucide default */
  icon?: ProfileIcon;
}

export interface ProfilesData {
  version: 1;
  profiles: Profile[];
  lastActiveProfileId?: string;
}

export type PortalStatus = 'available' | 'unavailable' | 'unknown';

export interface DesktopSource {
  id: string;
  name: string;
  thumbnailDataUrl: string;
  displayId?: string;
}

export interface NotificationPayload {
  profileId: string;
  title: string;
  body: string;
  icon?: string;
}

export interface BadgeUpdate {
  profileId: string;
  count: number;
}
