## ADDED Requirements

### Requirement: About button in sidebar footer

The sidebar footer SHALL display an "About" button (`<button id="btn-about">`) in place of the passive version span. The button SHALL show the CalVer version string as its visible label. Clicking it SHALL open the About modal.

#### Scenario: About button visible in sidebar

- **WHEN** the app renders
- **THEN** the sidebar footer shows a button labelled with the current version string (e.g. `26.416.1`)

#### Scenario: Clicking About opens the modal

- **WHEN** the user clicks the About button
- **THEN** the About modal overlay becomes visible

---

### Requirement: About modal content

The About modal SHALL display: the app version string, a clickable link to the GitHub repository (`https://github.com/Sigurs/linux-comms`), and a scrollable list of all production dependencies with their package name, license identifier, and license text.

#### Scenario: Modal shows version

- **WHEN** the About modal is open
- **THEN** the current CalVer version string is displayed

#### Scenario: Modal shows GitHub link

- **WHEN** the About modal is open
- **THEN** a link labelled "View on GitHub" (or similar) is visible and, when clicked, opens `https://github.com/Sigurs/linux-comms` in the system browser via `shell.openExternal`

#### Scenario: Modal shows dependency license list

- **WHEN** the About modal is open
- **THEN** a list of production dependencies is shown, each with its package name, SPDX license identifier, and collapsible full license text

#### Scenario: Package with no license text falls back to SPDX link

- **WHEN** a dependency has no bundled license text
- **THEN** the entry displays the SPDX identifier and a link to `https://spdx.org/licenses/<id>.html`

---

### Requirement: About modal dismissal

The About modal SHALL be dismissible by clicking the close button, clicking outside the modal (on the overlay), or pressing Escape.

#### Scenario: Close button dismisses modal

- **WHEN** the About modal is open and the user clicks the close button
- **THEN** the modal overlay is hidden

#### Scenario: Escape key dismisses modal

- **WHEN** the About modal is open and the user presses Escape
- **THEN** the modal overlay is hidden

#### Scenario: Clicking overlay backdrop dismisses modal

- **WHEN** the About modal is open and the user clicks the overlay outside the modal box
- **THEN** the modal overlay is hidden
