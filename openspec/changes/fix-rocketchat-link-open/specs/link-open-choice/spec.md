## MODIFIED Requirements

### Requirement: User can choose how to open external links

When a link is clicked that would navigate the webview to an external URL, or open a new window, the system SHALL prompt the user to choose between opening in a popup window or in their default browser.

#### Scenario: Link opens popup choice dialog via new-window

- **WHEN** a user clicks a link that triggers a new window from within a webview (e.g. `target="_blank"`)
- **THEN** the system SHALL display a dialog with two options: "Open in Popup" and "Open in Browser"
- **AND** the dialog SHALL show the URL being opened

#### Scenario: Link opens popup choice dialog via will-navigate

- **WHEN** a user clicks a plain anchor link (no `target` attribute) or uses the right-click context menu to open a link
- **AND** the destination URL's origin differs from the profile's server URL origin
- **THEN** the system SHALL cancel the webview navigation
- **AND** the system SHALL display the link-open choice dialog with the destination URL

#### Scenario: Internal SPA navigation is not intercepted

- **WHEN** a user navigates to a URL within the same origin as the profile's server URL (e.g. switching rooms in RocketChat)
- **THEN** the webview SHALL navigate normally
- **AND** the link-open dialog SHALL NOT appear

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
