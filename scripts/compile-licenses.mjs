#!/usr/bin/env node
/**
 * compile-licenses.mjs
 * Walks all production dependencies (including transitive) and collects
 * license metadata. Writes src/renderer/licenses.json at build time so
 * the renderer can import it statically without any runtime scanning.
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, resolve } from 'path';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const root = resolve(__dirname, '..');
const require = createRequire(import.meta.url);

/** Candidate filenames for license text, in priority order */
const LICENSE_FILES = [
  'LICENSE',
  'LICENSE.md',
  'LICENSE.txt',
  'LICENSE.rst',
  'license',
  'license.md',
  'license.txt',
  'LICENCE',
  'LICENCE.md',
  'LICENCE.txt',
  'COPYING',
];

function readLicenseText(pkgDir) {
  for (const name of LICENSE_FILES) {
    const candidate = join(pkgDir, name);
    if (existsSync(candidate)) {
      return readFileSync(candidate, 'utf8').trim();
    }
  }
  return null;
}

/**
 * Recursively collect all dep names from an npm dependency tree node.
 * `npm list --prod --json` nests transitive deps under each parent.
 */
function collectNames(node, out = new Set()) {
  if (!node.dependencies) return out;
  for (const [name, child] of Object.entries(node.dependencies)) {
    out.add(name);
    collectNames(child, out);
  }
  return out;
}

// Collect all packages from package-lock.json regardless of dev/prod distinction.
// For an Electron app this is the right call — electron ships, lucide-static ships, etc.
const lockPath = join(root, 'package-lock.json');
let allDepNames;

if (existsSync(lockPath)) {
  const lock = JSON.parse(readFileSync(lockPath, 'utf8'));
  const pkgSection = lock.packages ?? {};
  allDepNames = new Set();
  for (const key of Object.keys(pkgSection)) {
    if (!key) continue; // root entry ("")
    // key is like "node_modules/foo" or "node_modules/foo/node_modules/bar"
    const parts = key.replace(/^node_modules\//, '').split('/node_modules/');
    allDepNames.add(parts[parts.length - 1]);
  }
} else {
  // Fallback: read all declared deps from package.json
  const rootPkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
  allDepNames = new Set([
    ...Object.keys(rootPkg.dependencies ?? {}),
    ...Object.keys(rootPkg.devDependencies ?? {}),
  ]);
}

const entries = [];

for (const name of [...allDepNames].sort()) {
  let pkgDir;
  try {
    // resolve the package.json for this dep
    const pkgJsonPath = require.resolve(`${name}/package.json`, { paths: [root] });
    pkgDir = join(pkgJsonPath, '..');
  } catch {
    // Some packages don't expose package.json in exports — fall back to path guess
    pkgDir = join(root, 'node_modules', name);
    if (!existsSync(pkgDir)) continue;
  }

  let meta;
  try {
    meta = JSON.parse(readFileSync(join(pkgDir, 'package.json'), 'utf8'));
  } catch {
    continue;
  }

  const license =
    typeof meta.license === 'string'
      ? meta.license
      : typeof meta.license === 'object' && meta.license?.type
        ? meta.license.type
        : Array.isArray(meta.licenses)
          ? meta.licenses.map((l) => l.type ?? l).join(' OR ')
          : 'Unknown';

  entries.push({
    name: meta.name ?? name,
    version: meta.version ?? '',
    license,
    licenseText: readLicenseText(pkgDir),
  });
}

const outPath = join(root, 'src', 'renderer', 'licenses.json');
writeFileSync(outPath, JSON.stringify(entries, null, 2));
console.log(`[compile-licenses] wrote ${entries.length} entries → ${outPath}`);
