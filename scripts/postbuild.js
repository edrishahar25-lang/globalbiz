/* eslint-disable */
// Post-process dist/ after `expo export --platform web` to:
// 1) Inject Heebo from Google Fonts CDN + CSS overrides into index.html
//    (Mirrors what app/+html.tsx tries to do, in case Expo Router doesn't
//    pick it up during static export.)
// 2) Strip unused .ttf font files (we load Heebo via CDN on web).
//
// This script is idempotent — safe to run multiple times.

const fs = require('fs');
const path = require('path');

const DIST = path.join(__dirname, '..', 'dist');
const INDEX = path.join(DIST, 'index.html');

if (!fs.existsSync(INDEX)) {
  console.error('[postbuild] dist/index.html not found — did expo export run?');
  process.exit(1);
}

// ---- 1) Inject Heebo CDN + style overrides ----
const FONT_INJECT = `<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Heebo:wght@400;500;700;900&display=swap" rel="stylesheet">
<style>
  html, body, #root { background-color: #0a0612; }
  body { font-family: 'Heebo', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
  [style*="Heebo_400Regular"] { font-family: 'Heebo' !important; font-weight: 400 !important; }
  [style*="Heebo_500Medium"]  { font-family: 'Heebo' !important; font-weight: 500 !important; }
  [style*="Heebo_700Bold"]    { font-family: 'Heebo' !important; font-weight: 700 !important; }
  [style*="Heebo_900Black"]   { font-family: 'Heebo' !important; font-weight: 900 !important; }
</style>
</head>`;

let html = fs.readFileSync(INDEX, 'utf8');
if (html.includes('fonts.googleapis.com')) {
  console.log('[postbuild] Heebo already injected — skipping inject step');
} else {
  html = html.replace('</head>', FONT_INJECT);
  fs.writeFileSync(INDEX, html);
  console.log('[postbuild] Injected Heebo CDN + CSS overrides into index.html');
}

// ---- 2) Strip .ttf files (Heebo is loaded from CDN on web) ----
function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else out.push(full);
  }
  return out;
}

const ttfs = walk(DIST).filter((p) => p.toLowerCase().endsWith('.ttf'));
for (const f of ttfs) fs.unlinkSync(f);
console.log(`[postbuild] Removed ${ttfs.length} unused .ttf file(s)`);

console.log('[postbuild] Done.');
