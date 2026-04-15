/**
 * RocketChat Unread Counts Poller
 * Polls RocketChat webviews for unread message counts and updates badges
 */

import type { Profile } from '../shared/types';
import { RocketChatUnreadService, RocketChatUnreadCounts } from './rocketchat-api';

export class RocketChatPoller {
  private pollers: Map<
    string,
    {
      service: RocketChatUnreadService;
      intervalId: NodeJS.Timeout | null;
      isActive: boolean;
      consecutiveFailures: number;
      cachedCounts: RocketChatUnreadCounts | null;
      cacheTimestamp: number | null;
    }
  > = new Map();

  private onBadgeUpdate: (profileId: string, count: number) => void;
  private isAppActive: boolean = true;

  constructor(onBadgeUpdate: (profileId: string, count: number) => void) {
    this.onBadgeUpdate = onBadgeUpdate;
  }

  /**
   * Start polling for a RocketChat profile
   */
  startPolling(profile: Profile): void {
    if (this.pollers.has(profile.id)) {
      // Already polling
      return;
    }

    const service = new RocketChatUnreadService(profile);

    this.pollers.set(profile.id, {
      service,
      intervalId: null,
      isActive: true,
      consecutiveFailures: 0,
      cachedCounts: null,
      cacheTimestamp: null,
    });

    console.log(`Starting RocketChat poller for profile ${profile.id}`);
    this.scheduleNextPoll(profile.id);
  }

  /**
   * Stop polling for a RocketChat profile
   */
  stopPolling(profileId: string): void {
    const poller = this.pollers.get(profileId);
    if (!poller) return;

    if (poller.intervalId) {
      clearTimeout(poller.intervalId);
      poller.intervalId = null;
    }

    this.pollers.delete(profileId);
    console.log(`Stopped RocketChat poller for profile ${profileId}`);
  }

  /**
   * Set app active state (controls polling)
   */
  setAppActive(active: boolean): void {
    this.isAppActive = active;

    if (active) {
      console.log('App active - resuming RocketChat polling');
      this.pollers.forEach((poller, profileId) => {
        if (poller.isActive) {
          this.scheduleNextPoll(profileId);
        }
      });
    } else {
      console.log('App inactive - pausing RocketChat polling');
    }
  }

  /**
   * Set credentials for a profile (called when webview authenticates)
   */
  setCredentials(profileId: string, authToken: string, userId: string): void {
    const poller = this.pollers.get(profileId);
    if (poller) {
      poller.service.setCredentials(authToken, userId);
      console.log(`Credentials set for RocketChat poller ${profileId}`);
      // Trigger immediate poll with new credentials
      this.pollNow(profileId);
    }
  }

  /**
   * Clear credentials for a profile
   */
  clearCredentials(profileId: string): void {
    const poller = this.pollers.get(profileId);
    if (poller) {
      poller.service.clearCredentials();
      console.log(`Credentials cleared for RocketChat poller ${profileId}`);
    }
  }

  /**
   * Schedule the next poll for a profile
   */
  private scheduleNextPoll(profileId: string, delayMs: number = 5000): void {
    const poller = this.pollers.get(profileId);
    if (!poller || !this.isAppActive) return;

    // Clear any existing timeout
    if (poller.intervalId) {
      clearTimeout(poller.intervalId);
    }

    // Use circuit breaker pattern - stop polling after 3 consecutive failures
    if (poller.consecutiveFailures >= 3) {
      console.warn(`RocketChat poller ${profileId}: circuit breaker triggered, stopping polls`);
      return;
    }

    poller.intervalId = setTimeout(() => {
      this.pollNow(profileId);
    }, delayMs);
  }

  /**
   * Poll immediately for unread counts
   */
  private async pollNow(profileId: string): Promise<void> {
    const poller = this.pollers.get(profileId);
    if (!poller || !this.isAppActive) return;

    // Check if we have recent cached data (30 second cache)
    const now = Date.now();
    if (poller.cachedCounts && poller.cacheTimestamp && now - poller.cacheTimestamp < 30000) {
      console.log(`RocketChat poller ${profileId}: using cached data`);
      this.onBadgeUpdate(profileId, poller.cachedCounts.total);
      this.scheduleNextPoll(profileId, 60000);
      return;
    }

    try {
      const counts = await poller.service.getUnreadCounts();

      // Reset consecutive failures on success
      poller.consecutiveFailures = 0;

      // Cache the results
      poller.cachedCounts = counts;
      poller.cacheTimestamp = now;

      // Update badge with total unread count
      this.onBadgeUpdate(profileId, counts.total);

      // Schedule next poll (60 seconds for regular polling)
      this.scheduleNextPoll(profileId, 60000);
    } catch (error) {
      console.error(`RocketChat poller ${profileId}: poll failed`, error);

      // Increment failure counter
      poller.consecutiveFailures++;

      // If we have cached data, use it as fallback
      if (poller.cachedCounts) {
        console.log(`RocketChat poller ${profileId}: using cached data as fallback`);
        this.onBadgeUpdate(profileId, poller.cachedCounts.total);
      }

      // Retry sooner on failure (exponential backoff)
      const retryDelay = Math.min(30000, 1000 * Math.pow(2, poller.consecutiveFailures));
      console.log(`RocketChat poller ${profileId}: retrying in ${retryDelay}ms`);
      this.scheduleNextPoll(profileId, retryDelay);
    }
  }

  /**
   * Set polling active state for a profile (based on webview visibility)
   */
  setProfileActive(profileId: string, active: boolean): void {
    const poller = this.pollers.get(profileId);
    if (!poller) return;

    poller.isActive = active;

    if (active && this.isAppActive) {
      console.log(`Profile ${profileId} active - resuming polling`);
      this.scheduleNextPoll(profileId);
    } else {
      console.log(`Profile ${profileId} inactive - pausing polling`);
      if (poller.intervalId) {
        clearTimeout(poller.intervalId);
        poller.intervalId = null;
      }
    }
  }

  /**
   * Clean up all pollers
   */
  cleanup(): void {
    this.pollers.forEach((poller, profileId) => {
      if (poller.intervalId) {
        clearTimeout(poller.intervalId);
      }
    });
    this.pollers.clear();
    console.log('RocketChat poller cleanup completed');
  }
}
