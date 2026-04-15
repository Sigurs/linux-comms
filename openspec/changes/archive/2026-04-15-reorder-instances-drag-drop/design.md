## Context

The current sidebar displays instances in a fixed order, which doesn't allow users to prioritize or organize their workflow. This design introduces drag-and-drop functionality with a 2-second hold delay to prevent accidental reordering.

## Goals / Non-Goals

**Goals:**

- Enable users to reorder instances via drag and drop
- Implement a 2-second hold delay before drag starts
- Persist the new order in the backend
- Provide immediate visual feedback during reordering

**Non-Goals:**

- Support for nested instance groups
- Multi-select drag and drop
- Cross-device sync of instance order

## Decisions

### Drag-and-Drop Library

**Decision**: Use react-beautiful-dnd for drag-and-drop functionality.
**Rationale**: It's widely used, has good accessibility support, and provides smooth animations. The 2-second hold delay can be implemented using the `delay` prop or custom logic.

**Alternatives Considered**:

- react-dnd: More flexible but requires more boilerplate
- Custom implementation: Would take more time and lack accessibility features

### Hold Delay Implementation

**Decision**: Implement a custom 1-second hold delay before enabling drag without visual countdown.
**Rationale**: This prevents accidental reordering while maintaining a responsive feel. We'll use a timer that starts on mouse down and enables drag only after 1 second. The visual countdown has been removed for a cleaner UI.

### Backend Persistence

**Decision**: Store instance order as a `position` field in the database.
**Rationale**: Simple to implement and query. When instances are reordered, we'll update the `position` values via API.

**Alternatives Considered**:

- Store order in user preferences: Less scalable for large instance lists
- Use a separate ordering table: More complex than needed

## Risks / Trade-offs

**Performance Impact**: Drag-and-drop operations could cause UI lag with many instances. → Mitigation: Implement virtualization for the sidebar if performance issues arise.

**Backend Load**: Frequent order updates could increase database writes. → Mitigation: Debounce API calls during rapid reordering.

**Accessibility**: Drag-and-drop may not be accessible to all users. → Mitigation: Provide keyboard shortcuts for reordering as a future enhancement.

## Migration Plan

1. Implement frontend drag-and-drop with hold delay
2. Add backend API endpoint for updating instance order
3. Update database schema to include `position` field
4. Deploy changes and monitor for issues

## Open Questions

- Should we limit the maximum number of reorderable instances for performance?
- How should we handle conflicts if multiple users try to reorder the same instance?
