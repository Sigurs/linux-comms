## ADDED Requirements

### Requirement: Display RocketChat unread message count

The system SHALL display unread message counts for RocketChat in the sidebar badge, consistent with the Teams unread badge implementation.

#### Scenario: Successful unread count display

- **WHEN** RocketChat has unread messages
- **THEN** The sidebar badge SHALL show the total unread message count

#### Scenario: Zero unread messages

- **WHEN** RocketChat has no unread messages
- **THEN** The sidebar badge SHALL be hidden or show zero

### Requirement: Poll RocketChat API for unread counts

The system SHALL periodically poll the RocketChat API to retrieve current unread message counts.

#### Scenario: Regular polling interval

- **WHEN** Application is active and RocketChat is connected
- **THEN** The system SHALL poll the RocketChat API every 60 seconds

#### Scenario: Pause polling when inactive

- **WHEN** Application is in background or RocketChat is disconnected
- **THEN** The system SHALL pause polling until active again

### Requirement: Handle API errors gracefully

The system SHALL handle RocketChat API errors without disrupting the user experience.

#### Scenario: API failure

- **WHEN** RocketChat API request fails
- **THEN** The system SHALL show cached value (if available) and log the error

#### Scenario: Network offline

- **WHEN** Network connectivity is lost
- **THEN** The system SHALL show cached value with visual indication of stale data

### Requirement: Consistent UI with Teams badge

The RocketChat unread badge SHALL use the same visual design and placement as the Teams unread badge.

#### Scenario: Visual consistency

- **WHEN** Both Teams and RocketChat badges are visible
- **THEN** Both SHALL have identical styling, positioning, and behavior
