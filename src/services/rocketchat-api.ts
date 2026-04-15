/**
 * RocketChat Unread Counts Service
 * Polls RocketChat API for unread message counts
 */

import type { Profile } from '../shared/types';

export interface RocketChatUnreadCounts {
	total: number;
	unread: number;
	unreadGroup: number;
	unreadPrivate: number;
}

export class RocketChatUnreadService {
	private serverUrl: string;
	private profileId: string;
	private authToken: string | null = null;
	private userId: string | null = null;

	constructor(profile: Profile) {
		this.profileId = profile.id;
		this.serverUrl = this.normalizeServerUrl(profile.url);
	}

	private normalizeServerUrl(url: string): string {
		// Remove path and trailing slashes, ensure it ends with a slash
		try {
			const parsed = new URL(url);
			return `${parsed.protocol}//${parsed.host}/`;
		} catch (_e) {
			console.error(
				`Invalid RocketChat URL for profile ${this.profileId}:`,
				url,
			);
			throw new Error('Invalid RocketChat server URL');
		}
	}

	private async getApiHeaders(): Promise<Record<string, string>> {
		const headers: Record<string, string> = {
			'Content-Type': 'application/json',
		};

		if (this.authToken && this.userId) {
			headers['X-Auth-Token'] = this.authToken;
			headers['X-User-Id'] = this.userId;
		}

		return headers;
	}

	private async makeApiRequest<T>(
		endpoint: string,
		method: 'GET' | 'POST' = 'GET',
		body?: unknown,
	): Promise<T> {
		const url = `${this.serverUrl}api/v1/${endpoint}`;
		const headers = await this.getApiHeaders();

		const options: RequestInit = {
			method,
			headers,
			credentials: 'include' as RequestCredentials,
		};

		if (body) {
			options.body = JSON.stringify(body);
		}

		try {
			const response = await fetch(url, options);

			if (!response.ok) {
				throw new Error(
					`RocketChat API error: ${response.status} ${response.statusText}`,
				);
			}

			return (await response.json()) as T;
		} catch (error) {
			console.error(
				`RocketChat API request failed for ${this.profileId}:`,
				error,
			);
			throw error;
		}
	}

	/**
	 * Set authentication credentials (called from webview when available)
	 */
	setCredentials(authToken: string, userId: string): void {
		this.authToken = authToken;
		this.userId = userId;
		console.log(`RocketChat credentials set for profile ${this.profileId}`);
	}

	/**
	 * Clear authentication credentials
	 */
	clearCredentials(): void {
		this.authToken = null;
		this.userId = null;
	}

	/**
	 * Check if we have authentication credentials
	 */
	hasCredentials(): boolean {
		return !!this.authToken && !!this.userId;
	}

	/**
	 * Get unread message counts using im.counters endpoint
	 */
	async getUnreadCounts(): Promise<RocketChatUnreadCounts> {
		if (!this.hasCredentials()) {
			console.warn(
				`No credentials available for RocketChat profile ${this.profileId}, returning zero counts`,
			);
			return {
				total: 0,
				unread: 0,
				unreadGroup: 0,
				unreadPrivate: 0,
			};
		}

		try {
			const response = await this.makeApiRequest<{
				total?: number;
				unread?: number;
				unreadGroup?: number;
				unreadPrivate?: number;
			}>('im.counters');

			return {
				total: response.total || 0,
				unread: response.unread || 0,
				unreadGroup: response.unreadGroup || 0,
				unreadPrivate: response.unreadPrivate || 0,
			};
		} catch (error) {
			console.error(
				`Failed to get unread counts for profile ${this.profileId}:`,
				error,
			);
			// Return zero counts on error to avoid breaking the UI
			return {
				total: 0,
				unread: 0,
				unreadGroup: 0,
				unreadPrivate: 0,
			};
		}
	}
}
