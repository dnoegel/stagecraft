#!/usr/bin/env node
'use strict';

/**
 * scripts/deploy-build.js
 *
 * Assemble a `deploy/` directory for static-hosting (GitHub Pages, Netlify, …).
 *
 * The demo deck under `demo/` loads individual src/component files via
 * `../src/…` relative paths — convenient for dev (no rebuild between edits)
 * but slow on a CDN (60+ requests). For deploy we want a single JS bundle
 * and a single theme CSS per theme, plus the slide files themselves (which
 * load dynamically at runtime).
 *
 * What this writes:
 *
 *   deploy/
 *   ├── index.html              ← rewritten to load the bundles
 *   ├── stagecraft.config.js    ← copied from demo/
 *   ├── slides/                 ← copied from demo/slides/
 *   ├── dist/                   ← copied from dist/ (built by `npm run build`)
 *   ├── .nojekyll               ← disable GitHub Jekyll processing
 *   └── 404.html                ← redirects to /
 *
 * Run AFTER `npm run build`. The CI workflow does both in order.
 */

import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';

const HERE = path.dirname(url.fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const SRC_DEMO = path.join(ROOT, 'demo');
const DIST = path.join(ROOT, 'dist');
const OUT = path.join(ROOT, 'deploy');

// --- clean ---
if (fs.existsSync(OUT)) fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

if (!fs.existsSync(DIST) || !fs.existsSync(path.join(DIST, 'stagecraft.bundle.js'))) {
  console.error('[deploy] no dist/ found. Run `npm run build` first.');
  process.exit(1);
}

// --- index.html (rewritten to use bundles) ---
fs.writeFileSync(path.join(OUT, 'index.html'), `<!doctype html>
<html lang="en" data-theme="phosphor">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>Stagecraft — Cinematic, agent-authored presentations</title>
  <meta name="description" content="Reveal.js reimagined for the LLM era. 50 components, 15 transitions, 5 themes. MIT.">

  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:ital,wght@0,300;0,400;0,500;0,700;1,400&display=swap" rel="stylesheet">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&display=swap" rel="stylesheet">
  <link href="https://fonts.googleapis.com/css2?family=Source+Serif+4:ital,wght@0,400;0,500;1,400&display=swap" rel="stylesheet">
  <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&display=swap" rel="stylesheet">

  <!-- All 5 themes loaded. Scoped via :root[data-theme="X"] so only the active one applies. -->
  <link rel="stylesheet" href="dist/themes/phosphor.bundle.css">
  <link rel="stylesheet" href="dist/themes/paper.bundle.css">
  <link rel="stylesheet" href="dist/themes/neon.bundle.css">
  <link rel="stylesheet" href="dist/themes/brand.bundle.css">
  <link rel="stylesheet" href="dist/themes/shopware.bundle.css">
</head>
<body>

  <div class="welcome" id="welcome">
    <div class="key-prompt"><span class="accent">●</span>&nbsp;&nbsp;Press <span class="accent">→</span> or <span class="accent">Space</span> to begin</div>
    <h1>Stagecraft</h1>
    <div class="by">Cinematic, agent-authored presentations · MIT</div>
  </div>

  <main id="stage"></main>

  <div class="ui">
    <div class="ui-brand"><span class="br-accent">STAGECRAFT</span>·DEMO</div>
    <div class="ui-title" id="uiTitle"></div>
    <div class="ui-counter">
      <span id="curSec">00</span><span class="slash">/</span><span class="total">00</span>
    </div>
    <div class="ui-dots" id="uiDots"></div>
    <div class="ui-hint" id="uiHint">→ next · ← prev · S storyboard · F fullscreen · R replay · P presenter · E edit toggle</div>
  </div>

  <!-- Single bundle: engine + helpers + transitions + all 50 components + edit-mode. -->
  <script src="dist/stagecraft.bundle.js"></script>
  <!-- Deck manifest: order + transitions. -->
  <script src="stagecraft.config.js"></script>
</body>
</html>
`);
console.log('[deploy] wrote index.html');

// --- copy stagecraft.config.js + slides/ verbatim ---
fs.copyFileSync(path.join(SRC_DEMO, 'stagecraft.config.js'), path.join(OUT, 'stagecraft.config.js'));
copyDir(path.join(SRC_DEMO, 'slides'), path.join(OUT, 'slides'));
console.log('[deploy] copied stagecraft.config.js + slides/');

// --- copy dist/ ---
copyDir(DIST, path.join(OUT, 'dist'));
console.log('[deploy] copied dist/');

// --- .nojekyll + 404.html ---
fs.writeFileSync(path.join(OUT, '.nojekyll'), '');
fs.writeFileSync(path.join(OUT, '404.html'),
  '<!doctype html><meta charset="utf-8"><meta http-equiv="refresh" content="0; url=./"><title>Redirecting…</title>');

// --- summary ---
const totalSize = walkSize(OUT);
console.log(`[deploy] done. ${OUT} → ${fmt(totalSize)}`);

// --- helpers ---
function copyDir(src, dst) {
  fs.mkdirSync(dst, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const a = path.join(src, entry.name);
    const b = path.join(dst, entry.name);
    if (entry.isDirectory()) copyDir(a, b);
    else fs.copyFileSync(a, b);
  }
}
function walkSize(dir) {
  let total = 0;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) total += walkSize(p);
    else total += fs.statSync(p).size;
  }
  return total;
}
function fmt(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1024 / 1024).toFixed(2) + ' MB';
}
