#!/usr/bin/env node
'use strict';

/**
 * stagecraft export static — assemble a self-contained copy of the deck.
 *
 * Usage:
 *   npx stagecraft export static [--out DIR] [--root .]
 *
 * No dependencies (no playwright, no browser). Pure file copy.
 *
 * Why this exists:
 *   A stagecraft deck presents from plain static files, but a deck created with
 *   `init` references the runtime via `node_modules/stagecraft/dist/...`. So you
 *   can't just zip the deck folder and send it to someone without the repo —
 *   the bundle + theme CSS live in node_modules, which you don't want to ship
 *   wholesale. `export static` copies the deck PLUS just the stagecraft package
 *   into one folder, skipping the noise (the rest of node_modules, .git, build
 *   output, zips). The result opens with a double-click and can be zipped and
 *   handed to anyone, or dropped on any static host.
 */

import fs from 'node:fs';
import path from 'node:path';

// --- args ---
const args = process.argv.slice(2);
let rootArg = '.';
let outArg = null;
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--root') rootArg = args[++i];
  else if (args[i] === '--out') outArg = args[++i];
}
const ROOT = path.resolve(rootArg);
const OUT = path.resolve(outArg || 'static-deck');

// --- sanity ---
if (!fs.existsSync(path.join(ROOT, 'index.html'))) {
  console.error(`[stagecraft] no index.html in ${ROOT} — is this a deck directory? (pass --root)`);
  process.exit(1);
}
if (OUT === ROOT) {
  console.error('[stagecraft] --out must differ from --root');
  process.exit(1);
}

// Skip the things you never want in a shipped deck. node_modules is skipped in
// the bulk copy, then the stagecraft package is added back explicitly below.
const SKIP = new Set(['node_modules', '.git', '.DS_Store', '_site', 'shots', 'deploy']);
function shouldSkip(abs, name) {
  if (SKIP.has(name)) return true;
  if (name.endsWith('.zip')) return true;
  if (abs === OUT) return true;        // don't copy the output dir into itself
  return false;
}

let fileCount = 0;
function copyDir(src, dst) {
  fs.mkdirSync(dst, { recursive: true });
  for (const name of fs.readdirSync(src)) {
    const s = path.join(src, name);
    if (shouldSkip(s, name)) continue;
    const d = path.join(dst, name);
    const st = fs.statSync(s);
    if (st.isDirectory()) copyDir(s, d);
    else { fs.copyFileSync(s, d); fileCount++; }
  }
}

console.log('[stagecraft] export static');
console.log(`  from: ${ROOT}`);
console.log(`  to:   ${OUT}`);

copyDir(ROOT, OUT);

// Bundle just the stagecraft package so `node_modules/stagecraft/...` paths in
// index.html resolve with no install on the receiving side.
const scPkg = path.join(ROOT, 'node_modules', 'stagecraft');
if (fs.existsSync(scPkg)) {
  copyDir(scPkg, path.join(OUT, 'node_modules', 'stagecraft'));
  console.log('  + bundled node_modules/stagecraft');
} else {
  console.log("  ! no node_modules/stagecraft found — if index.html references it, run 'npm install' first");
}

console.log(`\n[stagecraft] wrote ${fileCount} files to ${OUT}`);
console.log(`  Present:  open ${path.join(OUT, 'index.html')}`);
console.log(`  Share:    zip the ${path.basename(OUT)} folder and send it — it has no external dependencies.`);
