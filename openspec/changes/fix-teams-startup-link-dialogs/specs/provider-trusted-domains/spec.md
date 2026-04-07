## ADDED Requirements

### Requirement: Provider may declare trusted domains
A `CommunicationProvider` SHALL support an optional `trustedDomains` field containing a list of domain patterns (supporting leading wildcard, e.g. `*.microsoft.com`). Navigations to URLs whose hostname matches any trusted domain pattern SHALL be allowed to proceed without user confirmation.

#### Scenario: Trusted domain navigation proceeds silently
- **WHEN** a webview navigates to a URL whose hostname matches a pattern in the provider's `trustedDomains`
- **THEN** the navigation SHALL proceed without showing the link-open-choice dialog

#### Scenario: Non-trusted external navigation still prompts
- **WHEN** a webview navigates to a URL whose hostname does NOT match any trusted domain and is a different origin from the profile URL
- **THEN** the link-open-choice dialog SHALL be shown as normal

#### Scenario: Provider with no trustedDomains behaves unchanged
- **WHEN** a provider does not declare `trustedDomains` (field absent or empty)
- **THEN** all cross-origin navigations SHALL continue to trigger the link-open-choice dialog

### Requirement: Teams provider declares Microsoft-owned trusted domains
The Teams provider SHALL declare `trustedDomains` covering the Microsoft-owned origins used during its authentication and startup flow.

#### Scenario: Teams startup does not show Open Link dialogs
- **WHEN** the application launches with one or more Teams accounts configured
- **THEN** no link-open-choice dialog SHALL appear for `teams.cloud.microsoft` or other trusted Microsoft domains
- **AND** Teams SHALL load to its main interface without user interaction
