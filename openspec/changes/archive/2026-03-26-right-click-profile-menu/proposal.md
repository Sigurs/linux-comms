## Why

The current UX requires hovering over a profile icon to reveal a hidden three-dots button, then clicking it to open the profile menu. This interaction is indirect and less intuitive than a standard right-click context menu, which users expect on desktop applications.

## What Changes

- Remove the three-dots (`⋮`) button from each profile entry in the sidebar
- Attach a `contextmenu` (right-click) event listener to each profile entry button to trigger the existing profile context menu
- Remove CSS rules that show/hide the `.ctx-menu-btn` on hover

## Capabilities

### New Capabilities

- `profile-context-menu`: Right-clicking a profile icon in the sidebar opens the profile options menu (previously triggered via a three-dots button)

### Modified Capabilities

- `profile-management`: The method of accessing profile options changes from clicking a hover-revealed three-dots button to right-clicking the profile icon directly

## Impact

- `src/renderer/sidebar.ts`: Remove the `.ctx-menu-btn` span from the profile entry HTML, replace the `.ctx-menu-btn` click listener with a `contextmenu` listener on the profile button itself
- `src/renderer/styles.css`: Remove `.ctx-menu-btn` show/hide hover styles
