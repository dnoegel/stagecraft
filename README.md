# Stagecraft

Cinematic, agent-authored presentations. **Reveal.js reimagined for the LLM era.**

A small JavaScript library for building animated slide decks in a single HTML file. Designed so an LLM can generate a deck that doesn't look like an LLM generated it.

## Why

Generic slide libraries produce generic decks. Stagecraft is built around a different premise: **the agent is a creative director, not a form-filler**. The library ships a handful of building-block components, but the real teachers are five bespoke example slides — `examples/token-stream.js`, `examples/orchestration-graph.js`, `examples/terminal-log.js` — that show what the bar looks like. `AGENT.md` is the manifesto.

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

Edit mode (dev server + live editing in the browser):
```bash
npx stagecraft serve
```

## Edit mode

The dev server turns the browser into a collaborative editor:

- **Drag slides** in the storyboard to reorder (writes the manifest back to disk).
- **Click transitions** between storyboard tiles to pick from 6 effects with live preview.
- **Pin a note** on any element (Shift+click): `// @note[stage-key="..."]:` ends up in the slide file.
- **Inline-edit text** on Layer-2 components (single click on the text): AST-aware rewrite of the component prop.
- **Slide-level notes** (`N` key or 💬 on a tile): `// @note:` comment, top of slide file.

When you ask the agent to "process my notes":
1. `grep -rn '@note' slides/`
2. Read each note + its slide
3. Edit the slide
4. Delete the `@note:` lines

That's the whole loop.

## Layer-2 components — 50 building blocks in 7 families

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

## Transitions

Six per-slide transitions, set in the manifest:

```js
Stage.deck({
  slides: [
    { src: 'slides/00-title.js' },
    { src: 'slides/01-shift.js', transition: 'glitch' }
  ]
});
```

`cut` `fade` `slide` `dissolve` `glitch` `wipe`. Themes override visuals.

## Themes

Four themes ship:

- **Phosphor** — dark, JetBrains Mono, phosphor-green. Cinematic, technical. *(reference theme)*
- **Paper** — light, Inter + serif. Academic, restrained.
- **Neon** — dark, magenta + cyan, glow-heavy. Cyberpunk.
- **Brand** — dark, Inter, blue accent. Corporate, schlicht.

Activate via `<html data-theme="phosphor">` and link the matching CSS files.

## Architecture (four layers)

```
Layer 0  Engine        Stage.register, navigation, steps, storyboard, transitions
Layer 1  Primitives    staggerIn, typewriter, emitParticle, revealByDataStep, ...
Layer 2  Components    6 building blocks (above)
Layer 3  Cookbook      5 bespoke examples — the real teachers
Layer 4  Convention    AGENT.md — calibrates the agent's taste
```

See `docs/specs/2026-05-22-stagecraft-sdk-design.md` for the full design.

## Status

v0.1 — feature-complete but pre-publication. Use, fork, file issues.

## License

MIT
