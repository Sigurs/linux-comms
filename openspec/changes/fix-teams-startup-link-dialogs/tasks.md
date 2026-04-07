## 1. Extend Provider Type

- [x] 1.1 Add optional `trustedDomains?: string[]` field to `CommunicationProvider` interface in `src/shared/types.ts`

## 2. Update Teams Provider

- [x] 2.1 Add `trustedDomains` to the Teams provider in `src/providers/teams.ts` covering `*.microsoft.com`, `*.cloud.microsoft`, and `*.microsoftonline.com`

## 3. Update will-navigate Handler

- [x] 3.1 In `src/renderer/webview-manager.ts`, import or resolve the provider for the current profile inside the `will-navigate` handler
- [x] 3.2 Implement a `matchesTrustedDomain(url: string, trustedDomains: string[])` helper that returns `true` when the URL hostname matches any pattern in the list (wildcard prefix `*.` supported)
- [x] 3.3 Skip calling `openLinkChoice` when `matchesTrustedDomain` returns `true` for the destination URL

## 4. Verify

- [x] 4.1 Launch the app with a Teams account and confirm no Open Link dialog appears on startup
- [x] 4.2 Confirm external links from Teams (e.g. a link to `github.com`) still show the dialog
