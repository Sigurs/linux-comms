import type { CommunicationProvider } from '../shared/types';
import { rocketchatProvider } from './rocketchat';
import { teamsProvider } from './teams';

const REQUIRED_FIELDS: (keyof CommunicationProvider)[] = [
	'id',
	'name',
	'icon',
	'defaultUrl',
	'webviewOptions',
];

function validateProvider(p: CommunicationProvider): boolean {
	for (const field of REQUIRED_FIELDS) {
		if (!p[field]) {
			console.error(
				`[providers] Provider "${p.id ?? '?'}" is missing required field: ${field}`,
			);
			return false;
		}
	}
	if (!/^[a-z0-9-]+$/.test(p.id)) {
		console.error(`[providers] Provider id "${p.id}" must be kebab-case`);
		return false;
	}
	return true;
}

const rawProviders: CommunicationProvider[] = [
	teamsProvider,
	rocketchatProvider,
];

export const providers: CommunicationProvider[] =
	rawProviders.filter(validateProvider);

export function getProvider(id: string): CommunicationProvider | undefined {
	return providers.find((p) => p.id === id);
}
