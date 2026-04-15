## Why

The previous implementation of `setDisplayMediaRequestHandler` passes `video: 'loopback'`, but the Electron 41 TypeScript types only accept `Video | WebFrameMain` for `video` — `'loopback'` is only valid for `audio`. The build fails with a `TS2322` type error. Additionally, the approach was conceptually wrong: to get portal-sourced video on Wayland, the handler needs `useSystemPicker: true`, which tells Electron to show the system's native picker (xdg-desktop-portal on Linux) for video source selection.

## What Changes

- Replace `callback({ video: 'loopback', audio: 'loopback' })` with `callback({ audio: 'loopback' })` and add `{ useSystemPicker: true }` as the second argument to `setDisplayMediaRequestHandler`
- `useSystemPicker: true` triggers the xdg-desktop-portal video picker on Linux; `audio: 'loopback'` provides system audio via PipeWire

## Capabilities

### New Capabilities

_(none)_

### Modified Capabilities

_(none — this is a build fix; the intended runtime behavior is unchanged)_

## Impact

- `src/main/window.ts` (`applySessionPermissions`): one-line fix to the `setDisplayMediaRequestHandler` callback
