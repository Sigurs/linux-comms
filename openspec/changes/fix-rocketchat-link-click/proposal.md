## Why

RocketChat opens links using HTML anchor elements with `target="_blank"`, which triggers Electron's native `new-window` webview event directly — bypassing the JavaScript `window.open()` override that powers the link-choice dialog. As a result, clicking links in RocketChat does nothing. Teams is unaffected because it uses JavaScript `window.open()` calls, which the existing override intercepts correctly.

## What Changes

- Add a `new-window` event listener to each webview element in `WebviewManager`
- The handler routes these native new-window requests through the existing `openLinkChoice` IPC path, so the dialog appears for anchor-based links just as it does for `window.open()`-based links

## Capabilities

### New Capabilities

_(none)_

### Modified Capabilities

_(none — the existing `link-open-choice` spec already requires the dialog for any link that would open a new window; this is a bug fix to meet that requirement for anchor-based navigation)_

## Impact

- `src/renderer/webview-manager.ts` — add `new-window` event listener per webview
- No IPC, store, or provider changes required
