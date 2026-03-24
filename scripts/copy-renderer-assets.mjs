import { copyFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

mkdirSync(join(root, 'dist', 'renderer'), { recursive: true });

copyFileSync(
  join(root, 'src', 'renderer', 'index.html'),
  join(root, 'dist', 'renderer', 'index.html')
);

copyFileSync(
  join(root, 'src', 'renderer', 'styles.css'),
  join(root, 'dist', 'renderer', 'styles.css')
);

copyFileSync(
  join(root, 'src', 'renderer', 'picker.html'),
  join(root, 'dist', 'renderer', 'picker.html')
);

console.log('Renderer assets copied to dist/renderer/');
