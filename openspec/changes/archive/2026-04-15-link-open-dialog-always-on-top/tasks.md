## 1. Fix

- [x] 1.1 In `src/main/ipc/link-open.ts`, import `getMainWindow` from `../window`
- [x] 1.2 Replace the single `dialog.showMessageBox({ ... })` call with a conditional that passes `getMainWindow()` as the parent when non-null, falling back to the parentless form

## 2. Verify

- [x] 2.1 Run `npm run build` — confirm no TypeScript errors
- [x] 2.2 Click a link and confirm the Open Link dialog appears in front of the main window
- [x] 2.3 Click the main window while the dialog is open — confirm the dialog stays on top
