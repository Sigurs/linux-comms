## ADDED Requirements

### Requirement: Picker displays options in priority order
The icon picker SHALL present icon choices in the following fixed order: (1) Company Logo section, (2) Icon Library section. The provider emoji is the implicit fallback when no icon is saved and is not shown as a picker option.

#### Scenario: Company logo available
- **WHEN** the picker opens and a company logo was detected for the profile
- **THEN** the Company Logo section appears first, is pre-selected, and the Icon Library appears below it

#### Scenario: Company logo unavailable
- **WHEN** the picker opens and no company logo was detected
- **THEN** the Company Logo section is hidden and the Icon Library is shown as the only section, with the first icon pre-selected

#### Scenario: Previously saved icon respected regardless of priority
- **WHEN** the picker opens and the profile already has a saved icon (either `server` or `library` type)
- **THEN** that saved icon is pre-selected, regardless of section order

### Requirement: RocketChat server branding icon detected and shown
For RocketChat profiles the picker SHALL attempt to load `{profile.url}/assets/favicon.png`. If the image loads successfully it SHALL be displayed in the Company Logo section.

#### Scenario: RocketChat favicon available
- **WHEN** the picker opens for a RocketChat profile and `{serverUrl}/assets/favicon.png` responds with an image
- **THEN** the Company Logo section shows that image as a selectable option

#### Scenario: RocketChat favicon unavailable
- **WHEN** the picker opens for a RocketChat profile and the favicon URL fails to load
- **THEN** the Company Logo section is hidden

### Requirement: Teams organisation logo extracted via DOM injection
For Teams profiles the app SHALL inject a DOM observer script into the webview after login and relay the discovered organisation logo URL to the renderer via the `__linuxComms` IPC bridge.

#### Scenario: Teams org logo found in DOM
- **WHEN** the Teams webview has authenticated and the DOM observer finds an org logo element
- **THEN** the logo URL is sent via `window.__linuxComms.reportOrgLogo(url)` and cached by the renderer for that profile

#### Scenario: Teams org logo not found within timeout
- **WHEN** the Teams webview has authenticated but no org logo element is found within the observer timeout (10 s)
- **THEN** no logo is cached and the Company Logo section is hidden in the picker for that profile

#### Scenario: Teams picker shows cached org logo
- **WHEN** the picker opens for a Teams profile and a logo URL was previously cached
- **THEN** the Company Logo section shows the cached logo as a selectable option

### Requirement: Teams DOM observer uses a priority-ordered selector list
The injected Teams observer script SHALL try a list of selectors in priority order to locate the org logo `<img>` element, stopping at the first match.

#### Scenario: First selector matches
- **WHEN** the first selector in the list matches an `<img>` element with a non-empty `src`
- **THEN** that element's resolved URL is reported and the observer stops

#### Scenario: Fallback selector used
- **WHEN** earlier selectors produce no match and a later fallback selector matches
- **THEN** the fallback element's resolved URL is reported

#### Scenario: All selectors fail
- **WHEN** no selector in the list matches within the timeout
- **THEN** `reportOrgLogo` is NOT called and the observer cleans itself up

### Requirement: Company logo saved as absolute URL
When the user selects the company logo and confirms, the `icon` field SHALL be saved as `{ type: 'server', value: '<absolute URL>' }`.

#### Scenario: RocketChat logo confirmed
- **WHEN** the user selects the RocketChat server favicon and clicks "Confirm"
- **THEN** the profile's `icon` is stored as `{ type: 'server', value: 'https://example.rocket.chat/assets/favicon.png' }`

#### Scenario: Teams logo confirmed
- **WHEN** the user selects the Teams org logo and clicks "Confirm"
- **THEN** the profile's `icon` is stored as `{ type: 'server', value: '<absolute URL of the detected org logo>' }`

### Requirement: `reportOrgLogo` exposed on the `__linuxComms` bridge
The webview preload SHALL expose a `reportOrgLogo(url: string): void` method on `window.__linuxComms` that calls `ipcRenderer.sendToHost('org-logo-found', url)`.

#### Scenario: Bridge method available after preload injection
- **WHEN** the webview's preload script has run
- **THEN** `window.__linuxComms.reportOrgLogo` is a callable function in the main world
