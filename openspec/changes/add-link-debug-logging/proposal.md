## Why

Opening attachments and links in both RocketChat and Teams is unreliable, and diagnosing failures is difficult without visibility into what happens at each interception point. Several `[link]` / `[link-open]` log lines already exist but they are unconditional, coarse, and omit the provider identity — making it impossible to tell whether a failure is RocketChat-specific or Teams-specific, and what exactly triggered each decision. Adding structured, `--debug`-gated logging with full context mirrors the existing screen-share debug capability and gives actionable data for reproducing and fixing these issues.

## What Changes

- When `--debug` is active, every link-handling decision point logs to stdout with provider, profile name, URL scheme, and outcome
- Existing unconditional `[link]` / `[link-open]` lines are augmented or replaced with `--debug`-gated equivalents that include: `providerId` (e.g. `rocketchat` / `teams`), `profile.name`, full URL, URL scheme, source layer (window.open / anchor / will-navigate / new-window / popout), trusted-domain match result, and final action (browser / popup / cancel / discard)
- The injected script in webviews includes `providerId` and the webview's current `location.href` in each log line, so you can see the page context where the link was activated
- No user-visible behaviour changes; all new output is stdout-only and gated on `--debug`

## Capabilities

### New Capabilities
- `link-open-debug`: Opt-in debug logging for the full link-open flow across RocketChat and Teams, activated by `--debug`

### Modified Capabilities

## Impact

- `src/main/ipc/link-open.ts` — add `debugLinkOpen` export; enhance log lines with profile name, URL scheme, trusted-domain result, user choice, and final action
- `src/renderer/webview-manager.ts` — gate verbose link logs on `--debug`; add `providerId`, `profile.name`, current page URL, and URL scheme to each interception log
- `src/main/ipc/popout.ts` — add `debugLinkOpen`-gated logs in `setWindowOpenHandler` and `will-navigate` with profile, provider, and URL scheme
- `src/main/ipc/index.ts` — add `debugLinkOpen`-gated log for URLs rejected by the `^https?://` guard in `SHELL_OPEN_EXTERNAL`
- No new dependencies; follows the same `app.commandLine.hasSwitch('debug')` / `process.argv.includes('--debug')` pattern as `screen-share-debug`
