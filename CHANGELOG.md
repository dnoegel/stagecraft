# Changelog

## 0.3.0 — 2026-06-16

### CLI
- New **`stagecraft check`** command — the blind-agent feedback loop. Renders the deck headless (same engine as `export pdf`), walks every slide, steps through each slide's internal steps (exercising every `onStep`), and reports **empty slides**, **broken assets** (`>= 400` responses), and **console / page errors**, attributed per slide. `--shots DIR` screenshots each slide; `--channel chrome` drives an installed Chrome instead of bundled chromium. Exits non-zero on problems, so it drops into CI or a pre-publish hook. Needs `playwright`.
- New **`stagecraft export static`** command. Assembles a self-contained copy of the deck — the deck files plus only the `stagecraft` package — into one folder, skipping the rest of `node_modules`, `.git`, build output, and zips. The result has no external dependencies: open its `index.html` to present, zip it to share with someone who lacks the repo, or drop it on any static host. Pure file copy — no playwright, no browser, no deps.

### Documentation
- **Step model** (`AGENT.md` §6): documented the `steps` off-by-one explicitly. Steps are 0-indexed and step 0 fires on entry, so `steps` must equal (highest step index `onStep` uses) + 1. Spelled out both silent failure modes — a reveal gated too high never fires; an over-count produces a "dead click" — with the counting rule and a worked example.
- **`check` in `AGENT.md`** (new §13): the authoring agent is pointed at `stagecraft check` (+ `--shots`) to render and inspect what it produced — closing the blind-author loop.

### Engine
- New **public navigation API** on `Stage`: `Stage.go(i)`, `Stage.next()`, `Stage.prev()`, `Stage.section(n)`, `Stage.replay()`, plus the read-only getters `Stage.current`, `Stage.step`, and `Stage.count`. A stable, documented surface for tooling, tests, custom controls, and headless drivers — so they no longer have to simulate keypresses to move the deck. `next()` / `prev()` respect the step model exactly like the arrow keys. `Stage._engine` stays private to the edit-mode UI.

### Scaffold
- **Offline-safe font loading.** The scaffold `index.html` (and the demo + gallery decks) now load Google Fonts non-render-blocking (`media="print"` + `onload="this.media='all'"`) instead of as render-blocking stylesheets. The deck paints immediately in each theme's fallback font stack rather than stalling on a blank screen for seconds when a font request hangs — the common case on conference wifi or fully offline. The engine already requires JS, so no `<noscript>` fallback is needed; comments point at self-hosting for a fully offline deck.

## 0.2.0 — 2026-05-23

### Themes
- Added **Shopware** theme — fifth official theme, sourced from the Meteor design system (`@shopware-ag/meteor-tokens` v1.4.0). Light, Inter, brand-blue `#0870ff`, semantic palette piped through. Full overrides for all 50 components and all transitions.
- Polished **Paper**, **Neon**, and **Brand** themes with per-family component overrides (each had been mostly inheriting Phosphor before — now they have distinct visual personalities).
- **Theme picker** in the storyboard toolbar lets you switch live across all 5 themes.
- Demo loads all 5 themes' CSS so switching is instant (no reload). Production starter loads a single theme bundle and reloads on switch.

### Editor
- New **'E' keypress** toggles edit-mode affordances on/off without disconnecting the dev server — present cleanly even with the server running.
- New **Speaker notes** field (`Stage.register(slide, {notes: '…'})`) with 🎙 button per storyboard tile. AST-aware roundtrip preserves all other slide fields.
- New **CRUD** in storyboard: ➕ add slide (with template choice), 🗑 delete slide.
- New **Process notes** button copies a ready-made agent prompt to the clipboard.
- New **Pin markers** on annotated elements during edit mode (yellow pulsing dots, hover for note text).
- Element click for inline editing changed from double-click to single click.

### Presenter view
- Press **P** to open a second window with the presenter view: current slide, next-slide thumbnail, speaker notes, elapsed timer, wall clock. Multi-monitor via `BroadcastChannel` sync. Laptop sees notes, beamer sees clean slide.

### Components (50 total)
- Phase 3 added: ImageText, FullImage, Quote, BigNumber, Stats, Bento, Pillars, Timeline, Pyramid, Cycle, Funnel, Matrix2x2, BarChart, Progress, ProcessFlow, Venn, KPI, DonutChart, LineChart, Gauge, SparkLine, Heatmap, Roadmap, SWOT, CodeBlock, CodeDiff, Pricing, Testimonial, TeamGrid, Agenda, Checklist, Steps, CTA, Callout, Tip, BeforeAfter, Statement, QandA, Manifesto, Punchline, Definition, ImageGrid, Spotlight, Marquee.

### Transitions (15 total)
- Added zoom-in, zoom-out, flip (3D rotateY), iris (clip-path), shutter, push, typewriter, shatter.
- Hover-to-play-once preview in the picker.

### Tooling
- **Bundle script** (`npm run build`): concatenates everything into `dist/stagecraft.bundle.{js,css}` + per-theme CSS bundles.
- **PDF export** (`npx stagecraft export pdf`): renders deck to PDF via Playwright + pdf-lib (optional deps).
- **Visual regression** harness (`tests/visual/run.js`): Playwright snapshots with optional pixelmatch diffing.
- **GitHub Pages CI**: `npm run build` + `scripts/deploy-build.js` produce a `deploy/` directory; `.github/workflows/deploy-pages.yml` ships it on every push to main.
- **Verify CI**: `.github/workflows/verify.yml` runs `npm run verify` (AST tests), syntax-checks every JS file, builds bundles, and assembles the deploy directory on every PR.

### Accessibility
- `prefers-reduced-motion: reduce` shortcuts the typewriter, particles, and stagger animations to their final state.

### Bug fixes
- CodeBlock/CodeDiff: removed redundant `<pre>` wrapper that was preserving template-string whitespace as huge inter-line gaps.
- Venn diagram: geometry now expressed in SVG viewBox units; labels converted to container-% on render, so they align with the circles regardless of container aspect ratio.
- Heatmap: x-labels wrapped in a `.hm-x-row` grid container so they run horizontally instead of stacking.
- Drag-to-reorder in storyboard: the synthetic click after drop no longer closes the storyboard.
- Click-to-advance no longer fires in edit mode (previously prevented inline editing on the first click of any potential double-click).
- Storyboard state persists across the file-watcher reload after a drag-drop reorder.
- 'cut' transition now has a picker-only preview animation (was invisible before).

## 0.1.0 — 2026-05-22

Initial release.

- Engine, primitives, 6 core components, 4 themes, 5 cookbook examples.
- Edit mode with slide-level notes, element-pin notes, transition picker, inline text editing.
- Dev server with WebSocket + AST roundtrip.
