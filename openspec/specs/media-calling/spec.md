## ADDED Requirements

### Requirement: Camera and microphone access for webviews
Provider webviews SHALL be able to request and obtain access to camera and microphone devices via the standard `getUserMedia` API.

#### Scenario: Provider requests media access
- **WHEN** a provider's webview invokes `navigator.mediaDevices.getUserMedia`
- **THEN** the shell SHALL present a system-level permission prompt (via xdg-desktop-portal or Electron's permission handler)
- **AND** grant access upon user approval

#### Scenario: Permission denied
- **WHEN** the user denies camera or microphone access
- **THEN** the webview SHALL receive a `NotAllowedError` and the provider app SHALL handle it gracefully

### Requirement: PipeWire audio/video device enumeration
On PipeWire-based systems, the shell SHALL support device enumeration so the provider app can list available cameras and microphones.

#### Scenario: Device list available
- **WHEN** the provider calls `navigator.mediaDevices.enumerateDevices`
- **THEN** the returned list SHALL include all PipeWire-exposed audio input and video devices

### Requirement: Audio output routing
The shell SHALL not block the provider app's audio output; sound from calls SHALL route through the system's default audio output.

#### Scenario: Call audio plays through speakers
- **WHEN** a voice or video call is active in a webview
- **THEN** call audio SHALL be audible through the user's selected system audio output device

### Requirement: Media permissions persist per profile
Once the user grants camera/microphone permission to a provider profile, the permission SHALL be remembered for that partition.

#### Scenario: Permission remembered after restart
- **WHEN** the application restarts after the user previously granted media permissions to a profile
- **THEN** the profile webview SHALL not prompt for media permissions again for the same origin
