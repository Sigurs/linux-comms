## Why

Clicking a link in Teams (and potentially other providers) causes a segfault on Wayland when the URL is long. The GTK dialog used by `dialog.showMessageBox` attempts to render both a truncated and full URL in the detail field, resulting in a Cairo image surface size overflow and a crash.

## What Changes

- Remove the full URL from the dialog detail field when the URL is truncated — show only the truncated form
- The dialog will no longer crash on long URLs; users can copy the link from the source webview if they need the full URL

## Capabilities

### New Capabilities

_(none)_

### Modified Capabilities

- `link-open-choice`: The dialog detail text will only show the truncated URL rather than both truncated and full URL, to prevent oversized GTK surface allocation on Wayland

## Impact

- `src/main/ipc/link-open.ts`: small change to the `detail` field passed to `dialog.showMessageBox`
- No API or IPC changes
- Affects all providers on Wayland where long URLs are clicked
