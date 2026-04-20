## 1. Main Process — link-open.ts

- [x] 1.1 Export `debugLinkOpen = app.commandLine.hasSwitch('debug')` at module top in `src/main/ipc/link-open.ts`
- [x] 1.2 Gate the entry log on `debugLinkOpen`; extend it to include `profile.name`, `providerId`, `partition`, and URL scheme (`new URL(url).protocol`)
- [x] 1.3 Add `debugLinkOpen`-gated log for the duplicate-dialog guard (before `return`): include URL, `profileId`, `profile.name`, `providerId`
- [x] 1.4 Add `debugLinkOpen`-gated log for the trusted-domain check: log whether provider has `trustedDomains`, which pattern matched (or "no match")
- [x] 1.5 Add `debugLinkOpen`-gated log mapping `result.response` to action name (`0=browser`, `1=popup`, `2=cancel`) for clarity
- [x] 1.6 Add `debugLinkOpen`-gated log just before `shell.openExternal(url)` call: `[link-open] opening in browser url=<url>`
- [x] 1.7 Add `debugLinkOpen`-gated log when falling back to browser due to missing profile: include `profileId` and URL

## 2. Main Process — index.ts (shell:open-external)

- [x] 2.1 Import `debugLinkOpen` from `./link-open` in `src/main/ipc/index.ts`
- [x] 2.2 Add `debugLinkOpen`-gated log when URL fails the `^https?://` scheme guard: log `[link-open] shell:open-external rejected scheme=<scheme> url=<url>`
- [x] 2.3 Add `debugLinkOpen`-gated log when URL passes and `shell.openExternal` is called: log `[link-open] shell:open-external dispatched url=<url>`

## 3. Main Process — popout.ts

- [x] 3.1 Import `debugLinkOpen` from `./link-open` in `src/main/ipc/popout.ts`
- [x] 3.2 In `setWindowOpenHandler`: add `debugLinkOpen`-gated log `[link-open] source=popout:window-open profileId=<id> profile=<name> provider=<id> scheme=<scheme> url=<url>`
- [x] 3.3 In the popout `will-navigate` handler: add `debugLinkOpen`-gated log including same-origin result and trusted-domain match (pattern or "no match" or "no trusted domains"): `[link-open] source=popout:will-navigate profileId=<id> provider=<id> sameOrigin=<bool> trusted=<pattern|no match> url=<url>`

## 4. Renderer — webview-manager.ts (injected script + host event handlers)

- [x] 4.1 Derive `var _debugLink = process.argv.includes('--debug');` near the top of the `INJECTION_SCRIPT` string, after the existing `lc` reference
- [x] 4.2 In `window.open` override: add `_debugLink`-gated log `[link] source=window.open provider=<lc.__providerId> profile=<lc.__profileName> scheme=<scheme> target=<target> features=<features> url=<url> page=<location.href>`
- [x] 4.3 In anchor-click capture listener: add `_debugLink`-gated log `[link] source=anchor provider=<lc.__providerId> profile=<lc.__profileName> scheme=<scheme> url=<href> page=<location.href>` (logged before `lc.openLinkChoice`)
- [x] 4.4 Expose `__providerId` and `__profileName` on `window.__linuxComms` in the preload (`webview-preload.ts`) so the injected script can read them from `lc`; set them via `executeJavaScript` in `dom-ready` alongside the existing `__profileId` injection
- [x] 4.5 In `will-navigate` host handler in `webview-manager.ts`: replace the existing unconditional `console.log` with a `debugLink`-gated log that includes `providerId`, `profile.name`, destination URL scheme, same-origin result (`destOrigin === profileOrigin`), and trusted-domain result (matched pattern or "no match")
- [x] 4.6 In `new-window` host handler: replace the existing unconditional `console.log` with a `debugLink`-gated log including `providerId`, `profile.name`, URL scheme: `[link] source=new-window provider=<id> profile=<name> scheme=<scheme> url=<url>`
- [x] 4.7 In `ipc-message` handler for `link-open-request`: replace the existing unconditional `console.log` with a `debugLink`-gated equivalent including `providerId` and `profile.name`
- [x] 4.8 Derive `const debugLink = process.argv.includes('--debug');` at module level in `webview-manager.ts` (for use in host-side handlers in tasks 4.5–4.7)
