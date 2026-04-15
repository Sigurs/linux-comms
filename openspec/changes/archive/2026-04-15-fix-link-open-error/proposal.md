## Why

The link opening system currently fails when encountering malformed URLs or when URL parsing throws exceptions. This prevents the "Open Link" dialog from appearing and can cause links to fail silently. The issue affects both embedded webviews and popped-out windows, particularly when users click on links with invalid or malformed URLs.

## What Changes

- Add robust error handling around all URL parsing operations in the link interception code
- Ensure the link dialog gracefully handles malformed URLs by showing an error message or falling back to safe behavior
- Improve logging for link handling errors to aid debugging
- Maintain the existing user experience for valid URLs while preventing crashes on invalid ones

## Capabilities

### New Capabilities

- `link-error-handling`: Robust error handling for malformed URLs in link interception

### Modified Capabilities

- `link-open-choice`: The dialog must handle malformed URLs gracefully without crashing

## Impact

- `src/renderer/webview-manager.ts`: Add error handling around URL parsing in link interception
- `src/main/ipc/popout.ts`: Add error handling around URL parsing in popout window handlers
- `src/main/ipc/link-open.ts`: Improve error handling and logging in the link dialog function
- No breaking changes to existing functionality or APIs
