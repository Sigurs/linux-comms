## ADDED Requirements

### Requirement: Opt-in debug logging for link opening across all providers
The shell SHALL support a debug mode for link opening, activated by launching with the `--debug` CLI flag. In debug mode the shell SHALL log the full link-open flow to stdout with a `[link-open]` prefix (main process) or `[link]` prefix (renderer injected script). Logs SHALL include enough detail to identify the provider (e.g. `rocketchat`, `teams`), the interception layer, the URL scheme, and the decision made at each step. The shell SHALL NOT alter any user-visible behaviour.

#### Scenario: Debug mode off by default
- **WHEN** the app starts without the `--debug` flag
- **THEN** no additional link-open debug lines SHALL appear in stdout beyond the existing unconditional lines

#### Scenario: Anchor click intercepted — log includes provider and page context
- **WHEN** the `--debug` flag is set
- **AND** a `target="_blank"` anchor click is intercepted in the webview injected script
- **THEN** the renderer SHALL log: source=`anchor`, `providerId`, `profile.name`, destination URL, URL scheme, and `location.href` of the current page

#### Scenario: window.open intercepted — log includes provider and features
- **WHEN** the `--debug` flag is set
- **AND** `window.open(url, target, features)` is called from within a webview
- **THEN** the renderer SHALL log: source=`window.open`, `providerId`, `profile.name`, URL, URL scheme, `target`, and `features` string

#### Scenario: will-navigate event — log includes same-origin check and trusted-domain result
- **WHEN** the `--debug` flag is set
- **AND** a `will-navigate` event fires on a webview
- **THEN** the renderer SHALL log: source=`will-navigate`, `providerId`, `profile.name`, destination URL, URL scheme, whether the destination is same-origin, and if not same-origin whether it matched a trusted domain (including which pattern matched or "no match")

#### Scenario: new-window event intercepted — log includes provider
- **WHEN** the `--debug` flag is set
- **AND** a `new-window` event fires on a webview
- **THEN** the renderer SHALL log: source=`new-window`, `providerId`, `profile.name`, URL, URL scheme

#### Scenario: Duplicate dialog discarded — log includes provider
- **WHEN** the `--debug` flag is set
- **AND** a link-open request arrives while a dialog is already open
- **THEN** the main process SHALL log: `[link-open]` discarded, URL, `profileId`, `profile.name`, `providerId`

#### Scenario: Link-open dialog shown — log includes profile and provider
- **WHEN** the `--debug` flag is set
- **AND** `showLinkOpenDialog` is entered (dialog not already open)
- **THEN** the main process SHALL log: URL, URL scheme, `profileId`, `profile.name`, `providerId`, `partition`

#### Scenario: Trusted-domain check result logged
- **WHEN** the `--debug` flag is set
- **AND** the link-open IPC handler checks trusted domains for the profile's provider
- **THEN** the main process SHALL log whether the URL matched a trusted domain and which pattern matched, or "no trusted domains configured" if the provider has none

#### Scenario: User choice logged with action detail
- **WHEN** the `--debug` flag is set
- **AND** the user makes a choice in the link-open dialog
- **THEN** the main process SHALL log the numeric response index and its resolved action name (`browser` / `popup` / `cancel`)

#### Scenario: shell.openExternal dispatch logged
- **WHEN** the `--debug` flag is set
- **AND** `shell.openExternal(url)` is called (either from dialog choice or profile-missing fallback)
- **THEN** the main process SHALL log: `[link-open]` opening in browser, URL

#### Scenario: URL rejected by SHELL_OPEN_EXTERNAL scheme guard
- **WHEN** the `--debug` flag is set
- **AND** `SHELL_OPEN_EXTERNAL` IPC is invoked with a non-http/https URL
- **THEN** the main process SHALL log: `[link-open]` shell:open-external rejected non-http URL, the full URL, and its scheme

#### Scenario: Popout window.open intercepted — log includes provider
- **WHEN** the `--debug` flag is set
- **AND** a link is intercepted in a popped-out provider window via `setWindowOpenHandler`
- **THEN** the main process SHALL log: source=`popout:window-open`, `profileId`, `profile.name`, `providerId`, URL, URL scheme

#### Scenario: Popout will-navigate intercepted — log includes trusted-domain result
- **WHEN** the `--debug` flag is set
- **AND** a `will-navigate` event fires in a popped-out window for an external URL
- **THEN** the main process SHALL log: source=`popout:will-navigate`, `profileId`, `profile.name`, `providerId`, URL, URL scheme, same-origin result, trusted-domain match result
