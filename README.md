# Stagecraft

Cinematic, agent-authored presentations. **Reveal.js reimagined for the LLM era.**

▶ **[Live demo](https://dnoegel.github.io/stagecraft/)** — the deck about Stagecraft, built with Stagecraft. Auto-deployed from `main` via GitHub Pages.

A small JavaScript library for building animated slide decks that live in a single HTML file. Designed so an LLM can generate a deck that doesn't look like an LLM generated it.

## Why

Generic slide libraries produce generic decks. Stagecraft is built around a different premise: **the agent is a creative director, not a form-filler**. The library ships a catalog of building blocks (50 components across 7 families) AND five bespoke example slides — `examples/token-stream.js`, `examples/orchestration-graph.js`, `examples/terminal-log.js` — that show what the bar looks like. `AGENT.md` is the manifesto.

## Quick start

```bash
mkdir my-deck && cd my-deck
npm init -y
npm install stagecraft
npx stagecraft init
```

This scaffolds:

```
my-deck/
├── index.html             # opens directly in a browser to present
├── stagecraft.config.js   # the manifest: theme + slide order + transitions
├── slides/
│   └── 00-title.js
└── AGENT.md               # the manifesto the agent reads
```

Present mode (no setup, no infrastructure):
```bash
open index.html
```

## Two modes, one HTML file

### Presentation mode

Open `index.html` directly. Use arrow keys, space, or page-up/down to navigate. `F` for fullscreen, `S` for storyboard, `1-9` to jump to a section, `R` to replay the current slide, `P` to open the presenter view.

### Edit mode (dev server)

```bash
npx stagecraft serve
```

The browser detects the server and unlocks the editing affordances:

- **Drag slides** in the storyboard to reorder
- **Click transitions** between storyboard tiles to pick from 15 effects with hover preview
- **Click any text** on a Layer-2 component to inline-edit (writes back to source via AST roundtrip)
- **Shift+Click** any element to pin a `// @note[stage-key=...]:` comment for the agent
- **N** in present mode opens a slide-level note dialog
- **🎙 button** per tile in storyboard: speaker notes (shown in presenter view, hidden from audience)
- **× button** per tile: delete slide
- **+ tile** at the end of the grid: add a new slide from a template
- **Theme picker** at the top of the storyboard: live-switch between Phosphor/Paper/Neon/Brand/Shopware
- **📋 Process notes** copies a ready-made agent prompt to the clipboard

When you ask the agent to "process my notes":
1. `grep -rn '@note' slides/`
2. Read each note + its slide
3. Edit the slide
4. Delete the `@note:` lines

That's the whole loop.

## Presenter view (multi-monitor)

Press `P` during a presentation → a new window opens with the presenter view:

- **Left:** current slide (live)
- **Right:** next slide thumbnail
- **Below:** speaker notes + elapsed timer + wall clock + reset

Drag the presenter window to your laptop screen, drag the main window to the beamer (or vice versa), full-screen the main one. Both windows stay synchronized via the browser's `BroadcastChannel` API: any nav action in either window updates the other.

## 50 components in 7 families

| Family | Count | Examples |
|---|---|---|
| **Core** | 6 | KineticText, SectionCard, ActivityList, Compare, Counter, ShiftArrow |
| **Layout** | 6 | ImageText, FullImage, Quote, BigNumber, Stats, Bento |
| **Diagram** | 5 | Pillars, Timeline, Pyramid, Cycle, Funnel |
| **Chart** | 5 | Matrix2x2, BarChart, Progress, ProcessFlow, Venn |
| **Data-viz** | 10 | KPI, DonutChart, LineChart, Gauge, SparkLine, Heatmap, Roadmap, SWOT, CodeBlock, CodeDiff |
| **Business** | 10 | Pricing, Testimonial, TeamGrid, Agenda, Checklist, Steps, CTA, Callout, Tip, BeforeAfter |
| **Content** | 8 | Statement, QandA, Manifesto, Punchline, Definition, ImageGrid, Spotlight, Marquee |

50 anchors total + 5 bespoke cookbook examples (`examples/`). See `AGENT.md` for the full catalog with code examples.

## 15 transitions

Set in the manifest:
```js
Stage.deck({
  slides: [
    { src: 'slides/00-title.js' },
    { src: 'slides/01-shift.js', transition: 'glitch' }
  ]
});
```

Built-in: `cut · fade · slide · dissolve · glitch · wipe · zoom-in · zoom-out · flip · iris · shutter · push · typewriter · shatter` (plus the `cut`-preview-only animation).

Themes override visuals. Unknown name → falls back to `fade`. Hover any transition in the picker to play it once.

## 5 themes

| Theme | Vibe | Typography |
|---|---|---|
| **Phosphor** | Cinematic, technical, dark. Phosphor-green + film grain | JetBrains Mono |
| **Paper** | Academic, restrained, light. Navy accent, no glow | Inter + Source Serif 4 |
| **Neon** | Cyberpunk, magenta + cyan, heavy glow | Space Grotesk + JetBrains Mono |
| **Brand** | Corporate, schlicht. Blue accent, GitHub-dark adjacent | Inter |
| **Shopware** | Official Shopware brand. Light, Meteor design tokens, brand-blue `#0870ff` | Inter |

Switch live from the edit-mode storyboard, or set `data-theme="..."` on `<html>` plus link the matching theme CSS bundle.

## Speaker notes

Slides can carry notes for the presenter view:

```js
Stage.register(Stage.KineticText({
  section: 2,
  lines: [...]
}), {
  notes: 'Open by reminding them about last quarter\'s incident. Pause for ~5s after "the shift".'
});
```

Notes are plain strings, displayed in the presenter window. Hidden from the audience. Edit them via the 🎙 button on each storyboard tile.

## Export to PDF

```bash
npm install --save-dev playwright pdf-lib
npx playwright install chromium
npx stagecraft export pdf --out my-deck.pdf
```

Renders each slide at 1920×1080, concatenates into a single PDF. Skips transitions; respects each slide's `init()` animation timing (waits 1.2s by default; tune with `--wait`).

## Visual regression tests

```bash
npm install --save-dev playwright pixelmatch pngjs
npx playwright install chromium
npm run test:visual:update    # one-time: capture baseline
# ... make changes ...
npm run test:visual           # diff against baseline
```

Catches the kind of bugs where a Venn label drifts or a Heatmap layout breaks under refactor. Diffs land in `tests/visual/diff/`.

## Accessibility

Stagecraft respects `prefers-reduced-motion`:
- All CSS transitions/animations reduced to ~0ms globally
- JS animations (typewriter, particle emission, stagger) shortcut to final state immediately

The reduced-motion preference is OS-level — Stagecraft itself doesn't expose a toggle. If a component's animation is essential to the message, give it a non-animated fallback.

## Architecture (4 layers + convention)

```
Layer 0  Engine        Stage.register, deck loader, navigation, steps, storyboard, transitions
Layer 1  Primitives    staggerIn, typewriter, emitParticle, revealByDataStep, ...
Layer 2  Components    50 building blocks across 7 families
Layer 3  Cookbook      5 bespoke examples in examples/ — the real teachers
Layer 4  Convention    AGENT.md — calibrates the agent's taste
```

See `docs/specs/2026-05-22-stagecraft-sdk-design.md` for the full design rationale.

## Bundle vs. source

- Source: `src/` (~70 files). What you read, edit, contribute against.
- Bundle: `dist/stagecraft.bundle.js` + `dist/themes/<name>.bundle.css`. Generated by `npm run build`. One script tag instead of 60+. Consumers from npm load these directly via `node_modules/stagecraft/dist/...`.

## Deploying a deck to the web

Stagecraft decks are static HTML. Drop them anywhere:

### gh-pages
```bash
# in your deck repo
git checkout -b gh-pages
npm run build              # if your index.html uses src/ paths, copy node_modules/stagecraft into the repo first
git add -A
git commit -m "deploy"
git push origin gh-pages
# Enable Pages in repo settings → branch: gh-pages
```

### Netlify / Vercel / S3 / anything that serves static files

Same idea: the deck is just HTML + JS + CSS. No runtime dependencies for present mode.

## Status

v0.2 — feature-complete, multi-theme, multi-monitor, exportable. Pre-publication: dogfooding against a real production deck post-talk before tagging 1.0.

## License

MIT — see `LICENSE`.
