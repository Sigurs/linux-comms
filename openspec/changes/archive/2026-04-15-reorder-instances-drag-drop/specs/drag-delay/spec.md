## ADDED Requirements

### Requirement: 1-second hold delay

The system SHALL require a 1-second hold before drag starts to prevent accidental reordering.

#### Scenario: Delay before drag

- **WHEN** user presses and holds an instance for 1 second
- **THEN** drag operation begins

#### Scenario: Cancel on early release

- **WHEN** user releases before 2 seconds
- **THEN** drag operation does not start
