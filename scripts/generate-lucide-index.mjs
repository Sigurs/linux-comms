#!/usr/bin/env node
/**
 * Generates src/renderer/lucide-index.ts from a curated subset of lucide-static icons.
 * Run before building the renderer.
 */

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const ICONS_DIR = join(ROOT, 'node_modules', 'lucide-static', 'icons');
const OUT = join(ROOT, 'src', 'renderer', 'lucide-index.ts');

// Curated allowlist — communication, app, and UI icons
const ALLOWLIST = [
  // Messaging / chat
  'message-circle',
  'message-circle-more',
  'message-circle-reply',
  'message-square',
  'message-square-more',
  'message-square-text',
  'message-square-reply',
  'messages-square',
  'bot-message-square',
  'speech',
  'bubbles',

  // Phone / video / audio
  'phone',
  'phone-call',
  'phone-incoming',
  'phone-outgoing',
  'phone-missed',
  'phone-off',
  'video',
  'video-off',
  'mic',
  'mic-off',
  'headphones',
  'speaker',
  'volume-2',
  'voicemail',
  'radio',
  'radio-tower',

  // Mail / inbox
  'mail',
  'mail-open',
  'mail-plus',
  'mailbox',
  'inbox',
  'send',
  'send-horizontal',
  'rss',

  // Bell / notifications
  'bell',
  'bell-ring',
  'bell-dot',
  'bell-off',
  'megaphone',

  // Users / people
  'user',
  'user-round',
  'users',
  'users-round',
  'user-plus',
  'user-round-plus',
  'user-check',
  'circle-user-round',
  'smile',

  // Collaboration / work
  'share',
  'share-2',
  'globe',
  'wifi',
  'at-sign',
  'hash',
  'link',
  'link-2',
  'bookmark',
  'star',
  'heart',

  // Building / org
  'building',
  'building-2',
  'briefcase',
  'laptop',
  'laptop-minimal',
  'monitor',
  'smartphone',
  'tablet',
  'keyboard',
  'server',

  // Settings / admin
  'settings',
  'settings-2',
  'cog',
  'sliders',
  'sliders-horizontal',
  'wrench',
  'shield',
  'shield-check',
  'lock',
  'key',

  // Navigation / layout
  'home',
  'layout-dashboard',
  'sidebar',
  'panel-left',
  'grid',
  'layers',
  'menu',
  'search',

  // Status / misc
  'zap',
  'rocket',
  'satellite-dish',
  'cloud',
  'cloud-upload',
  'refresh-cw',
  'check-circle',
  'circle-alert',
  'info',
  'help-circle',
  'flag',
  'tag',
  'calendar',
  'clock',
];

const entries = {};
const missing = [];

for (const name of ALLOWLIST) {
  const filePath = join(ICONS_DIR, `${name}.svg`);
  try {
    let svg = readFileSync(filePath, 'utf-8').trim();
    // Normalise: ensure currentColor for theming, remove XML declaration if any
    svg = svg.replace(/<\?xml[^>]*\?>/g, '').trim();
    // Make strokes use currentColor so CSS colour applies
    svg = svg.replace(/stroke="(?!none)[^"]*"/g, 'stroke="currentColor"');
    entries[name] = svg;
  } catch {
    missing.push(name);
  }
}

if (missing.length > 0) {
  console.warn(`[generate-lucide-index] Missing icons (skipped): ${missing.join(', ')}`);
}

const lines = [
  '// AUTO-GENERATED — do not edit by hand. Run scripts/generate-lucide-index.mjs to regenerate.',
  `// ${Object.keys(entries).length} icons bundled from lucide-static.`,
  'const lucideIndex: Record<string, string> = {',
  ...Object.entries(entries).map(([name, svg]) => {
    const escaped = svg.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$\{/g, '\\${');
    return `  ${JSON.stringify(name)}: \`${escaped}\`,`;
  }),
  '};',
  'export default lucideIndex;',
];

writeFileSync(OUT, lines.join('\n') + '\n', 'utf-8');
console.log(`[generate-lucide-index] Wrote ${Object.keys(entries).length} icons to ${OUT}`);
