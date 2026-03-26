## 1. Intercept page title updates in pop-out window

- [x] 1.1 In `src/main/ipc/popout.ts`, after `win.loadURL(profile.url)`, add a `win.webContents.on('page-title-updated', (e, title) => { e.preventDefault(); win.setTitle(`${title} - ${profile.name}`); })` listener
