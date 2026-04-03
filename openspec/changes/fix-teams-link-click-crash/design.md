## Context

On Wayland, `dialog.showMessageBox` is backed by GTK. When the `detail` text is very long (e.g. a URL with hundreds of characters), GTK attempts to allocate a Cairo image surface large enough to render the full text. If the required surface dimensions exceed internal limits, GDK emits a critical error and the process segfaults.

The current code in `src/main/ipc/link-open.ts` deliberately puts the full URL into the `detail` field whenever the URL exceeds 60 characters:

```ts
detail: truncatedUrl !== url ? `${truncatedUrl}\n\n${url}` : url,
```

This is the direct cause of the crash on long URLs.

## Goals / Non-Goals

**Goals:**
- Prevent the crash by never passing an unbounded-length string as the dialog detail
- Keep the dialog informative — users still see the (truncated) URL

**Non-Goals:**
- Adding a "copy URL" button or tooltip to expose the full URL (nice-to-have, separate change)
- Changing any other aspect of the link-open flow

## Decisions

**Decision: Only pass the truncated URL to `detail`.**

Rationale: The truncated URL (≤ 60 chars + ellipsis) is always safe. The spec already allows "tooltip or expansion" as the mechanism for full URL access; removing the full URL from the detail field is the minimal, safe change that stops the crash.

Alternative considered: cap the detail string at, say, 200 characters. Rejected — an arbitrary byte cap is fragile and harder to reason about; a fixed-length truncated URL is already handled by the existing `truncateUrl` helper.

## Risks / Trade-offs

- [Users lose the full URL in the dialog] → Acceptable per spec; full URL access can be addressed separately with a copy button.
- [Risk of similar overflow in other dialogs] → Out of scope here; no other dialog in the codebase passes unbounded URLs today.
