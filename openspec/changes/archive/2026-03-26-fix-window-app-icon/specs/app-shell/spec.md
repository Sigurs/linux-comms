## ADDED Requirements

### Requirement: Windows display app icon
The main window and all pop-out windows SHALL display the application's icon in the title bar, taskbar, and window switcher rather than the Electron default icon.

#### Scenario: Main window shows app icon
- **WHEN** the application is launched
- **THEN** the main window SHALL display the app icon in the title bar and taskbar

#### Scenario: Pop-out window shows app icon
- **WHEN** a profile is popped out into a new window
- **THEN** the pop-out window SHALL display the app icon in the title bar and taskbar
