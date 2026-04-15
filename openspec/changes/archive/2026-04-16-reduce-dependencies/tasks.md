## 1. Remove Unused Dependencies

- [x] 1.1 Uninstall `react-beautiful-dnd` from dependencies: `npm uninstall react-beautiful-dnd`
- [x] 1.2 Uninstall `concurrently` from devDependencies: `npm uninstall concurrently`

## 2. Replace ESLint + Prettier with Biome

- [x] 2.1 Uninstall ESLint and Prettier packages: `npm uninstall eslint @typescript-eslint/eslint-plugin @typescript-eslint/parser prettier`
- [x] 2.2 Install Biome: `npm install --save-dev @biomejs/biome`
- [x] 2.3 Initialize Biome config: `npx @biomejs/biome init` (creates `biome.json`)
- [x] 2.4 Configure `biome.json`: set indentation (tabs/spaces), quote style, and enable recommended TypeScript rules
- [x] 2.5 Update `lint` script in `package.json` to: `biome check src/`
- [x] 2.6 Update `format` script in `package.json` to: `biome format --write src/`

## 3. Fix Any Lint or Format Issues

- [x] 3.1 Run `npx biome check --write src/` to auto-fix lint violations
- [x] 3.2 Run `npx biome format --write src/` to normalize formatting across all source files
- [x] 3.3 Review any remaining manual lint errors and resolve them

## 4. Verify

- [x] 4.1 Run `npm run lint` and confirm it exits cleanly
- [x] 4.2 Run `npm run format` and confirm no unexpected changes remain
- [x] 4.3 Run `npm run build` and confirm the build succeeds
- [x] 4.4 Confirm package count has decreased from ~494 by running `cat package-lock.json | python3 -c "import json,sys; d=json.load(sys.stdin); print(len(d.get('packages', {})))"` (result: 413)
