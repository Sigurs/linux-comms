## 1. Implementation

- [x] 1.1 In `src/main/platform/wayland.ts`, add `WebRTCPipeWireCapturer` to the `enable-features` switch inside the `if (isWayland())` block

## 2. Verification

- [ ] 2.1 Manually test that clicking the screen share button in Teams on Wayland shows the xdg-desktop-portal picker
- [ ] 2.2 Confirm screen sharing completes successfully after selecting a source
- [ ] 2.3 Verify X11 screen sharing is unchanged (custom picker still appears on X11)
