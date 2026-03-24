import { execFile } from 'child_process';
import type { PortalStatus } from '../../shared/types';

let cachedStatus: PortalStatus = 'unknown';

/**
 * Check if org.freedesktop.portal.ScreenCast is available on the session D-Bus.
 * Uses gdbus to introspect — available on all systemd-based Linux distros.
 */
export async function checkPortalAvailability(): Promise<PortalStatus> {
  return new Promise((resolve) => {
    execFile(
      'gdbus',
      [
        'introspect',
        '--session',
        '--dest',
        'org.freedesktop.portal.Desktop',
        '--object-path',
        '/org/freedesktop/portal/desktop',
      ],
      { timeout: 3000 },
      (err, stdout) => {
        if (err || !stdout.includes('org.freedesktop.portal.ScreenCast')) {
          cachedStatus = 'unavailable';
        } else {
          cachedStatus = 'available';
        }
        resolve(cachedStatus);
      }
    );
  });
}

export function getPortalStatus(): PortalStatus {
  return cachedStatus;
}
