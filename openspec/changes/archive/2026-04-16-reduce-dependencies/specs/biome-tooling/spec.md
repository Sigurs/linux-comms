## ADDED Requirements

### Requirement: Biome replaces ESLint and Prettier
The project SHALL use `@biomejs/biome` as the single tool for linting and formatting TypeScript source files, replacing `eslint`, `@typescript-eslint/eslint-plugin`, `@typescript-eslint/parser`, and `prettier`.

#### Scenario: Lint check passes
- **WHEN** developer runs `npm run lint`
- **THEN** Biome checks `src/` for lint errors and exits with code 0 when no errors are found

#### Scenario: Lint check fails on violations
- **WHEN** developer runs `npm run lint` and the source contains lint violations
- **THEN** Biome reports the violations with file paths and exits with a non-zero code

#### Scenario: Format writes changes
- **WHEN** developer runs `npm run format`
- **THEN** Biome formats all files under `src/` in place and exits with code 0

### Requirement: Biome configuration file present
The project SHALL include a `biome.json` at the repository root that configures linting rules and formatting options consistent with the project's existing TypeScript conventions.

#### Scenario: Config file exists
- **WHEN** the repository is cloned and `npm install` is run
- **THEN** `biome.json` is present at the project root

#### Scenario: TypeScript files are in scope
- **WHEN** Biome is invoked on `src/`
- **THEN** all `.ts` files are checked according to the rules in `biome.json`
