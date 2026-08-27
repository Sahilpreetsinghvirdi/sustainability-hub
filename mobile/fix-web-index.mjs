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

  const SHIM = `<script>
if (typeof window !== 'undefined' && !window.process) {
  var __proc = { env: {} };
  __proc.env.NODE_ENV = 'production';
  __proc.env.EXPO_PUBLIC_APP_ENV = 'production';
  __proc.nextTick = function (cb) { setTimeout(cb, 0); };
  __proc.browser = true;
  __proc.argv = [];
  __proc.platform = 'browser';
  window.process = __proc;
}
if (typeof window !== 'undefined' && window.__METRO_GLOBAL_PREFIX__ === undefined) {
  window.__METRO_GLOBAL_PREFIX__ = '';
}
</script>`;

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
    // Inject a `process` global shim BEFORE the app bundles. Some bundled deps
    // (e.g. react-native-reanimated) read `process.env.NODE_ENV` at module-eval
    // time; Metro's web export doesn't always inject a `process` polyfill, so
    // without this the bundle throws `ReferenceError: process is not defined`
    // and React never mounts (blank white screen). Idempotent guard below.
    if (!html.includes('window.process')) {
      html = html.replace(/<\/head>/i, SHIM + '\n  </head>');
    }
    if (!html.includes('__METRO_GLOBAL_PREFIX__')) {
      const metro = `<script>if (typeof window !== 'undefined' && window.__METRO_GLOBAL_PREFIX__ === undefined) { window.__METRO_GLOBAL_PREFIX__ = ''; }</script>`;
      html = html.replace(/<\/head>/i, metro + '\n  </head>');
    }
    // Cache-bust: force browsers to fetch fresh JS on every deploy
    const v = Date.now().toString(36);
    html = html.replace(/(src="[^"]+\.js)(")/g, `$1?v=${v}$2`);
    if (!html.includes('no-cache')) {
      html = html.replace(/<\/head>/i, `<meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate" />\n  <meta http-equiv="Pragma" content="no-cache" />\n  </head>`);
    }
    if (html === before) {
      console.log('fix-web-index: no entry script tag found to patch (already OK or no matches).');
    } else {
      writeFileSync(file, html, 'utf8');
      console.log('fix-web-index: patched ' + file + ' v=' + v);
    }
  } catch (e) {
  console.error('fix-web-index: ' + e.message);
  process.exit(1);
}
