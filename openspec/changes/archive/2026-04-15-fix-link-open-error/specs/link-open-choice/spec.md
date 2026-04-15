## MODIFIED Requirements

### Requirement: User can choose how to open external links

When a link is clicked that would navigate outside the current webview origin, the system SHALL prompt the user to choose between opening in a popup window or in their default browser. This applies to all link-opening mechanisms: programmatic `window.open()` calls, native `new-window` webview events, same-frame navigations to external origins, and anchor element clicks with `target="_blank"`. This applies in both the main embedded webview and in popped-out provider windows. This dialog SHALL only be shown for URLs that are not matched by the originating profile's provider `trustedDomains`. At most one Open Link dialog SHALL be visible at any time; additional link-open requests received while a dialog is already open SHALL be silently discarded.

The system SHALL handle malformed URLs gracefully. If a URL cannot be parsed or validated, the system SHALL either show an appropriate error message or fall back to safe behavior without crashing.

#### Scenario: Link opens popup choice dialog via window.open

- **WHEN** a user clicks a link that triggers `window.open()` from within a webview
- **THEN** the system SHALL display a dialog with two options: "Open in Popup" and "Open in Browser"
- **AND** the dialog SHALL show the URL being opened

#### Scenario: Link opens popup choice dialog via anchor click

- **WHEN** a user clicks an anchor element with `target="_blank"` pointing to an external origin
- **THEN** the system SHALL display the link-choice dialog
- **AND** the browser SHALL NOT open a new window or tab natively

#### Scenario: Link opens popup choice dialog via new-window event

- **WHEN** a link triggers the webview's native new-window event (e.g. right-click → Open Link)
- **THEN** the system SHALL display the link-choice dialog

#### Scenario: Same-origin anchor clicks are not intercepted

- **WHEN** a user clicks an anchor element with `target="_blank"` pointing to the same origin as the webview's profile URL
- **THEN** the system SHALL NOT intercept the click or show the dialog
- **AND** the browser SHALL handle the navigation normally

#### Scenario: Link clicked in popped-out window shows dialog

- **WHEN** a provider profile is popped out into its own window
- **AND** the user clicks an external link inside that window
- **THEN** the link-choice dialog SHALL appear
- **AND** the dialog SHALL be parented to the popped-out window

#### Scenario: Duplicate link click while dialog is open

- **WHEN** a link-open dialog is already visible
- **AND** a further link is clicked (or the same link is clicked again)
- **THEN** no second dialog SHALL appear
- **AND** the existing dialog SHALL remain unaffected

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

#### Scenario: Trusted domain navigation bypasses dialog

- **WHEN** a `will-navigate` event fires for a URL matching the provider's `trustedDomains`
- **THEN** the navigation SHALL proceed without showing the dialog
- **AND** no user interaction SHALL be required

#### Scenario: Malformed URL in link interception

- **WHEN** a link interception handler encounters a malformed URL that cannot be parsed
- **THEN** the system SHALL log the error with details
- **AND** the system SHALL NOT show the link choice dialog
- **AND** the system SHALL NOT crash or throw unhandled exceptions
- **AND** the system SHALL allow the link to be handled by the browser's default behavior

#### Scenario: Dialog appears in front of the main window

- **WHEN** a link-open dialog is shown
- **THEN** the dialog SHALL appear in front of the main application window
- **AND** the dialog SHALL NOT be obscurable by clicking the main window

#### Scenario: Dialog shows truncated URL for long URLs

- **WHEN** the URL to be opened is longer than 60 characters
- **THEN** the dialog SHALL display only the truncated version (with ellipsis) in the detail field
- **AND** the full URL SHALL NOT be included in the dialog detail text to prevent surface allocation crashes on Wayland

#### Scenario: Dialog has sensible default focus

- **WHEN** the dialog appears
- **THEN** the "Open in Browser" button SHALL have default focus
- **AND** the dialog SHALL be dismissible with the Escape key
