#!/usr/bin/env node
'use strict';

/**
 * stagecraft check — render the deck headless and report problems.
 *
 * Usage:
 *   npx stagecraft check [--root .] [--port N] [--wait MS] [--shots DIR] [--channel chrome]
 *
 * Requires (peer): playwright.
 *   npm install --save-dev playwright
 *   npx playwright install chromium
 *
 * Why this exists:
 *   Stagecraft is built so an agent can author a deck — but the agent is
 *   blind: it cannot see what it produced. `check` is the feedback loop.
 *   It serves the deck exactly like presentation mode (a plain static server,
 *   not the edit-mode dev server), walks every slide by stepping through it
 *   like a presenter (exercising every `onStep`), and reports:
 *     - slides that render (almost) nothing            → likely a broken slide
 *     - failed asset loads (>=400: images, fonts, …)   → a wrong/missing path
 *     - console errors and uncaught page errors        → a runtime bug
 *   Optionally it screenshots each slide (--shots DIR) so the agent (or you)
 *   can actually look. Exits non-zero if anything looks broken — wire it into
 *   CI or a pre-publish hook.
 */

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

// --- args ---
const args = process.argv.slice(2);
let rootArg = '.';
let port = 4061;
let waitMs = 900;
let shotsDir = null;
let channel = null; // e.g. 'chrome' — use an installed browser instead of bundled chromium
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--root') rootArg = args[++i];
  else if (args[i] === '--port') port = parseInt(args[++i], 10);
  else if (args[i] === '--wait') waitMs = parseInt(args[++i], 10);
  else if (args[i] === '--shots') shotsDir = args[++i];
  else if (args[i] === '--channel') channel = args[++i];
}
const ROOT = path.resolve(rootArg);

// --- soft-import optional dep ---
async function softImport(name) {
  try { return await import(name); }
  catch (e) {
    console.error(`\n[stagecraft] check requires ${name}.`);
    console.error(`  Install with: npm install --save-dev playwright`);
    console.error(`  Then:         npx playwright install chromium`);
    process.exit(1);
  }
}
const { chromium } = await softImport('playwright');

// --- serve the deck statically, exactly like presentation mode ---
const MIME = {
  '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript',
  '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif',
  '.webp': 'image/webp', '.ico': 'image/x-icon',
  '.woff2': 'font/woff2', '.woff': 'font/woff', '.ttf': 'font/ttf',
  '.mp4': 'video/mp4', '.webm': 'video/webm', '.mp3': 'audio/mpeg'
};
const server = http.createServer((req, res) => {
  let p = decodeURIComponent((req.url || '/').split('?')[0]);
  if (p === '/') p = '/index.html';
  const f = path.join(ROOT, p);
  if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) {
    res.writeHead(404); return res.end('not found');
  }
  res.writeHead(200, { 'Content-Type': MIME[path.extname(f).toLowerCase()] || 'application/octet-stream' });
  fs.createReadStream(f).pipe(res);
});
await new Promise((resolve, reject) => {
  server.on('error', reject);
  server.listen(port, () => { console.log(`[stagecraft] serving ${ROOT} on :${port}…`); resolve(); });
});
process.on('exit', () => { try { server.close(); } catch (e) { /* ignore */ } });

// --- launch headless browser, collect problems ---
const browser = await chromium.launch(channel ? { channel } : {});
const ctx = await browser.newContext({ viewport: { width: 1600, height: 900 }, deviceScaleFactor: 1 });
const page = await ctx.newPage();

let currentSlide = -1;
const jsErrors = [];   // { kind, text, slide }
const badAssets = [];  // { status, url, slide }
page.on('console', m => { if (m.type() === 'error') jsErrors.push({ kind: 'console', text: m.text(), slide: currentSlide }); });
page.on('pageerror', e => jsErrors.push({ kind: 'pageerror', text: e.message, slide: currentSlide }));
page.on('response', r => { if (r.status() >= 400) badAssets.push({ status: r.status(), url: r.url(), slide: currentSlide }); });

