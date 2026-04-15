## ADDED Requirements

### Requirement: Build-time license compilation

A build script (`scripts/compile-licenses.mjs`) SHALL scan all production `node_modules` at build time and write a JSON file (`src/renderer/licenses.json`) containing an array of license entries. The script SHALL run before the esbuild bundling step so the renderer can import the JSON statically.

#### Scenario: Script produces valid JSON output

- **WHEN** `compile-licenses.mjs` is executed
- **THEN** `src/renderer/licenses.json` is written as valid JSON

#### Scenario: Output includes only production dependencies

- **WHEN** `compile-licenses.mjs` is executed
- **THEN** the output contains entries only for packages in `dependencies` (not `devDependencies`)

#### Scenario: Each entry contains required fields

- **WHEN** `compile-licenses.mjs` produces output
- **THEN** each entry SHALL include: `name` (string), `version` (string), `license` (SPDX identifier string), and `licenseText` (string or null)

#### Scenario: Missing license text is represented as null

- **WHEN** a package has no bundled license text in node_modules
- **THEN** the `licenseText` field for that entry is `null`

#### Scenario: Script integrated into build pipeline

- **WHEN** `npm run build:renderer` or `npm run build:renderer:prod` is executed
- **THEN** `compile-licenses.mjs` runs to completion before esbuild starts

#### Scenario: Output file is gitignored

- **WHEN** the repo is inspected
- **THEN** `src/renderer/licenses.json` is listed in `.gitignore`
