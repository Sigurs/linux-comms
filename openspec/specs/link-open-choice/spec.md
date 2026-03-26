## ADDED Requirements

### Requirement: User can choose how to open external links

When a link is clicked that would open a new window, the system SHALL prompt the user to choose between opening in a popup window or in their default browser.

#### Scenario: Link opens popup choice dialog

- **WHEN** a user clicks a link that triggers a new window from within a webview
- **THEN** the system SHALL display a dialog with two options: "Open in Popup" and "Open in Browser"
- **AND** the dialog SHALL show the URL being opened

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

### Requirement: Popup window uses profile session

Popup windows opened via the link choice dialog SHALL maintain the same session context as the originating webview.

#### Scenario: OAuth flow works in popup

- **WHEN** a user clicks an OAuth link and chooses "Open in Popup"
- **THEN** the OAuth provider SHALL recognize the user's existing session
- **AND** the authentication flow SHALL complete successfully

#### Scenario: Session isolation between profiles

- **WHEN** a popup is opened from Profile A's webview
- **THEN** the popup SHALL NOT have access to Profile B's cookies or session data
- **AND** the popup SHALL only have access to Profile A's session

### Requirement: Dialog is non-blocking and informative

The link choice dialog SHALL provide clear information without disrupting the user's workflow unnecessarily.

#### Scenario: Dialog shows truncated URL for long URLs

- **WHEN** the URL to be opened is longer than 60 characters
- **THEN** the dialog SHALL display a truncated version with ellipsis
- **AND** the full URL SHALL be accessible (e.g., via tooltip or expansion)

#### Scenario: Dialog has sensible default focus

- **WHEN** the dialog appears
- **THEN** the "Open in Browser" button SHALL have default focus
- **AND** the dialog SHALL be dismissible with the Escape key
