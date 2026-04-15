## 1. CSS Fix

- [x] 1.1 In `src/renderer/styles.css`, change `webview { display: none; }` to `webview { visibility: hidden; pointer-events: none; }` so inactive webviews load but remain invisible and non-interactive
- [x] 1.2 In `src/renderer/styles.css`, change `webview.active { display: flex; }` to `webview.active { visibility: visible; pointer-events: auto; }` so the active webview is shown and interactive