// Load once. `load` waits for the slide <script>s (injected during boot) to finish,
// so the whole manifest is registered before we read it. Fall back if it stalls.
const baseUrl = `http://localhost:${port}/`;
try {
  await page.goto(baseUrl, { waitUntil: 'load', timeout: 30000 });
} catch (e) {
  await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });
}
// Belt and suspenders: wait until the slide count stops growing.
let last = -1, stable = 0;
for (let waited = 0; waited < 12000; waited += 200) {
  await page.waitForTimeout(200);
  const n = await page.evaluate(() => (window.Stage && window.Stage.slides) ? window.Stage.slides.length : 0);
  if (n > 0 && n === last) { if (++stable >= 5) break; } else { stable = 0; }
  last = n;
}
if (last <= 0) {
  console.error(`[stagecraft] no slides registered — is this a stagecraft deck? (looked in ${ROOT})`);
  await browser.close(); server.close(); process.exit(1);
}
const meta = await page.evaluate(() => window.Stage.slides.map(s => ({ title: s.title || '(untitled)', steps: s.steps || 0 })));
console.log(`[stagecraft] walking ${meta.length} slides…`);

// Start the deck (dismiss the welcome overlay) and hide presenter chrome.
await page.keyboard.press('ArrowRight');
await page.waitForTimeout(300);
await page.evaluate(() => document.querySelectorAll('.ui, .welcome').forEach(n => { n.style.display = 'none'; }));

if (shotsDir) fs.mkdirSync(path.resolve(shotsDir), { recursive: true });

// Walk by keypress (no reloads): step through each slide, then advance to the next.
const rows = [];
const emptySlides = [];
for (let i = 0; i < meta.length; i++) {
  currentSlide = i;
  await page.waitForTimeout(waitMs);
  const fin = Math.max(0, meta[i].steps - 1);
  for (let s = 0; s < fin; s++) {
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(Math.min(waitMs, 350));
  }
  const dom = await page.evaluate(() => {
    const st = document.querySelector('#stage');
    return st ? st.innerHTML.replace(/\s+/g, '').length : 0;
  });
  const empty = dom < 40;
  if (empty) emptySlides.push(i);
  rows.push({ i, title: meta[i].title, steps: meta[i].steps, dom, empty });
  if (shotsDir) {
    const slug = (meta[i].title.replace(/[^a-z0-9]+/gi, '-').replace(/^-+|-+$/g, '').toLowerCase().slice(0, 40)) || ('slide' + i);
    await page.screenshot({ path: path.join(path.resolve(shotsDir), String(i).padStart(2, '0') + '-' + slug + '.png') });
  }
  if (i < meta.length - 1) { // advance to next slide (step 0)
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(250);
  }
}

// --- report ---
console.log(`\n=== stagecraft check · ${meta.length} slides ===`);
for (const r of rows) {
  console.log(`  #${String(r.i).padStart(2, '0')}  steps=${r.steps}  dom=${String(r.dom).padStart(5)}  ${r.title}${r.empty ? '   ✗ EMPTY' : ''}`);
}

// Filter the benign edit-mode websocket probe (the bundle pings ws://…/stagecraft,
// which 404s in presentation/static mode) and the redundant generic resource-load
// console line (real asset failures are still caught below, with their URL).
const isNoise = t => /(\/stagecraft\b|WebSocket connection|Failed to load resource)/i.test(t);
const assets = dedupe(badAssets.filter(b => !/\/stagecraft\b/.test(b.url)).map(b => ({ slide: b.slide, text: `${b.status} ${shorten(b.url)}` })));
const errs = dedupe(jsErrors.filter(e => !(e.kind === 'console' && isNoise(e.text))));

console.log(`\nEmpty slides : ${emptySlides.length ? emptySlides.map(i => '#' + i).join(', ') : 'none'}`);
console.log(`Asset errors : ${assets.length ? '' : 'none'}`);
assets.forEach(a => console.log(`  ✗ slide #${a.slide}: ${a.text}`));
console.log(`JS errors    : ${errs.length ? '' : 'none'}`);
errs.forEach(e => console.log(`  ✗ slide #${e.slide} [${e.kind}]: ${shorten(e.text, 140)}`));

const problems = emptySlides.length + assets.length + errs.length;
console.log(`\n${problems === 0 ? '✓ no problems found' : '✗ ' + problems + ' problem(s) found'}`);

await browser.close();
server.close();
process.exit(problems > 0 ? 1 : 0);

// --- helpers ---
function shorten(s, n = 100) { s = String(s); return s.length > n ? s.slice(0, n) + '…' : s; }
function dedupe(arr) {
  const seen = new Set();
  return arr.filter(x => { const k = x.slide + '|' + x.text; if (seen.has(k)) return false; seen.add(k); return true; });
}
