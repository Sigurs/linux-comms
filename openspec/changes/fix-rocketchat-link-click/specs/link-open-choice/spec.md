## MODIFIED Requirements

### Requirement: User can choose how to open external links

When a link is clicked that would open a new window, the system SHALL prompt the user to choose between opening in a popup window or in their default browser. This applies to both JavaScript `window.open()` calls and HTML anchor elements with `target="_blank"`.

#### Scenario: Link opens popup choice dialog

- **WHEN** a user clicks a link that triggers a new window from within a webview
- **THEN** the system SHALL display a dialog with two options: "Open in Popup" and "Open in Browser"
- **AND** the dialog SHALL show the URL being opened

#### Scenario: Anchor element with target="_blank" triggers choice dialog

- **WHEN** a user clicks an HTML anchor element with `target="_blank"` inside a webview
- **THEN** the system SHALL display the link choice dialog
- **AND** the link SHALL NOT be silently discarded

#### Scenario: User chooses popup option

- **WHEN** the user selects "Open in Popup"
- **THEN** the system SHALL open a new Electron BrowserWindow
- **AND** the new window SHALL use the same session/partition as the source webview
- **AND** cookies and authentication state SHALL be preserved

#### Scenario: User chooses browser option

- **WHEN** the user selects "Open in Browser"
- **THEN** the system SHALL open the URL in the user's default system browser
- **AND** the popup window SHALL NOT be created

#### Scenario: User cancels the dialog

- **WHEN** the user closes or cancels the dialog without selecting an option
- **THEN** no window SHALL be opened
- **AND** the URL SHALL NOT be opened anywhere
