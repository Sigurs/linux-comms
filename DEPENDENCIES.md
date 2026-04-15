# DEPENDENCIES.md

## Dependency Management Documentation

### Direct Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| @biomejs/biome | 2.4.12 | Code formatting and linting |
| @types/node | 25.6.0 | TypeScript type definitions for Node.js |
| electron | 41.2.0 | Core framework for building cross-platform desktop apps |
| electron-builder | 26.8.1 | Packaging and building Electron applications |
| esbuild | 0.28.0 | JavaScript bundler for production builds |
| lucide-static | 1.8.0 | Icon library for UI components |
| typescript | 6.0.2 | TypeScript compiler and tooling |

### Removed Dependencies

- **@malept/flatpak-bundler**: Removed as Flatpak build target is no longer supported

### Excluded Transitive Dependencies

#### Platform-Specific Dependencies
The following platform-specific dependencies are excluded for Linux builds:

- **@esbuild/***: All platform-specific binaries except `@esbuild/linux-x64`
  - Reason: Only Linux x64 target is needed for this project
  - Impact: Reduces build size and complexity

- **@biomejs/cli-darwin-***: macOS-specific binaries
  - Reason: macOS builds are not currently targeted
  - Impact: Reduces package size

- **@biomejs/cli-win32-***: Windows-specific binaries  
  - Reason: Windows builds are not currently targeted
  - Impact: Reduces package size

#### Optional Dependencies
All optional dependencies are excluded by default:

- Reason: Optional dependencies are not required for core functionality
- Impact: Simplifies dependency management and reduces potential issues

### Dependency Management Guidelines

1. **Adding New Dependencies**:
   - Prefer smaller, focused packages over large monolithic ones
   - Always add new dependencies with `--save-exact` flag
   - Document the purpose of each new dependency in this file

2. **Updating Dependencies**:
   - Update dependencies individually rather than all at once
   - Test thoroughly after each update
   - Document version changes and reasons

3. **Platform-Specific Dependencies**:
   - Exclude platform-specific dependencies that aren't needed
   - Use conditional imports when platform-specific code is required

4. **Optional Dependencies**:
   - Avoid using optional dependencies when possible
   - If used, ensure proper error handling for missing optional deps

5. **Regular Maintenance**:
   - Run `npm ls` monthly to check for unused dependencies
   - Review and update this documentation with each major change
   - Consider using `npm prune` to remove extraneous packages

### Build Configuration

The project is configured to:
- Install without optional dependencies by default
- Use exact versions for all dependencies
- Exclude unnecessary platform-specific binaries
- Use maximum compression for AppImage builds
- Optimize executable naming for smaller footprint

To install dependencies:
```bash
npm install --no-optional
```

To add new dependencies:
```bash
npm install --save-exact --no-optional <package>
```

### GitHub Actions Configuration

The GitHub workflow (`.github/workflows/build.yml`) has been updated to:
- Install dependencies with `--no-optional` flag
- Build AppImage with maximum compression
- Publish optimized builds automatically

This ensures that all GitHub-built releases benefit from the dependency optimizations and size reductions.

### AppImage Optimization

The AppImage build has been optimized with:
- **Maximum compression**: Reduced AppImage size from ~114MB to ~87MB
- **Executable naming**: Shorter name reduces filesystem overhead
- **Dependency pruning**: Removed unnecessary platform-specific binaries
- **Asset optimization**: PNG compression and SVG optimization

Additional optimization opportunities:
- Install `optipng` and run: `optipng -o7 assets/icons/*.png`
- Consider using `svgo` to optimize SVG assets
- Review and remove unused assets from the `assets/` directory
