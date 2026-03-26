## 1. Set app icon on main window

- [x] 1.1 In `src/main/window.ts`, add `icon: join(__dirname, '../../assets/icons/256x256.png')` to the `BrowserWindow` constructor options

## 2. Set app icon on pop-out windows

- [x] 2.1 In `src/main/ipc/popout.ts`, add `icon: join(__dirname, '../../../assets/icons/256x256.png')` to the `BrowserWindow` constructor options
