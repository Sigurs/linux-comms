## ADDED Requirements

### Requirement: Curated Lucide icon set bundled at build time
The build process SHALL generate a `lucide-index.ts` module containing a curated subset of Lucide icons (communication, app, and UI categories) as a `Record<string, string>` mapping icon name to inline SVG string. The module SHALL be imported by the renderer bundle.

#### Scenario: Build produces the index module
- **WHEN** the renderer build runs
- **THEN** `src/renderer/lucide-index.ts` exists and exports an object with at least 50 named SVG entries

#### Scenario: Only allowlisted icons included
- **WHEN** the index module is inspected
- **THEN** it contains only icons from the predefined allowlist (not a full Lucide set dump)

### Requirement: Icon library displayed in a searchable grid
The icon picker SHALL show the library icons in a scrollable grid. A search input SHALL be present and visible at all times above the grid.

#### Scenario: All icons shown when search is empty
- **WHEN** the picker opens and the search input is empty
- **THEN** all curated library icons are visible in the grid

#### Scenario: Search filters by icon name
- **WHEN** the user types into the search input
- **THEN** the grid updates in real time to show only icons whose names contain the search query (case-insensitive substring match)

#### Scenario: Search filters by partial word
- **WHEN** the user types "msg" into the search input
- **THEN** icons whose names contain "msg" are shown (e.g. "message-square" would not match, but an icon named "msg" would)

#### Scenario: Search with no matches shows empty state
- **WHEN** the search query matches no icon names
- **THEN** a "No icons found" message is shown and the grid is empty

#### Scenario: Clearing search restores all icons
- **WHEN** the user clears the search input after filtering
- **THEN** all curated icons are shown again

### Requirement: Search input responds to keyboard input immediately
The icon grid SHALL update on every keystroke without requiring the user to press Enter or click a button.

#### Scenario: Grid updates on keystroke
- **WHEN** the user types a character into the search input
- **THEN** the grid filters within the same event loop tick (synchronous filter, no debounce required for the small curated set)

### Requirement: Selected library icon highlighted
The picker SHALL visually highlight the currently selected library icon and update the selection on click.

#### Scenario: Icon selected on click
- **WHEN** the user clicks an icon in the grid
- **THEN** that icon gains a selected visual state and any previous selection is cleared

#### Scenario: Previously saved library icon pre-selected and visible
- **WHEN** the picker opens and the profile already has `icon.type === 'library'`
- **THEN** the corresponding icon is shown with the selected visual state; if it is outside the viewport the grid SHALL scroll it into view

### Requirement: Library icons rendered as inline SVG in the sidebar
Icons of `type: 'library'` SHALL be rendered as inline SVG (not `<img src="...">`) in the sidebar entry so they inherit CSS `currentColor`.

#### Scenario: SVG inherits active/inactive text colour
- **WHEN** a library icon is rendered in the sidebar
- **THEN** the SVG path uses `currentColor`, so it visually matches the active and inactive states of the profile button without extra CSS rules
