// Patches the Expo web static export so the entry bundle is loaded as an ES
// module. Without `type="module"`, the bundle throws
// "Uncaught SyntaxError: Cannot use 'import.meta' outside a module" at runtime
// (some dependencies emit import.meta), leaving a blank white screen.
//
// Usage (after `expo export --platform web`):
//   node fix-web-index.mjs [distDir]
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const dist = process.argv[2] || 'dist';
const file = join(dist, 'index.html');

try {
  let html = readFileSync(file, 'utf8');
  const before = html;
  // Add type="module" to every entry bundle <script> tag (safe & idempotent).
  html = html.replace(/<script(?!\s+type=["']module["'])([^>]*)src="([^"]+\.js)"([^>]*)><\/script>/gi, (m, pre, src, post) => {
    if (/\.js"/.test(src)) {
      return `<script type="module" ${pre} src="${src}" ${post}></script>`.replace(/\s{2,}/g, ' ');
    }
    return m;
  });
  // Fallback: ensure any script WITHOUT type gets it (simple + safe).
  html = html.replace(/<script(?!\s+type=["']module["'])\s+src="([^"]+\.js)"/g, '<script type="module" src="$1"');
  if (html === before) {
    console.log('fix-web-index: no entry script tag found to patch (already OK or no matches).');
  } else {
    writeFileSync(file, html, 'utf8');
    console.log('fix-web-index: patched ' + file);
  }
} catch (e) {
  console.error('fix-web-index: ' + e.message);
  process.exit(1);
}
