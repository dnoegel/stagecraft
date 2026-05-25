#!/usr/bin/env node
'use strict';

/**
 * scripts/deploy-build.js
 *
 * Assemble the `deploy/` directory for GitHub Pages.
 *
 * Layout:
 *   deploy/
 *   ├── index.html              ← gallery landing page (4 cards)
 *   ├── .nojekyll
 *   ├── 404.html
 *   ├── stagecraft/             ← "A deck about Stagecraft" demo
 *   ├── c64/                    ← Commodore 64 retro
 *   ├── travel/                 ← Tokyo travel diary
 *   └── apollo/                 ← Apollo 11 keynote
 *
 * Each demo directory contains its own dist/ copy so it's self-contained
 * and the relative bundle paths in index.html resolve cleanly.
 *
 * Run AFTER `npm run build`.
 */

import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';

const HERE = path.dirname(url.fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const DIST = path.join(ROOT, 'dist');
const OUT = path.join(ROOT, 'deploy');

if (!fs.existsSync(DIST) || !fs.existsSync(path.join(DIST, 'stagecraft.bundle.js'))) {
  console.error('[deploy] no dist/ found. Run `npm run build` first.');
  process.exit(1);
}

const DEMOS = [
  {
    name:      'stagecraft',
    srcDir:    path.join(ROOT, 'demo'),
    title:     'Stagecraft',
    subtitle:  'A deck about Stagecraft — built with Stagecraft.',
    brand:     'STAGECRAFT · DEMO',
    theme:     'phosphor',
    blurb:     '40 slides walking through every layer of the SDK.'
  },
  {
    name:      'c64',
    srcDir:    path.join(ROOT, 'demos', 'c64'),
    title:     'C64',
    subtitle:  'Eight bits that changed everything.',
    brand:     'C64 · 1982',
    theme:     'phosphor',
    blurb:     'A retro deck about the Commodore 64. Custom theme — pixel fonts, scanlines, the blue startup screen.'
  },
  {
    name:      'travel',
    srcDir:    path.join(ROOT, 'demos', 'travel'),
    title:     'Tokyo · April 2026',
    subtitle:  'Seven days. One city. A travel diary.',
    brand:     'TOKYO · 2026',
    theme:     'paper',
    blurb:     'Image-heavy magazine layout. Unsplash photography with attribution.'
  },
  {
    name:      'apollo',
    srcDir:    path.join(ROOT, 'demos', 'apollo'),
    title:     'Apollo 11',
    subtitle:  'July 1969. Four days. One small step.',
    brand:     'APOLLO 11 · 1969',
    theme:     'phosphor',
    blurb:     'A keynote-grade retelling of the Moon landing. Iconic NASA imagery, animated trajectory, the 1202 alarm, the famous quotes.'
  }
];

// --- clean ---
if (fs.existsSync(OUT)) fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

// --- per-demo build ---
let totalSize = 0;
for (const demo of DEMOS) {
  const demoOut = path.join(OUT, demo.name);
  if (!fs.existsSync(demo.srcDir)) {
    console.warn(`[deploy] WARNING: demo source missing → ${demo.srcDir}, skipping`);
    continue;
  }
  fs.mkdirSync(demoOut, { recursive: true });

  // index.html — regenerated from a single template so paths + UI chrome stay consistent
  const hasThemeCss = fs.existsSync(path.join(demo.srcDir, 'theme.css'));
  fs.writeFileSync(path.join(demoOut, 'index.html'), demoIndexHtml(demo, hasThemeCss));

  // stagecraft.config.js — required (warn + skip rather than crash)
  const configSrc = path.join(demo.srcDir, 'stagecraft.config.js');
  if (!fs.existsSync(configSrc)) {
    console.warn(`[deploy] WARNING: ${demo.name} has no stagecraft.config.js, skipping`);
    fs.rmSync(demoOut, { recursive: true, force: true });
    continue;
  }
  fs.copyFileSync(configSrc, path.join(demoOut, 'stagecraft.config.js'));

  // slides/ — required
  copyDir(path.join(demo.srcDir, 'slides'), path.join(demoOut, 'slides'));

  // theme.css — optional, demo-specific overrides
  if (hasThemeCss) {
    fs.copyFileSync(path.join(demo.srcDir, 'theme.css'), path.join(demoOut, 'theme.css'));
  }

  // dist/ — self-contained copy
  copyDir(DIST, path.join(demoOut, 'dist'));

  const size = walkSize(demoOut);
  totalSize += size;
  console.log(`[deploy] ${demo.name.padEnd(12)} → ${fmt(size)}`);
}

// --- gallery landing page ---
fs.writeFileSync(path.join(OUT, 'index.html'), galleryHtml(DEMOS));
fs.writeFileSync(path.join(OUT, '.nojekyll'), '');
fs.writeFileSync(path.join(OUT, '404.html'),
  '<!doctype html><meta charset="utf-8"><meta http-equiv="refresh" content="0; url=./"><title>Redirecting…</title>');
totalSize += walkSize(path.join(OUT, 'index.html'));

console.log(`[deploy] gallery + 4 demos assembled → ${fmt(totalSize)} total`);

// ---------------------------------------------------------------------------
// Templates
// ---------------------------------------------------------------------------

function demoIndexHtml(demo, hasThemeCss) {
  return `<!doctype html>
<html lang="en" data-theme="${demo.theme}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>${escapeHtml(demo.title)} — Stagecraft</title>
  <meta name="description" content="${escapeHtml(demo.subtitle)}">

  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:ital,wght@0,300;0,400;0,500;0,700;1,400&display=swap" rel="stylesheet">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&display=swap" rel="stylesheet">
  <link href="https://fonts.googleapis.com/css2?family=Source+Serif+4:ital,wght@0,400;0,500;1,400&display=swap" rel="stylesheet">
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=EB+Garamond:ital,wght@0,400;0,500;1,400&display=swap" rel="stylesheet">
  <link href="https://fonts.googleapis.com/css2?family=Caveat:wght@400;500;600;700&display=swap" rel="stylesheet">
  <link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&family=VT323&display=swap" rel="stylesheet">
  <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&display=swap" rel="stylesheet">

  <!-- Only the active theme is loaded initially. Other themes lazy-load via
       Stage.ensureThemeCss(name) when the picker switches. Saves ~600 KB initial. -->
  <link rel="stylesheet" href="dist/themes/${demo.theme}.bundle.css" data-stagecraft-theme="${demo.theme}">
${hasThemeCss ? '  <!-- Demo-specific overrides -->\n  <link rel="stylesheet" href="theme.css">\n' : ''}
  <style>
    .gallery-back {
      position: fixed;
      top: 1rem; left: 1rem;
      z-index: 200;
      font-family: var(--mono, monospace);
      font-size: 0.7rem;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: var(--dim, #666);
      text-decoration: none;
      padding: 0.4rem 0.8rem;
      border: 1px solid var(--dim-2, #2a2a2a);
      background: var(--bg-elevated, rgba(0,0,0,0.5));
      backdrop-filter: blur(4px);
      transition: color 200ms, border-color 200ms;
    }
    .gallery-back:hover {
      color: var(--accent, #00FF9C);
      border-color: var(--accent, #00FF9C);
    }
  </style>
</head>
<body>

  <a class="gallery-back" href="../">← gallery</a>

  <div class="welcome" id="welcome">
    <div class="key-prompt"><span class="accent">●</span>&nbsp;&nbsp;Press <span class="accent">→</span> or <span class="accent">Space</span> to begin</div>
    <h1>${escapeHtml(demo.title)}</h1>
    <div class="by">${escapeHtml(demo.subtitle)}</div>
  </div>

  <main id="stage"></main>

  <div class="ui">
    <div class="ui-brand"><span class="br-accent">${escapeHtml(demo.brand)}</span></div>
    <div class="ui-title" id="uiTitle"></div>
    <div class="ui-counter">
      <span id="curSec">00</span><span class="slash">/</span><span class="total">00</span>
    </div>
    <div class="ui-dots" id="uiDots"></div>
    <div class="ui-hint" id="uiHint">→ next · ← prev · S storyboard · F fullscreen · R replay · P presenter · E edit toggle</div>
  </div>

  <script src="dist/stagecraft.bundle.js"></script>
  <script src="stagecraft.config.js"></script>
</body>
</html>
`;
}

function galleryHtml(demos) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>Stagecraft — Demo Gallery</title>
  <meta name="description" content="Four highly customised Stagecraft decks. Cinematic, agent-authored presentations with no build step.">

  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500&display=swap" rel="stylesheet">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">

  <style>
    :root {
      --bg: #0A0A0A;
      --bg-card: #121212;
      --fg: #E6E6E6;
      --dim: #888;
      --dim-2: #2a2a2a;
      --accent: #00FF9C;
      --accent-glow: rgba(0, 255, 156, 0.45);
      --mono: 'JetBrains Mono', ui-monospace, Menlo, monospace;
      --display: 'Inter', system-ui, sans-serif;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html, body {
      min-height: 100%;
      background: var(--bg);
      color: var(--fg);
      font-family: var(--display);
      -webkit-font-smoothing: antialiased;
    }
    body::before {
      content: '';
      position: fixed; inset: 0;
      background: radial-gradient(ellipse at 50% 0%, rgba(0,255,156,0.08) 0%, transparent 60%);
      pointer-events: none;
      z-index: 0;
    }

    .hero {
      max-width: 1300px;
      margin: 0 auto;
      padding: clamp(3rem, 8vw, 6rem) clamp(1.5rem, 4vw, 4rem) 0;
      position: relative;
      z-index: 1;
    }
    .pre {
      font-family: var(--mono);
      font-size: 0.75rem;
      letter-spacing: 0.3em;
      text-transform: uppercase;
      color: var(--dim);
      margin-bottom: 1.5rem;
    }
    .pre .dot {
      display: inline-block;
      width: 7px; height: 7px;
      background: var(--accent);
      margin-right: 0.7rem;
      vertical-align: middle;
      animation: pulse 2s ease-in-out infinite;
    }
    @keyframes pulse { 50% { opacity: 0.4; } }
    .hero h1 {
      font-size: clamp(2.8rem, 7vw, 5.5rem);
      font-weight: 500;
      letter-spacing: -0.03em;
      line-height: 1.0;
      max-width: 22ch;
    }
    .hero h1 .accent { color: var(--accent); }
    .hero p {
      margin-top: 1.5rem;
      font-size: clamp(1rem, 1.4vw, 1.25rem);
      color: var(--dim);
      max-width: 60ch;
      line-height: 1.55;
    }
    .hero p .accent { color: var(--accent); }
    .meta {
      margin-top: 2.5rem;
      display: flex;
      gap: 1.5rem;
      flex-wrap: wrap;
      font-family: var(--mono);
      font-size: 0.78rem;
      color: var(--dim);
      letter-spacing: 0.08em;
    }
    .meta a {
      color: var(--dim);
      text-decoration: none;
      border-bottom: 1px solid var(--dim-2);
      padding-bottom: 2px;
      transition: color 200ms, border-color 200ms;
    }
    .meta a:hover {
      color: var(--accent);
      border-bottom-color: var(--accent);
    }

    .grid {
      max-width: 1300px;
      margin: 0 auto;
      padding: clamp(2rem, 5vw, 4rem) clamp(1.5rem, 4vw, 4rem) clamp(3rem, 8vw, 6rem);
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(min(100%, 480px), 1fr));
      gap: 1.2rem;
      position: relative;
      z-index: 1;
    }
    .card {
      display: flex;
      flex-direction: column;
      padding: 1.8rem;
      background: var(--bg-card);
      border: 1px solid var(--dim-2);
      text-decoration: none;
      color: inherit;
      position: relative;
      overflow: hidden;
      transition: border-color 250ms, transform 250ms, box-shadow 250ms;
    }
    .card::before {
      content: '';
      position: absolute;
      top: 0; left: 0;
      width: 4px; height: 100%;
      background: var(--card-accent, var(--accent));
      opacity: 0.6;
      transition: opacity 250ms, width 250ms;
    }
    .card:hover {
      border-color: var(--card-accent, var(--accent));
      transform: translateY(-2px);
      box-shadow: 0 24px 60px rgba(0,0,0,0.4), 0 0 0 1px var(--card-accent, var(--accent));
    }
    .card:hover::before { opacity: 1; width: 6px; }

    .card-tag {
      font-family: var(--mono);
      font-size: 0.68rem;
      letter-spacing: 0.25em;
      text-transform: uppercase;
      color: var(--dim);
      margin-bottom: 0.8rem;
    }
    .card-title {
      font-size: clamp(1.6rem, 2.4vw, 2.1rem);
      font-weight: 500;
      letter-spacing: -0.02em;
      margin-bottom: 0.5rem;
    }
    .card-sub {
      color: var(--dim);
      font-size: 0.95rem;
      margin-bottom: 1.4rem;
      letter-spacing: 0.005em;
    }
    .card-blurb {
      font-size: 0.85rem;
      color: var(--dim);
      line-height: 1.55;
      margin-bottom: 1.6rem;
    }
    .card-arrow {
      margin-top: auto;
      font-family: var(--mono);
      font-size: 0.78rem;
      letter-spacing: 0.18em;
      color: var(--card-accent, var(--accent));
      display: flex;
      align-items: center;
      gap: 0.6rem;
    }

    .card-stagecraft { --card-accent: #00FF9C; }
    .card-c64        { --card-accent: #A399E9; }
    .card-travel     { --card-accent: #E07856; }
    .card-apollo     { --card-accent: #FFB454; }

    footer {
      max-width: 1300px;
      margin: 0 auto;
      padding: 0 clamp(1.5rem, 4vw, 4rem) 3rem;
      font-family: var(--mono);
      font-size: 0.72rem;
      letter-spacing: 0.1em;
      color: var(--dim);
      display: flex;
      flex-wrap: wrap;
      gap: 1.5rem;
      justify-content: space-between;
      align-items: baseline;
    }
    footer a {
      color: var(--dim);
      text-decoration: none;
      border-bottom: 1px solid var(--dim-2);
      transition: color 200ms, border-color 200ms;
    }
    footer a:hover { color: var(--accent); border-bottom-color: var(--accent); }
  </style>
</head>
<body>

  <section class="hero">
    <div class="pre"><span class="dot"></span>Stagecraft · Demo Gallery</div>
    <h1>Cinematic, agent-authored presentations. <span class="accent">No build step.</span></h1>
    <p>Four highly customised decks, each pushing the SDK in a different direction. Open any of them &mdash; navigate with arrow keys, press <span class="accent">S</span> for the storyboard, <span class="accent">F</span> for fullscreen.</p>
    <div class="meta">
      <a href="https://github.com/dnoegel/stagecraft">github · repo</a>
      <a href="https://www.npmjs.com/package/stagecraft">npm · install</a>
      <a href="https://github.com/dnoegel/stagecraft/blob/main/AGENT.md">AGENT.md</a>
    </div>
  </section>

  <section class="grid">
${demos.map(d => `    <a class="card card-${d.name}" href="${d.name}/">
      <div class="card-tag">${escapeHtml(d.brand)}</div>
      <div class="card-title">${escapeHtml(d.title)}</div>
      <div class="card-sub">${escapeHtml(d.subtitle)}</div>
      <div class="card-blurb">${escapeHtml(d.blurb)}</div>
      <div class="card-arrow">open the deck&nbsp;&nbsp;→</div>
    </a>`).join('\n')}
  </section>

  <footer>
    <div>Stagecraft is MIT-licensed.</div>
    <div><a href="https://github.com/dnoegel/stagecraft">dnoegel/stagecraft</a></div>
  </footer>

</body>
</html>
`;
}

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------

function copyDir(src, dst) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dst, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const a = path.join(src, entry.name);
    const b = path.join(dst, entry.name);
    if (entry.isDirectory()) copyDir(a, b);
    else fs.copyFileSync(a, b);
  }
}
function walkSize(p) {
  if (!fs.existsSync(p)) return 0;
  const s = fs.statSync(p);
  if (!s.isDirectory()) return s.size;
  let total = 0;
  for (const e of fs.readdirSync(p, { withFileTypes: true })) {
    total += walkSize(path.join(p, e.name));
  }
  return total;
}
function fmt(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1024 / 1024).toFixed(2) + ' MB';
}
function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
