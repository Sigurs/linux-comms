## Context

Link/attachment opening involves three interception layers: the injected script inside webviews (anchor clicks, window.open, will-navigate), the shell renderer's webview-manager, and the main process link-open IPC handler. When a link fails to open, there is currently no way to tell which layer dropped it or what decision was made. The `screen-share-debug` feature established the pattern: gate verbose stdout logging on `app.commandLine.hasSwitch('debug')` in the main process and `process.argv.includes('--debug')` in renderer/preload contexts.

## Goals / Non-Goals

**Goals:**
- Log every link-open decision point to stdout when `--debug` is set
- Cover all interception layers: injected script, webview-manager, popout window handler, main-process IPC handler
- Log enough context to reproduce failures: source layer, raw URL, validation result, trusted-domain match, user choice, final action
- Zero behaviour change when `--debug` is not set

**Non-Goals:**
- UI-visible debug output
- Logging of link content or user credentials embedded in URLs (only log the URL as-is, same as existing code)
- Changing how links are opened; this is observability only

## Decisions

**Decision: Reuse existing debug flag, add a `debugLinkOpen` export in `link-open.ts`**

The screen-share module exports a `debugScreenShare` boolean read once at module load. The same pattern will be used: `export const debugLinkOpen = app.commandLine.hasSwitch('debug')` in `link-open.ts`. Renderer-side checks use `process.argv.includes('--debug')` inline, consistent with `webview-preload.ts`.

Alternative considered: a shared `debug.ts` utility module. Rejected — the per-module pattern avoids a new dependency and is already established.

**Decision: `[link-open]` log prefix for all new entries**

The prefix already exists in `link-open.ts` for error lines. Extending it to debug lines keeps grep output coherent. The injected script in `webview-manager.ts` already uses `[link]`; debug lines there will use `[link]` too, to avoid changing existing non-debug log lines.

**Decision: Log source (which layer intercepted) and action (what happened)**

The most useful datum for debugging is "which layer handled this URL and what did it decide". Each log line will include: layer name, URL, and the decision/outcome. This allows correlating a missing link open to a specific interception point.

## Risks / Trade-offs

- [Risk] Sensitive URL parameters appear in stdout → Mitigation: acceptable; existing error logs already log full URLs, and `--debug` is opt-in
- [Risk] Log volume in chat-heavy sessions → Mitigation: `--debug` is explicit; not a concern for normal use
