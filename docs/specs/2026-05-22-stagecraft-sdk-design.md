# Stagecraft — Design Spec

**Date:** 2026-05-22
**Status:** Draft, brainstorming output

## 1. What Stagecraft is

A small JavaScript library for building **cinematic, agent-authored presentations** in a single HTML file. Think *reveal.js reimagined for the LLM era*: not a template-filler, but a drawing board with strong anchors.

The thesis: when an LLM writes your slides, the friction is not "I don't know HTML". The friction is that generic component libraries produce generic-looking decks. Stagecraft optimizes for the opposite axis — make it cheap to produce **bespoke, animated slides**, and make the agent's first instinct be "what would make this slide feel alive" instead of "which component matches this content".

### Target use

- A developer (or agent) generates a deck by writing JS files that register slides.
- Each slide is short (10-50 lines) and frequently animated.
- Decks ship as a single HTML page that opens in any browser. No build step required for the consumer.

### Non-goals

- WYSIWYG editing.
- Generic business decks. (Use Google Slides.)
- Server-side rendering, MDX-style RSC, anything heavyweight.
- A CLI/MCP server for prompt-to-deck generation. The agent uses the library directly, like a developer would.

## 2. Philosophy: Drawing Board, not Component Cage

The library is structured in four layers, each with explicit intent:

```
Layer 0  Engine        Registry, navigation, steps, storyboard. Owns the runtime contract.
Layer 1  Primitives    Helpers any slide uses: staggerIn, typewriter, emitParticle, ...
Layer 2  Components    Building blocks for common slide patterns. ~6 of them.
Layer 3  Cookbook      Real bespoke slides from a real deck, shipped as examples.
Layer 4  Convention    AGENT.md — the manifesto that calibrates the agent.
```

**Key rule:** Layer 2 components have deliberately spare defaults. A `Stage.ActivityList({items: [...]})` shows static items — no animation, no fade-in. To get motion, you pass `reveal: 'per-click'` or `reveal: 'staggered'`. The agent reads this and thinks: "spare defaults are an invitation to do better, not a sign that this is finished."

The Cookbook (Layer 3) is the actual teacher. The components are anchors for the trivial 30%; the cookbook is how the agent learns the bar for the other 70%. Bespoke slides like `TokenStream` (interleaved word-fill with particle emit) ship as readable example files, not as components.

## 3. Architecture

### 3.1 Engine (Layer 0)

The engine is a few hundred lines, ported from the existing SCD-2026 deck's `index.html`. It owns:

- A slide registry (`Stage.register({...})`).
- Navigation: `→/←`, `Space`, `PageUp/PageDown`, `1-9` to jump to section, `F` fullscreen, `R` replay, `S` storyboard.
- The step model (see Section 4).
- A storyboard / overview grid (existing in the SCD deck — straight port).
- URL hash deeplinks (`#7` opens slide 7).
- A welcome overlay on first load.
- Touch handlers (tap-to-advance, swipe).

The engine does **not** own:

- Rendering. Slides render themselves via their `render(el)` function.
- Theming. Themes are CSS files loaded by the consumer.
- Content. The library ships no slides. Examples are in `examples/`.

### 3.2 The Slide Contract

```js
Stage.register({
  section: 2,                    // section number for UI counter / dots
  title: '02 · The shift',       // shown in chrome
  steps: 3,                      // optional: number of internal steps

  render(el) {
    // mutate el.innerHTML / appendChild. Called once on entry.
    // Pure DOM construction — no animation here.
  },

  init(el) {
    // Called after render, when slide is visible.
    // Run entrance animations, start timers, attach listeners.
    // Return a cleanup function (or undefined).
    return () => { /* cancel timers, etc. */ };
  },

  onStep(el, step) {
    // Called whenever the active step changes (0 .. steps-1).
    // Only used if `steps` is set.
  },

  replay(el) {
    // Optional. Called when user presses R. Defaults to re-running init.
  }
});
```

This contract is intentionally minimal. The slide owns its DOM, its animation, its lifecycle. The engine owns navigation and visibility. Everything else is the slide's business.

### 3.3 Primitives (Layer 1)

Shipped helpers, available globally as `Stage.<helper>`:

| Helper | Purpose |
|---|---|
| `staggerIn(nodes, step, initial)` | Add `.in` class to nodes one after another |
| `typewriter(el, text, opts)` | Character-by-character text reveal |
| `emitParticle(parent, x1,y1, x2,y2, dur)` | SVG particle traveling between two points |
| `sessionElapsedClock()` | MM:SS / H:MM:SS formatter for live counters |
| `revealByDataStep(el, step)` | Show `[data-step="n"]` elements where `n <= step` |
| `blinkCaret(el)` | Phosphor-style blinking caret |

