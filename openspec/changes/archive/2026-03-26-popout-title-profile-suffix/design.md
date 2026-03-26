## Context

`BrowserWindow` accepts a `title` option at creation time, but once the loaded page sets `document.title`, Electron automatically updates the window title to match. The initial `title` value is therefore only visible for a brief moment before the page overwrites it.

Electron exposes a `page-title-updated` event on `webContents` that fires every time the page title changes. Calling `e.preventDefault()` on this event suppresses the automatic title update, allowing us to set a custom title via `win.setTitle()`.

## Goals / Non-Goals

**Goals:**
- Keep `- <profile name>` permanently appended to the window title regardless of page navigation or title changes

**Non-Goals:**
- Changing the initial title set at window creation (it is effectively a placeholder shown only until the first page-title-updated event)
- Affecting the main shell window title

## Decisions

**Use `page-title-updated` with `e.preventDefault()`**

This is the correct Electron hook for intercepting page-driven title changes. Calling `win.setTitle()` directly without `preventDefault` would be overridden immediately by Electron's default handling. No alternative approach is needed.

**Format: `${title} - ${profile.name}`**

The page title carries the most useful context (e.g. unread counts, current channel), so it leads. The profile name suffix is the differentiator.

## Risks / Trade-offs

- [Empty page title] If the page sets an empty title, the window title becomes ` - <profile name>`. → Acceptable edge case; in practice provider pages always have a meaningful title.
