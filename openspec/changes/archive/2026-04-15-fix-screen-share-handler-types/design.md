## Context

The Electron 41 `Streams` interface:
```
video?: Video | WebFrameMain      // 'loopback' NOT valid
audio?: 'loopback' | 'loopbackWithMute' | WebFrameMain   // 'loopback' valid
```

`'loopback'` for audio means "provide system audio via PipeWire loopback". There is no `'loopback'` equivalent for video — video must be a `DesktopCapturerSource`-shaped object (`Video`) or a `WebFrameMain`.

On Wayland we cannot use `desktopCapturer.getSources()` (it does not work under Ozone), so we cannot manually supply a `Video` object. Instead, `useSystemPicker: true` tells Electron to show the OS-native picker; on Linux with xdg-desktop-portal this is the portal picker. Electron then supplies the selected stream to the webview without requiring the handler to manually specify a `Video` source.

The `setDisplayMediaRequestHandler` must still be called (without any handler Electron 20+ rejects all `getDisplayMedia` calls). Setting `useSystemPicker: true` handles video via portal; passing `audio: 'loopback'` in the callback provides system audio via PipeWire.

## Goals / Non-Goals

**Goals:**
- Fix the TypeScript build error
- Correctly route video to portal picker and audio to PipeWire loopback on Wayland

**Non-Goals:**
- Changing X11 screen sharing (not affected — handler is gated on `isWayland()`)

## Decisions

**Decision: `{ audio: 'loopback' }` + `{ useSystemPicker: true }`**

Rationale: `'loopback'` is only type-valid for audio. `useSystemPicker: true` is the documented mechanism for delegating video source selection to the OS (portal on Linux). This is the only TypeScript-valid approach that correctly handles both video and audio on Wayland.

Alternative: `callback({})` with no video — `getDisplayMedia` would resolve with no video track, which breaks screen sharing.

Alternative: Remove the handler entirely — Electron 20+ rejects `getDisplayMedia` when no handler is set.

## Risks / Trade-offs

- [`useSystemPicker` is documented as "macOS Experimental"] → The option is present in the type definition and Electron's picker logic is cross-platform; on Linux it delegates to xdg-desktop-portal when available. Worth verifying manually after the fix.