These are kept tiny and composable. The agent should be able to read any one in 30 seconds.

### 3.4 Components (Layer 2)

Six building blocks, each a small factory that returns a slide object:

```js
Stage.KineticText({
  section, title,
  lines: [
    { text: 'You start with a sentence.', color: 'fg' },
    { text: 'You end with the sentence',  color: 'dim' },
    { text: 'rewritten.',                  color: 'accent', pause: 800 }
  ],
  pace: 800
});

Stage.SectionCard({ section, number: '02', title: 'What changed', tag: 'the shift in cost' });

Stage.ActivityList({
  section, title,
  items: [
    { num: '01', name: 'Problem framing',   desc: '...' },
    { num: '02', name: 'Architecture',      desc: '...' }
  ],
  reveal: 'per-click' | 'staggered' | 'instant'
});

Stage.Compare({
  section, title,
  left:  { heading: 'OLD', items: ['...'], style: 'strikethrough' },
  right: { heading: 'NEW', items: ['...'], style: 'accent' }
});

Stage.Counter({
  section,
  blocks: [
    { label: 'Lines written',  start: 0, increment: 47, color: 'accent' },
    { label: 'Bugs introduced', start: 0, increment: 3,  color: 'amber' }
  ],
  footer: 'Both numbers are wrong.'
});

Stage.ShiftArrow({ section, from: 'writing code', to: 'reviewing code' });
```

Each component returns a `{section, title, render, init, ...}` object, ready to pass to `Stage.register()`. Components are themselves built using primitives.

**Why these six:** they were destilled from a real production deck. `KineticText` covered 11 of 25 slides. `SectionCard` covered 6. The other four covered specific recurring patterns. They are not aspirational; they earn their place.

### 3.5 Cookbook (Layer 3)

Five bespoke example slides shipped in `examples/`:

- `token-stream.js` — Split-panel with words filling left/right alternately, replayable.
- `orchestration-graph.js` — SVG hex-graph with particle flow from satellites to center.
- `terminal-log.js` — Streaming colored log lines with a "human realization" reveal arc.
- `whoami.js` — Terminal prompt that cycles through identity strings.
- `closing-card.js` — QR code, thanks, underline, presenter names.

These are **not abstract**. They are the actual slides from the SCD 2026 deck, copied verbatim and minimally generalized (Talk-specific strings replaced with placeholders). They serve two roles:

1. **Documentation by example.** An agent reading the repo learns the bar.
2. **Pattern source.** When the agent needs to build something similar, it adapts these.

## 4. Step Model

A slide may declare `steps: N`. The engine then:

- Tracks `currentStep` for the active slide (starts at 0).
- On `→`: if `currentStep < N-1`, increment and call `onStep(el, currentStep)`. Otherwise advance to next slide.
- On `←`: if `currentStep > 0`, decrement and call `onStep`. Otherwise go to previous slide.
- On slide entry: `init(el)` runs first, then `onStep(el, 0)` if `steps` is set.
- On `R`: reset to step 0, re-run `init`.

Slides without `steps` work as they do today — autonomous animations in `init()`, no internal navigation state.

### Two convenience shortcuts

For trivial reveal-per-step cases:

```js
// In the slide markup, tag elements with data-step:
<li data-step="1">First</li>
<li data-step="2">Second</li>

// Use the helper as onStep:
onStep: Stage.revealByDataStep
```

For components like `BulletList`, this is wired up internally when you pass `reveal: 'per-click'`. The user never writes `data-step` directly unless going bespoke.

## 5. Theming

Themes are CSS files plus optional manifest. A theme defines:

- **Tokens** (CSS custom properties): `--bg`, `--fg`, `--accent`, `--accent-glow`, `--dim`, `--amber`, `--red`, font stacks.
- **Base styles**: body background, ambient gradient, film grain, typography defaults.
- **Component variants** (optional): theme-specific overrides for Layer-2 components.
- **Effect config** (optional JS): tuning for particles, caret blink rate, etc.

Activation via HTML attribute:

```html
<html data-theme="phosphor">
  <link rel="stylesheet" href="node_modules/stagecraft/themes/phosphor/index.css">
```

Or programmatically: `Stage.setTheme('phosphor')` — swaps the `data-theme` attribute, the linked CSS handles the rest.

### Shipped themes

