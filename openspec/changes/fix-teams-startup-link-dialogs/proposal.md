## Why

On startup, Microsoft Teams navigates internally to `https://teams.cloud.microsoft/=loginHint=<username>` as part of its authentication flow. Because this origin differs from the configured profile URL (`https://teams.microsoft.com`), the `will-navigate` handler treats it as an external link and shows an "Open Link" dialog for every logged-in Teams account — blocking the user before the app is usable.

## What Changes

- Add a `trustedDomains` field to the `CommunicationProvider` type, listing origins/domain patterns that should be treated as internal navigation (no dialog).
- Populate `trustedDomains` for the Teams provider with known Microsoft-owned domains used during auth and redirect flows (`*.microsoft.com`, `*.cloud.microsoft`, `*.microsoftonline.com`).
- Update the `will-navigate` handler in `WebviewManager` to skip the link-open dialog when the destination URL matches a trusted domain for that profile's provider.

## Capabilities

### New Capabilities
- `provider-trusted-domains`: Providers may declare trusted domains; navigations to those domains are treated as internal and bypass the link-open-choice dialog.

### Modified Capabilities
- `link-open-choice`: The condition that triggers the link-open dialog now excludes destinations matching the provider's trusted domains.

## Impact

- `src/shared/types.ts` — `CommunicationProvider` gains optional `trustedDomains: string[]`
- `src/providers/teams.ts` — add `trustedDomains` list
- `src/renderer/webview-manager.ts` — `will-navigate` handler checks trusted domains before prompting
- No new dependencies; no breaking changes
