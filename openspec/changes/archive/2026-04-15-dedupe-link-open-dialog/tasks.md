## 1. Fix

- [x] 1.1 In `src/main/ipc/link-open.ts`, add a module-level `let dialogOpen = false` flag
- [x] 1.2 At the top of the `LINK_OPEN_PROMPT` handler, return immediately if `dialogOpen` is `true`
- [x] 1.3 Set `dialogOpen = true` before `await dialog.showMessageBox` and reset it in a `finally` block

## 2. Verify

- [x] 2.1 Run `npm run build` — confirm no TypeScript errors
- [x] 2.2 Click a link in Teams or RocketChat and rapidly click another link — confirm only one dialog appears
- [x] 2.3 Dismiss the dialog and confirm a subsequent link click opens a new dialog normally