| Theme | Vibe | Typography | Palette |
|---|---|---|---|
| **Phosphor** | Cinematic, technical, dark | JetBrains Mono | Black + phosphor green + amber accents |
| **Paper** | Academic, minimal, light | Inter + serif | White + warm grays + restrained color |
| **Neon** | Demo, cyberpunk, dark | Mono + display sans | Black + magenta + cyan, heavy glow |
| **Brand** | Corporate, schlicht, dark | Inter | Black + blue accent (Shopware-ish) |

Phosphor ships first as the reference theme (it's already designed — it's the SCD deck's look). The others are scaffolded with a TODO if not yet styled.

## 6. Distribution

`stagecraft` is a single npm package.

```
stagecraft/
├── package.json
├── README.md                        # human-facing
├── AGENT.md                         # agent-facing manifesto (see Section 7)
├── src/
│   ├── engine.js                    # the runtime
│   ├── helpers.js                   # Layer 1
│   └── components/                  # Layer 2 (one file each)
├── themes/
│   └── phosphor/ paper/ neon/ brand/
├── examples/                        # Layer 3 cookbook
└── starter/                         # what `npx stagecraft init` copies
    ├── index.html
    ├── slides/00-title.js
    └── AGENT.md
```

### Two discovery paths for an agent

1. **Existing project:** `package.json` already includes `stagecraft`. Agent finds `AGENT.md` at the project root (the `init` command symlinks it there) or in `node_modules/stagecraft/`.

2. **New project:** `npx stagecraft init` scaffolds index.html, slides folder, a starter title slide, and copies AGENT.md to the project root.

### Build

No build step for consumers. `src/engine.js` is loadable directly via `<script>` (no ESM/CJS confusion, no bundler). Components are individual `<script>` tags or imported as ES modules — both supported. The library itself ships pre-built; nothing to compile.

## 7. AGENT.md — the manifesto

A single ~150-line file. Four sections:

1. **The rule** (philosophy, ~30 lines). "You're not filling a template, you're directing a scene. If your slide is fewer than three lines, it's probably boring."
2. **The toolbox** (Layer 2 + Layer 1 cheatsheet, ~60 lines). One-liner per component with a concrete example.
3. **The cookbook** (Layer 3 pointer, ~30 lines). "Read `examples/token-stream.js` before building anything with motion."
4. **The step model** (~30 lines). How `steps` + `onStep` work, when to use, when to skip.

This file is what calibrates the agent's taste. It's the most important document in the repo.

## 8. Implementation strategy

Stagecraft is built in a new repo at `/Users/d.noegel/programming/stagecraft`. The SCD-2026 deck is **not touched** while it's still in talk-ready state — it becomes the first consumer post-talk.

Build order:

1. **Engine + Phosphor theme.** Port from `index.html` of SCD. Verify a single slide works end-to-end.
2. **Primitives** (Layer 1). Port `staggerIn`, `emitParticle`. Add `typewriter`, `revealByDataStep`, `blinkCaret`.
3. **KineticText component** (Layer 2). Highest leverage — covers 11/25 slides. Validates the component API shape.
4. **SectionCard** (Layer 2). The second-most-used.
5. **Remaining four components** (ActivityList, Compare, Counter, ShiftArrow).
6. **Cookbook ports** (Layer 3). Copy bespoke slides from SCD verbatim into `examples/`, replace talk-specific strings.
7. **AGENT.md.** Write the manifesto. Test by giving Claude a fresh project and a prompt.
8. **Starter + `npx stagecraft init`.** Scaffold command.
9. **Other themes** (Paper, Neon, Brand). Lower priority — Phosphor is enough to validate.
10. **Publish to npm.** Only after dogfooding against SCD migration.

Each step lands in its own commit. Steps 1-3 are the riskiest (API shape). Step 7 is the most important for the agent-first promise.

## 9. Open questions

- **Component naming.** `Stage.KineticText` vs. `Stage.Text.Kinetic` vs. just `KineticText` as a named export. Decide when implementing.
- **Animation grammar.** Should `reveal: 'per-click' | 'staggered' | 'instant'` be a fixed enum or a string that components interpret freely? Probably enum for the common cases, but components can accept a function for bespoke.
- **CSS scoping.** Components inline their CSS today (via `<style>` tags in `init`). Move to per-component CSS files, or keep inline for portability? Likely: critical styles live in `themes/<theme>/components.css`, components inject only dynamic stuff.
- **Versioning the AGENT.md.** When AGENT.md changes, what happens to slides written against the old version? Probably: AGENT.md is mostly stable; major changes mean a major version bump.

These are explicit deferrals — they get resolved during implementation, not in this spec.
