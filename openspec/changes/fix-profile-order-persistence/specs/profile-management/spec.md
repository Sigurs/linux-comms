## ADDED Requirements

### Requirement: Sidebar profile order persists across restarts
The user SHALL be able to reorder profiles in the sidebar by dragging, and that order SHALL be saved to disk and restored on the next application start.

#### Scenario: Drag to reorder
- **WHEN** the user drags a profile entry to a new position in the sidebar
- **THEN** the sidebar SHALL display the profile in its new position
- **AND** the new order SHALL be saved to `profiles.json` with `position` fields

#### Scenario: Order restored after restart
- **WHEN** the application is restarted after a reorder
- **THEN** the sidebar SHALL display profiles in the same order as when the app was closed

#### Scenario: Order not lost on IPC error
- **WHEN** saving the new order fails
- **THEN** an error SHALL be logged
- **AND** the DOM SHALL remain in the user-dragged order for the current session
