#!/usr/bin/env node
/**
 * CalVer version generator: YYMMDD.<N> for releases, YYMMDD.dev for local dev.
 *
 * Flags:
 *   --dev      Print YYMMDD.dev and exit (no side effects)
 *   --release  Increment daily build counter, print YYMMDD.N
 *   --bump     Same as --release, also write version into package.json
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const COUNTER_FILE = join(ROOT, '.build-counter.json');
const PACKAGE_FILE = join(ROOT, 'package.json');

function utcDate() {
  const now = new Date();
  const yy = String(now.getUTCFullYear()).slice(-2);
  const mm = String(now.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(now.getUTCDate()).padStart(2, '0');
  return `${yy}${mm}${dd}`;
}

function readCounter() {
  if (!existsSync(COUNTER_FILE)) return { date: '', count: 0 };
  return JSON.parse(readFileSync(COUNTER_FILE, 'utf8'));
}

function writeCounter(state) {
  writeFileSync(COUNTER_FILE, JSON.stringify(state, null, 2) + '\n', 'utf8');
}

const flag = process.argv[2];

if (flag === '--dev') {
  process.stdout.write(`${utcDate()}.dev\n`);
  process.exit(0);
}

if (flag === '--release' || flag === '--bump') {
  const today = utcDate();
  const state = readCounter();
  const count = state.date === today ? state.count + 1 : 1;
  writeCounter({ date: today, count });

  const version = `${today}.${count}`;

  if (flag === '--bump') {
    const pkg = JSON.parse(readFileSync(PACKAGE_FILE, 'utf8'));
    pkg.version = version;
    writeFileSync(PACKAGE_FILE, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
  }

  process.stdout.write(`${version}\n`);
  process.exit(0);
}

console.error('Usage: version.mjs --dev | --release | --bump');
process.exit(1);
