## ADDED Requirements

### Requirement: Drag-and-drop reordering

The system SHALL allow users to reorder instances in the sidebar via drag and drop.

#### Scenario: Successful reorder

- **WHEN** user drags an instance to a new position
- **THEN** the instance moves to the new position in the sidebar

#### Scenario: Reorder persistence

- **WHEN** user reorders instances and refreshes the page
- **THEN** the new order is preserved

### Requirement: Visual feedback

The system SHALL provide visual feedback during drag-and-drop operations.

#### Scenario: Drag indicator

- **WHEN** user starts dragging an instance
- **THEN** a visual indicator shows the instance being dragged

#### Scenario: Drop target

- **WHEN** user hovers over a valid drop position
- **THEN** a drop target indicator appears
