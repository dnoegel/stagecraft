#!/usr/bin/env node
'use strict';

/**
 * stagecraft export pdf — render the deck to a PDF.
 *
 * Usage:
 *   npx stagecraft export pdf [--out deck.pdf] [--root .] [--port N]
 *
 * Requires (peer): playwright + pdf-lib.
 *   npm install --save-dev playwright pdf-lib
 *   npx playwright install chromium
 *
 * Strategy:
 *   1) start the local dev server (no edit-mode UI needed; just static serve)
 *   2) launch headless chromium
 *   3) navigate to each slide via #hash, wait for animations to settle
 *   4) page.pdf() per slide, then concatenate via pdf-lib
 *   5) write to --out
 */

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';
import { spawn } from 'node:child_process';

// --- args ---
const args = process.argv.slice(2);
let outPath = 'deck.pdf';
let rootArg = '.';
let port = 4040;
let waitMs = 1200;
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--out') outPath = args[++i];
  else if (args[i] === '--root') rootArg = args[++i];
  else if (args[i] === '--port') port = parseInt(args[++i], 10);
  else if (args[i] === '--wait') waitMs = parseInt(args[++i], 10);
}

const ROOT = path.resolve(rootArg);

// --- soft-import optional deps ---
async function softImport(name) {
  try { return await import(name); }
  catch (e) {
    console.error(`\n[stagecraft] PDF export requires ${name}.`);
    console.error(`  Install with: npm install --save-dev playwright pdf-lib`);
    console.error(`  Then:         npx playwright install chromium`);
    process.exit(1);
  }
}

const { chromium } = await softImport('playwright');
const { PDFDocument } = await softImport('pdf-lib');

// --- start the dev server as a child process (avoid port conflicts with running serve) ---
console.log(`[stagecraft] starting server on :${port}…`);
const HERE = path.dirname(url.fileURLToPath(import.meta.url));
const child = spawn('node', [path.join(HERE, 'serve.js'), '--root', ROOT, '--port', String(port)], {
  stdio: ['ignore', 'pipe', 'pipe']
});

// Wait for "http://localhost:" line in the server output
let serverReady = false;
child.stdout.on('data', (b) => {
  const s = b.toString();
  if (s.includes('http://localhost:')) serverReady = true;
});
child.stderr.on('data', b => process.stderr.write(b));

await waitFor(() => serverReady, 5000);

// --- launch headless browser ---
const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1920, height: 1080 },
  deviceScaleFactor: 1
});
const page = await ctx.newPage();

const baseUrl = `http://localhost:${port}/`;
console.log(`[stagecraft] navigating to ${baseUrl}…`);
await page.goto(baseUrl);

// Discover slide count from the runtime
await page.waitForFunction(() => window.Stage && window.Stage.slides && window.Stage.slides.length > 0, {
  timeout: 10000
});
const slideCount = await page.evaluate(() => window.Stage.slides.length);
console.log(`[stagecraft] ${slideCount} slides to export`);

// --- iterate slides, page.pdf() per slide, merge ---
const out = await PDFDocument.create();

for (let i = 0; i < slideCount; i++) {
  process.stdout.write(`[stagecraft] slide ${String(i + 1).padStart(2, '0')}/${slideCount}…\r`);
  await page.goto(`${baseUrl}#${i}`);
  // Hide chrome that doesn't belong in print
  await page.evaluate(() => {
    document.querySelectorAll('.ui, .welcome').forEach(n => n.style.display = 'none');
  });
  // Wait for the slide to render + animations to settle
  await page.waitForTimeout(waitMs);
  const pdfBytes = await page.pdf({
    width: '1920px',
    height: '1080px',
    printBackground: true,
    pageRanges: '1',
    preferCSSPageSize: false,
    margin: { top: 0, bottom: 0, left: 0, right: 0 }
  });
  const tmp = await PDFDocument.load(pdfBytes);
  const [copied] = await out.copyPages(tmp, [0]);
  out.addPage(copied);
}

const finalBytes = await out.save();
fs.writeFileSync(outPath, finalBytes);
console.log(`\n[stagecraft] wrote ${outPath} (${finalBytes.length} bytes, ${slideCount} pages)`);

await browser.close();
child.kill();
process.exit(0);

// --- helpers ---
function waitFor(pred, ms) {
  return new Promise((resolve, reject) => {
    const t0 = Date.now();
    function tick() {
      if (pred()) return resolve();
      if (Date.now() - t0 > ms) return reject(new Error('timeout waiting for server'));
      setTimeout(tick, 80);
    }
    tick();
  });
}
