## Why

Users need to organize their instances in a custom order for better workflow management. Currently, instances are displayed in a fixed order, which may not match user preferences or priority. This change will allow users to reorder instances via drag and drop, improving usability and personalization.

## What Changes

- Add drag-and-drop functionality to the left sidebar for reordering instances
- Implement a 1-second hold delay with strict mouse position tracking to prevent accidental reordering
- Update the backend to persist the new instance order
- Modify the UI to reflect the new order immediately after reordering
- Add mouse movement threshold validation during hold phase

## Capabilities

### New Capabilities

- `instance-reordering`: Enable users to reorder instances in the sidebar via drag and drop
- `drag-delay`: Implement a 1-second hold delay with mouse position validation before drag starts

### Modified Capabilities

- None

## Impact

- Frontend: Sidebar component, drag-and-drop library integration
- Backend: Instance order persistence
- UI/UX: Improved user experience with customizable instance ordering
