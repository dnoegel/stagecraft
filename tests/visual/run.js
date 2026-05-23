#!/usr/bin/env node
'use strict';

/**
 * Stagecraft visual regression — minimal harness.
 *
 * Spins up the dev server against the demo deck, navigates Playwright through
 * each slide, screenshots into `tests/visual/snapshots/<NN>-<title>.png`.
 *
 * If `pixelmatch` + `pngjs` are installed, also diffs against
 * `tests/visual/baseline/`. Pixel diffs > threshold cause a non-zero exit and
 * write a `tests/visual/diff/` PNG showing the changes.
 *
 * Without those deps, this is a "save snapshots" tool — commit them and
 * eyeball changes in git diff.
 *
 * Usage:
 *   node tests/visual/run.js [--update-baseline]
 *
 * Requires:
 *   npm install --save-dev playwright
 *   npx playwright install chromium
 *   (optional, for diffing) npm install --save-dev pixelmatch pngjs
 */

import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';
import { spawn } from 'node:child_process';

const HERE = path.dirname(url.fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..', '..');
const SNAP_DIR = path.join(HERE, 'snapshots');
const BASELINE_DIR = path.join(HERE, 'baseline');
const DIFF_DIR = path.join(HERE, 'diff');

const args = process.argv.slice(2);
const updateBaseline = args.includes('--update-baseline');

async function softImport(name) {
  try { return await import(name); }
  catch (e) {
    console.error(`[visual] ${name} not installed.`);
    console.error('  npm install --save-dev playwright');
    console.error('  npx playwright install chromium');
    if (name !== 'playwright') return null;
    process.exit(1);
  }
}

const { chromium } = await softImport('playwright');
const pixelmatchMod = await softImport('pixelmatch').catch(() => null);
const pngjsMod = await softImport('pngjs').catch(() => null);
const haveDiff = pixelmatchMod && pngjsMod;

fs.mkdirSync(SNAP_DIR, { recursive: true });
if (updateBaseline) fs.mkdirSync(BASELINE_DIR, { recursive: true });
fs.mkdirSync(DIFF_DIR, { recursive: true });

const port = 4141;
console.log(`[visual] starting demo server on :${port}…`);
const child = spawn('node', [path.join(ROOT, 'bin', 'serve.js'), '--root', path.join(ROOT, 'demo'), '--port', String(port)], {
  stdio: ['ignore', 'pipe', 'pipe']
});
let ready = false;
child.stdout.on('data', b => { if (b.toString().includes('http://localhost:')) ready = true; });
await waitFor(() => ready, 6000);

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1 });
const page = await ctx.newPage();

await page.goto(`http://localhost:${port}/`);
await page.waitForFunction(() => window.Stage?.slides?.length > 0, { timeout: 10000 });
const slides = await page.evaluate(() => window.Stage.slides.map((s, i) => ({
  idx: i,
  title: (s.title || `slide-${i}`).replace(/[^a-z0-9-]+/gi, '-')
})));

const failures = [];
for (const s of slides) {
  const name = `${String(s.idx).padStart(2, '0')}-${s.title}.png`;
  await page.goto(`http://localhost:${port}/#${s.idx}`);
  await page.evaluate(() => {
    document.querySelectorAll('.ui-hint, .welcome').forEach(n => n.style.display = 'none');
  });
  await page.waitForTimeout(1500);

  const snapPath = path.join(SNAP_DIR, name);
  await page.screenshot({ path: snapPath, fullPage: false });

  if (updateBaseline) {
    fs.copyFileSync(snapPath, path.join(BASELINE_DIR, name));
    console.log(`  baseline ← ${name}`);
    continue;
  }

  const basePath = path.join(BASELINE_DIR, name);
  if (!fs.existsSync(basePath)) {
    console.log(`  ⊘ no baseline for ${name} (re-run with --update-baseline)`);
    continue;
  }

  if (!haveDiff) {
    console.log(`  snap ${name} (no diff: install pixelmatch + pngjs to compare)`);
    continue;
  }

  const pixelmatch = pixelmatchMod.default || pixelmatchMod;
  const { PNG } = pngjsMod;
  const a = PNG.sync.read(fs.readFileSync(basePath));
  const b = PNG.sync.read(fs.readFileSync(snapPath));
  if (a.width !== b.width || a.height !== b.height) {
    console.log(`  ✗ ${name} dimension mismatch (${a.width}x${a.height} vs ${b.width}x${b.height})`);
    failures.push(name);
    continue;
  }
  const diff = new PNG({ width: a.width, height: a.height });
  const diffPixels = pixelmatch(a.data, b.data, diff.data, a.width, a.height, {
    threshold: 0.1, includeAA: true
  });
  if (diffPixels > 50) {
    fs.writeFileSync(path.join(DIFF_DIR, name), PNG.sync.write(diff));
    console.log(`  ✗ ${name} diff = ${diffPixels} px → wrote tests/visual/diff/${name}`);
    failures.push(name);
  } else {
    console.log(`  ✓ ${name} (${diffPixels} px diff)`);
  }
}

await browser.close();
child.kill();

console.log(`\n[visual] ${slides.length} slides, ${failures.length} failed`);
process.exit(failures.length > 0 ? 1 : 0);

function waitFor(pred, ms) {
  return new Promise((resolve, reject) => {
    const t0 = Date.now();
    (function tick() {
      if (pred()) return resolve();
      if (Date.now() - t0 > ms) return reject(new Error('timeout'));
      setTimeout(tick, 80);
    })();
  });
}
