## Context

The project has 494 installed packages despite having only 12 direct dependencies. Investigation revealed:

- `react-beautiful-dnd` (runtime dep) is not imported in any source file — `drag-drop-wrapper.ts` is a standalone vanilla TS implementation. This single package pulls in React, ReactDOM, react-redux, redux, @babel/runtime, and ~10 more packages (~16 total).
- `concurrently` (devDep) is installed but not referenced in any npm script.
- `eslint` + `@typescript-eslint/eslint-plugin` + `@typescript-eslint/parser` together account for 24 packages. `prettier` adds 1 more.
- All other packages (electron, electron-builder, esbuild, typescript, lucide-static, @types/node) are actively used and cannot be easily removed.

## Goals / Non-Goals

**Goals:**
- Remove packages that are definitively unused (`react-beautiful-dnd`, `concurrently`)
- Replace the ESLint + Prettier toolchain (25 packages) with Biome (1 package, single binary)
- Maintain equivalent linting coverage for TypeScript
- Keep the same `npm run lint` and `npm run format` developer workflow

**Non-Goals:**
- Changing any application source code or runtime behavior
- Removing electron or electron-builder (required for build/distribution)
- Eliminating esbuild platform-specific optional binaries (managed by npm automatically)

## Decisions

### 1. Remove `react-beautiful-dnd` as a runtime dependency

`drag-drop-wrapper.ts` contains a comment saying it's "a placeholder for the react-beautiful-dnd integration" but the class is fully self-contained with no imports from the library. The package serves no purpose.

**Alternative considered**: Keep it for future use. Rejected — unused deps silently accumulate and can introduce security vulnerabilities. If drag-drop ever needs a library, it can be re-added then.

### 2. Replace ESLint + Prettier with Biome

Biome is a Rust-based tool that covers both linting and formatting in a single binary (`@biomejs/biome`). It ships with built-in TypeScript support and requires no parser plugins or additional packages.

**Alternative considered**: Keep ESLint and add `eslint-config-prettier` to suppress conflicts. Rejected — this adds a package rather than removing them.

**Alternative considered**: Remove linting/formatting tools entirely. Rejected — code quality tooling has real value; the goal is to reduce count, not eliminate tooling.

**Biome TypeScript coverage**: Biome supports TypeScript natively. Its rule set covers the most common `@typescript-eslint` rules. Any gaps can be configured in `biome.json`.

### 3. Remove `concurrently`

Not referenced in any npm script. No value.

## Risks / Trade-offs

- **Biome rule differences** → Some ESLint rules may not have exact Biome equivalents. Mitigation: audit `biome.json` after migration; accept minor rule-set differences as acceptable churn.
- **Biome formatter vs Prettier** → Biome's formatter is intentionally Prettier-compatible but not identical. Mitigation: run `biome format --write` once to normalize the codebase as part of the migration commit; no ongoing diff noise.
- **Future React usage** → If the project ever adopts React, `react` and related deps will need to be added back. Mitigation: none needed — they're straightforward to add.

## Migration Plan

1. Uninstall removed packages: `npm uninstall react-beautiful-dnd concurrently eslint @typescript-eslint/eslint-plugin @typescript-eslint/parser prettier`
2. Install Biome: `npm install --save-dev @biomejs/biome`
3. Initialize Biome config: `npx @biomejs/biome init` → produces `biome.json`
4. Update `biome.json` to match project conventions (indent style, quote style, etc.)
5. Update `package.json` scripts: `lint` → `biome check src/`, `format` → `biome format --write src/`
6. Run `biome check --apply src/` to auto-fix any lint issues
7. Run `biome format --write src/` to normalize formatting
8. Verify build still works: `npm run build`

**Rollback**: Revert `package.json` changes and re-run `npm install`. No source changes are made, so rollback is trivial.

## Open Questions

- Should `biome check` run in CI? (Currently no CI lint step is defined in npm scripts — out of scope for this change.)
