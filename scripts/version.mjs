#!/usr/bin/env node
/**
 * CalVer version generator.
 *
 * Display format (renderer): YYMMDD.dev  |  YYMMDD.N
 * Semver format (package.json): YY.MMDD.N  (e.g. 26.326.1 for 2026-03-26 build 1)
 *   MMDD is stored as month*100+day with no leading zeros, so it is valid semver.
 *
 * Flags:
 *   --dev      Print YYMMDD.dev and exit (display string only, no side effects)
 *   --release  Increment daily build counter, print semver YY.MMDD.N
 *   --bump     Same as --release, also write semver into package.json
 *   --current  Print current version from package.json (no side effects)
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const COUNTER_FILE = join(ROOT, '.build-counter.json');
const PACKAGE_FILE = join(ROOT, 'package.json');

function utcParts() {
  const now = new Date();
  const yy = String(now.getUTCFullYear()).slice(-2);
  const mm = now.getUTCMonth() + 1;           // 1-12, no padding
  const dd = now.getUTCDate();                 // 1-31, no padding
  const mmdd = String(mm * 100 + dd);          // e.g. 326, 105, 1231 — no leading zeros
  const yymmdd = `${yy}${String(mm).padStart(2,'0')}${String(dd).padStart(2,'0')}`;
  return { yy, mmdd, yymmdd };
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
  const { yy, mmdd } = utcParts();
  process.stdout.write(`${yy}.${mmdd}.dev\n`);
  process.exit(0);
}

if (flag === '--current') {
  const pkg = JSON.parse(readFileSync(PACKAGE_FILE, 'utf8'));
  process.stdout.write(`${pkg.version}\n`);
  process.exit(0);
}

if (flag === '--release' || flag === '--bump') {
  const { yy, mmdd, yymmdd } = utcParts();
  const today = yymmdd;                        // used as the date key in counter
  const state = readCounter();
  const count = state.date === today ? state.count + 1 : 1;
  writeCounter({ date: today, count });

  const semver = `${yy}.${mmdd}.${count}`;    // e.g. 26.326.1 — valid semver

  if (flag === '--bump') {
    const pkg = JSON.parse(readFileSync(PACKAGE_FILE, 'utf8'));
    pkg.version = semver;
    writeFileSync(PACKAGE_FILE, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
  }

  process.stdout.write(`${semver}\n`);
  process.exit(0);
}

console.error('Usage: version.mjs --dev | --release | --bump | --current');
process.exit(1);
