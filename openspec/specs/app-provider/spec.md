## ADDED Requirements

### Requirement: Provider interface contract
Every communication provider SHALL implement the `CommunicationProvider` TypeScript interface exported by the shell's provider registry.

#### Scenario: Provider is registered at startup
- **WHEN** the application initializes
- **THEN** all statically registered providers SHALL be loaded and their metadata (name, icon, default URL) SHALL be available to the sidebar

#### Scenario: Invalid provider registration
- **WHEN** a provider is missing required interface fields
- **THEN** the application SHALL log an error and skip that provider at startup without crashing

### Requirement: Teams provider
The shell SHALL ship a built-in Teams provider that loads the Microsoft Teams web application.

#### Scenario: Teams loads with correct user agent
- **WHEN** the Teams webview is created
- **THEN** it SHALL use a Chrome-compatible user agent string so that Teams web app functions without feature degradation

#### Scenario: Teams authentication flow
- **WHEN** the user is not authenticated
- **THEN** the Teams webview SHALL display the Microsoft login page and complete OAuth within the webview session

### Requirement: RocketChat provider
The shell SHALL ship a built-in RocketChat provider that loads a configurable RocketChat server URL.

#### Scenario: RocketChat server URL configuration
- **WHEN** the user adds a RocketChat profile
- **THEN** the shell SHALL prompt for the server URL and persist it with the profile

#### Scenario: RocketChat loads on configured URL
- **WHEN** the RocketChat webview is activated
- **THEN** it SHALL navigate to the user-configured server URL

### Requirement: Per-provider webview configuration
Each provider SHALL declare its required webview configuration (user agent, preload scripts, permission grants, content security overrides).

#### Scenario: Webview created with provider config
- **WHEN** a new webview is instantiated for a provider
- **THEN** all provider-declared webview options SHALL be applied before the initial navigation

#### Scenario: Provider requests camera/microphone permissions
- **WHEN** a provider's webview requests camera or microphone access
- **THEN** the shell SHALL delegate the permission request to the OS portal and relay the result to the webview
