## Why

The project currently installs 494 packages despite having very few direct dependencies, because several packages are either unused or bring in disproportionately large dependency trees. Reducing the install footprint lowers maintenance overhead, speeds up installs, and removes unnecessary code from the repository.

## What Changes

- Remove `react-beautiful-dnd` from `dependencies` — it is not imported anywhere in the source code; `drag-drop-wrapper.ts` is a self-contained vanilla TypeScript implementation
- Remove `concurrently` from `devDependencies` — it is installed but not referenced in any npm script
- Replace `eslint` + `@typescript-eslint/eslint-plugin` + `@typescript-eslint/parser` with **Biome** — a single-binary linter/formatter that replaces both ESLint and Prettier with zero transitive dependencies
- Remove `prettier` from `devDependencies` as part of the Biome migration
- Update npm scripts (`lint`, `format`) to use Biome

## Capabilities

### New Capabilities

- `biome-tooling`: Biome replaces ESLint + Prettier as the unified linter and formatter, configured via `biome.json`

### Modified Capabilities

*(none — no spec-level behavior changes)*

## Impact

- `package.json`: remove 4 devDependencies (`concurrently`, `eslint`, `@typescript-eslint/eslint-plugin`, `@typescript-eslint/parser`, `prettier`), remove 1 dependency (`react-beautiful-dnd`), add 1 devDependency (`@biomejs/biome`)
- `package-lock.json`: regenerated; expected to drop from ~494 packages to ~440 or fewer
- npm scripts `lint` and `format` updated to invoke `biome`
- New `biome.json` config file at project root
- `.eslintrc` / eslint config files removed if present
- No changes to application source code or runtime behavior
