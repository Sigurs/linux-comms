## 1. Data Model Updates

- [x] 1.1 Add `zoomLevel?: number` field to `Profile` interface in `src/shared/types.ts`
- [x] 1.2 Add `ZOOM_MIN` and `ZOOM_MAX` constants (values -1 and +9) to `src/shared/types.ts`

## 2. Profile Store Updates

- [x] 2.1 Add `updateZoomLevel(profileId: string, zoomLevel: number): void` function to `src/main/store/profile-store.ts`
- [x] 2.2 Implement zoom level validation and clamping in the update function
- [x] 2.3 Ensure existing profiles without zoomLevel field default to 0 on read

## 3. IPC Handler

- [x] 3.1 Add `profile:update-zoom` IPC channel to `src/shared/ipc-channels.ts`
- [x] 3.2 Create handler for updating zoom level in `src/main/ipc/profile.ts`
- [x] 3.3 Handler registered via existing `registerProfileIpc()`

## 4. Shell Preload Updates

- [x] 4.1 Add `updateZoomLevel(profileId: string, zoomLevel: number): Promise<void>` to `electronAPI` interface
- [x] 4.2 Expose the IPC call through contextBridge in `src/preload/shell-preload.ts`

## 5. WebviewManager Updates

- [x] 5.1 Accept `zoomLevel` from profile in `ensureWebview()` method
- [x] 5.2 Apply profile's zoom level in `dom-ready` handler (replace hardcoded `setZoomLevel(0)`)
- [x] 5.3 Add `applyZoom(profileId: string, zoomLevel: number): void` method
- [x] 5.4 Call `applyZoom` in `switchTo()` method when activating a webview

## 6. UI - Sidebar Context Menu

- [x] 6.1 Add "Zoom In" menu item to profile context menu in `src/renderer/sidebar.ts`
- [x] 6.2 Add "Zoom Out" menu item to profile context menu
- [x] 6.3 Add "Reset Zoom" menu item to profile context menu
- [x] 6.4 Implement zoom level tracking in sidebar (current zoom per profile)
- [x] 6.5 Disable "Zoom In" when at maximum zoom (+9)
- [x] 6.6 Disable "Zoom Out" when at minimum zoom (-1)

## 7. Zoom Keyboard/Mouse Shortcut

- [x] 7.1 Add wheel event listener to webview container in `src/renderer/index.ts`
- [x] 7.2 Detect Ctrl key modifier during wheel event
- [x] 7.3 Call zoom in/out logic with clamping at limits
- [x] 7.4 Persist zoom level after change

## 8. Testing

- [x] 8.1 Test zoom persistence across app restarts
- [x] 8.2 Test zoom application when switching profiles
- [x] 8.3 Test zoom controls in context menu
- [x] 8.4 Test Ctrl + mouse wheel zoom over webview area
- [x] 8.5 Test invalid zoom values are clamped correctly
- [x] 8.6 Test existing profiles without zoomLevel field default to 0
