## ADDED Requirements

### Requirement: Exclude transitive dependencies
The system SHALL allow explicit exclusion of specific transitive dependencies in build configuration.

#### Scenario: Exclude specific transitive dependency
- **WHEN** a transitive dependency is added to the exclusion list in build configuration
- **THEN** that dependency is not included in the final build

#### Scenario: Verify exclusion effectiveness
- **WHEN** build is executed after adding exclusions
- **THEN** excluded dependencies do not appear in the dependency tree
