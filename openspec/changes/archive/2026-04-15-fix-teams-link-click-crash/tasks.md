## 1. Fix

- [x] 1.1 In `src/main/ipc/link-open.ts`, change the `detail` field in `dialog.showMessageBox` to only pass `truncatedUrl` (never the full URL)

## 2. Verify

- [ ] 2.1 Test with a long URL in Teams on Wayland — confirm no crash and dialog shows truncated URL
- [ ] 2.2 Test with a short URL — confirm dialog still shows the full URL unchanged
