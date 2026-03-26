## Context

The profile context menu in the sidebar provides actions for managing profiles (pop out, rename, zoom, remove). Users need a way to reload a profile's webview when they get stuck on a sub-page.

## Goals / Non-Goals

**Goals:**

- Add "Reload" option to profile context menu
- Reload the webview content (same effect as browser refresh)
- Work for both active and inactive profiles

**Non-Goals:**

- Hard refresh / cache clearing
- Reload history or undo functionality
- Reload all profiles at once

## Decisions

### 1. Use Electron's `webview.reload()` method

**Rationale**: The webview tag has a built-in `reload()` method that performs a standard page reload. No need for IPC calls - can be handled entirely in the renderer.

### 2. Place "Reload" after "Pop out" in context menu

**Rationale**: Both actions are navigation-related. "Reload" is a less destructive action than rename/remove, so placing it early in the menu makes it easily accessible.

## Risks / Trade-offs

**Unsaved form data lost on reload** → Expected behavior (same as browser refresh). Acceptable trade-off.

**Reload during OAuth flow** → May interrupt the flow. User initiated action, acceptable.
