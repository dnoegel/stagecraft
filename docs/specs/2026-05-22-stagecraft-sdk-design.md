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

- Generic business decks. (Use Google Slides.)
- Server-side rendering, MDX-style RSC, anything heavyweight.
- A CLI/MCP server for prompt-to-deck generation. The agent uses the library directly, like a developer would.

### Optional but central: Edit Mode

A small companion dev server (`npx stagecraft serve`) turns the browser into an interactive editor — drag slides in the storyboard, leave notes the agent later finds and acts on, change transitions with live preview. The presentation runtime is identical with or without the server; a deck committed to git is always presentation-ready. See Section 7 for the full design. This is what makes Stagecraft fundamentally different from reveal.js: a tight human↔agent collaboration loop, not just a templating library.

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
- A **deck loader** (`Stage.deck({...})`) — reads the manifest, fetches slide scripts in order, applies per-slide transitions. See Section 7.1.
- Navigation: `→/←`, `Space`, `PageUp/PageDown`, `1-9` to jump to section, `F` fullscreen, `R` replay, `S` storyboard.
- The step model (see Section 4).
- A **transitions layer** — applies the per-slide transition specified in the manifest on enter. Default library: `cut`, `fade`, `slide`, `dissolve`, `glitch`, `wipe`. See Section 7.3.
- A storyboard / overview grid (existing in the SCD deck — straight port).
- URL hash deeplinks (`#7` opens slide 7).
- A welcome overlay on first load.
- Touch handlers (tap-to-advance, swipe).
- An **edit-mode hook**: tries to open a WebSocket to `ws://localhost:3000/stagecraft` at startup. If it connects, the engine enables editing affordances (note overlays in storyboard, drag-to-reorder, transition picker). If not, no-op — presentation mode only.

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
├── AGENT.md                         # agent-facing manifesto (see Section 8)
├── src/
│   ├── engine.js                    # the runtime (incl. deck loader + transitions)
│   ├── helpers.js                   # Layer 1
│   └── components/                  # Layer 2 (one file each)
├── themes/
│   └── phosphor/ paper/ neon/ brand/
├── examples/                        # Layer 3 cookbook
├── bin/
│   ├── init.js                      # `npx stagecraft init` — scaffold a project
│   └── serve.js                     # `npx stagecraft serve` — dev server (Section 7)
└── starter/                         # what `npx stagecraft init` copies
    ├── index.html                   # loads engine + stagecraft.config.js
    ├── stagecraft.config.js         # manifest: theme + slides[] + transitions
    ├── slides/00-title.js
    └── AGENT.md
```

### Two discovery paths for an agent

1. **Existing project:** `package.json` already includes `stagecraft`. Agent finds `AGENT.md` at the project root (the `init` command symlinks it there) or in `node_modules/stagecraft/`.

2. **New project:** `npx stagecraft init` scaffolds index.html, slides folder, a starter title slide, and copies AGENT.md to the project root.

### Build

No build step for consumers. `src/engine.js` is loadable directly via `<script>` (no ESM/CJS confusion, no bundler). Components are individual `<script>` tags or imported as ES modules — both supported. The library itself ships pre-built; nothing to compile.

## 7. Edit Mode (companion dev server)

Stagecraft ships with an optional Node-based dev server that turns the browser into a collaborative editor. The same `index.html` powers both modes — the browser detects the server's presence and enables editing affordances accordingly. A deck committed to git is always presentation-ready; the edit-mode UI never persists to the static HTML.

```bash
npx stagecraft serve
```

Spawns the server on `:3000`, opens the browser, and starts watching slide files + the manifest + the active theme. On every relevant change, all connected clients reload. When the page loads, it tries to open a WebSocket to `ws://localhost:3000/stagecraft`. Success → edit mode on. Failure (e.g., file opened directly from disk) → silent no-op, presentation mode only.

### 7.1 The slide manifest

Edit mode requires that slide order is data, not script-tag order in HTML. The starter introduces `stagecraft.config.js`:

```js
// stagecraft.config.js
Stage.deck({
  theme: 'phosphor',
  slides: [
    { src: 'slides/01-intro/00-title.js' },
    { src: 'slides/01-intro/01-cold-open.js', transition: 'fade' },
    { src: 'slides/01-intro/02-why.js',       transition: 'glitch' },
    { src: 'slides/02-what-changed/00-section-card.js', transition: 'dissolve' }
  ]
});
```

The HTML loads exactly two scripts: the engine and this manifest. `Stage.deck()` fetches each `src` in order, injects it as a script tag, and the slide's `Stage.register(...)` call fires on load. Reordering is now a one-line array mutation — trivially scriptable by an agent, draggable in the storyboard UI.

The `transition` field describes **how this slide enters** (not the edge between A and B — see Section 7.3 for rationale).

### 7.2 Annotations — three levels of granularity

Stagecraft supports three increasing levels of feedback, all of which write through to source files. The agent's "process notes" pass finds and resolves all of them. The common contract across levels:

- Notes/edits are written into source files (the JS itself), not into a sidecar database.
- The agent finds them via grep, processes them, and removes/integrates them.
- Absence ⇔ everything has been addressed. There is no separate "resolved" state.

#### Level 1: Slide-level notes

```js
// @note: too text-heavy, split into two slides — and line 2 should be amber, not dim
Stage.register({
  section: 2, title: 'Why now?',
  render(el) { ... }
});
```

Format: `// @note:` followed by free-form text on one or more consecutive comment lines, placed immediately above the `Stage.register(...)` call. (Notes elsewhere in the file are valid but conventionally placed at the top.)

**UX:** in storyboard, each tile shows a small note icon. Click → textarea overlay → submit → server writes the comment into the slide file. Tiles with active notes show a yellow underline.

#### Level 2: Element-pin notes

For "this specific element is wrong" feedback rather than slide-wide:

```js
// @note[stage-key="2.3"]: this bullet is too long — trim to ~6 words
Stage.register({ ... });
```

**How it works:** after `render()` runs, the engine assigns each rendered element a `data-stage-key` attribute via a depth-indexed tree walk (e.g., `2.3` = third child of the second top-level element). Keys are stable as long as the render-tree shape doesn't change.

For Layer-2 components, the keys are surfaced **semantically** rather than positionally: `KineticText/line[1]`, `ActivityList/item[2]`. The component overrides the default index-based key to communicate intent to the agent.

**UX:** hover any element → subtle outline. Click → floating note overlay anchored next to the element. Submit → server writes the comment with the key into the slide file. Storyboard tiles show yellow pin markers at annotated positions; clicking a pin re-opens the note.

#### Level 3: Inline text editing

For typos and quick wording tweaks, text inside Layer-2 components can be edited directly in the browser. Changes write back to the **source props** of the component call — not to the DOM. The source file remains the single source of truth.

```js
// Source before edit:
Stage.register(Stage.KineticText({
  lines: [
    { text: 'You start with a sentence.', color: 'fg' },
    { text: 'You end with the sentence',  color: 'dim' }
  ]
}));

// User clicks "You start" in the browser, types "You begin", blurs.
// Server rewrites the file:
Stage.register(Stage.KineticText({
  lines: [
    { text: 'You begin with a sentence.', color: 'fg' },
    { text: 'You end with the sentence',  color: 'dim' }
  ]
}));
```

**How it works:**

- Layer-2 components automatically tag text-bearing elements with `data-stage-edit="<prop-path>"`. Example: `KineticText` sets `data-stage-edit="lines[0].text"` on the first line's `<span>`. Components carry the source-of-truth mapping.
- Bespoke slides opt in by tagging elements themselves, provided the relevant data lives in a parseable top-level object literal passed to a component call (or `Stage.register({...})` itself).
- Editable elements get a subtle hover hint (dotted underline). Click → element becomes `contenteditable`. Enter or blur → save via server. Esc → cancel. (In edit mode, single clicks don't advance the slide — only keyboard navigation does — so a single click is unambiguous.)
- The server reads the slide file, locates the relevant `Stage.<Component>({...})` or `Stage.register({...})` call via AST parse (`@babel/parser` or equivalent), navigates the prop path, replaces the string literal, writes back. The slide file remains valid JavaScript with comments and formatting intact (codemod-style edit, not regex).
- Live reload picks up the change. No DOM-to-source guesswork.

**Constraints (explicit):**

- Edits touch text content of leaf elements only. Markup, color, structure require a Level 1 or 2 note.
- The prop path must resolve to a string literal in source. Computed values (template literals with interpolation, function calls, variables) reject the edit with a clear error in the browser.
- If the AST update fails (malformed file, ambiguous match, locked range), the server rejects the write and the browser shows an error toast. Source files are never left half-edited.

**Why this doesn't bypass the agent:** the JS file is still the source of truth. Inline edits show up in git diffs the same as any other commit. The agent sees them on its next pass. Level 3 is convenience for trivial text changes, not a back channel.

### 7.3 Transitions

A per-slide `transition` field in the manifest controls how the slide enters. Each transition is a CSS class on the slide element during the enter animation, plus optional JS for effects that need it (e.g., glitch's scanline overlay).

**Why on the destination slide, not the edge:** a transition belongs to "how this slide arrives". Mental model is simpler ("this slide comes in with glitch") than tracking edges. If you want a different transition going backwards into a slide, that's a future addition — for now, the same transition is used in both directions.

Default library (provided by Layer 0, all themes implement them):

| Transition | Effect |
|---|---|
| `cut` | Hard cut, no animation |
| `fade` | Crossfade (current SCD default) |
| `slide` | Horizontal push from right |
| `dissolve` | Slow crossfade with held overlap |
| `glitch` | Brief scanline + RGB shift, then settle |
| `wipe` | Masked reveal sweeping left-to-right |

Themes can **override** the visual character of a transition (Phosphor's `glitch` is heavier on green scanlines than Paper's). Themes can also **add** transitions, registered as `Stage.registerTransition('name', config)`. Slides referencing an unknown transition fall back to `fade`.

**Edit-mode UI:** in storyboard, between every pair of adjacent tiles, a small connector icon appears (◇ fade, ⚡ glitch, ━ cut, …). Clicking it opens a picker overlay with a **looping live preview** of each transition applied to the actual slide pair. Selection updates the `transition` field of the second slide in the manifest.

### 7.4 Live reload

The server watches the manifest, all listed slide files, and the active theme's CSS/JS. On change, it broadcasts a granular reload message over the WebSocket:

- **Slide file changed** → re-fetch that file, re-render the slide if it's currently visible (preserving current step).
- **Manifest changed** → reload deck order, keep current slide visible if it still exists, otherwise snap to nearest.
- **Theme CSS changed** → swap stylesheet (no reload).
- **Theme JS changed** → full page reload (effects can't be hot-swapped cleanly).

### 7.5 Security

The dev server binds to `127.0.0.1` only, refuses non-loopback connections, and serves only files within the project directory (resolved + checked against the project root). The README warns: this is a development tool — never deploy a stagecraft-serve instance to a public host. The presentation-mode HTML has no such concerns; it's a static file.

### 7.6 The collaboration loop

```
1. Agent generates initial deck            (npx stagecraft init + agent prompt)
2. Human opens deck with `serve`           (live edit mode)
3. Human iterates:
   - in storyboard, drags slide 7 into slot 4
   - in present-mode, clicks a bullet's text, fixes a typo
   - clicks a stale bullet element, pins a note: "this line is dishonest"
   - taps the storyboard tile of slide 12: "too text-heavy"
   - clicks transition between 3 → 4, picks "glitch" from the live preview
4. Server writes all changes to source     (manifest + slide files, AST-aware)
5. Human asks agent: "process my notes"
6. Agent: `grep -rn '@note' slides/`       (Level 1 + 2 notes)
   - reads each note (slide-level or pinned to an element)
   - edits the surrounding slides
   - deletes the @note: comments
   - the Level-3 typo fix needs no agent action — it's already committed
7. Browser auto-reloads via live reload
8. → loop
```

This loop is the central reason for Stagecraft's existence. Reveal.js has decktape and Slidev has Vue HMR, but neither has a dedicated annotation channel for an agent to consume. The combination of (manifest-as-data) + (notes-as-comments) + (inline-edit-as-prop-mutation) + (live reload) + (agent in the loop) is the unique value proposition.

## 8. AGENT.md — the manifesto

A single ~150-line file. Four sections:

1. **The rule** (philosophy, ~30 lines). "You're not filling a template, you're directing a scene. If your slide is fewer than three lines, it's probably boring."
2. **The toolbox** (Layer 2 + Layer 1 cheatsheet, ~60 lines). One-liner per component with a concrete example.
3. **The cookbook** (Layer 3 pointer, ~30 lines). "Read `examples/token-stream.js` before building anything with motion."
4. **The step model** (~30 lines). How `steps` + `onStep` work, when to use, when to skip.

This file is what calibrates the agent's taste. It's the most important document in the repo.

## 9. Implementation strategy

Stagecraft is built in a new repo at `/Users/d.noegel/programming/stagecraft`. The SCD-2026 deck is **not touched** while it's still in talk-ready state — it becomes the first consumer post-talk.

The work splits into three phases. Phase 1 is the core SDK (presentation-only); Phase 2 is the edit mode that makes the agent-loop tight; Phase 3 is publishing.

### Phase 1 — Core SDK (presentation-only)

1. **Engine + Phosphor theme + manifest + basic transitions.** Port from `index.html` of SCD. Implement `Stage.deck()` loader, `Stage.register()`, the step model, and the two simplest transitions (`cut`, `fade`). Verify a single slide works end-to-end.
2. **Primitives** (Layer 1). Port `staggerIn`, `emitParticle`. Add `typewriter`, `revealByDataStep`, `blinkCaret`.
3. **KineticText component** (Layer 2). Highest leverage — covers 11/25 slides. Validates the component API shape *and* the `data-stage-edit` + `data-stage-key` auto-tagging used by edit mode.
4. **SectionCard** (Layer 2). Second-most-used.
5. **Remaining four components** (ActivityList, Compare, Counter, ShiftArrow).
6. **Cookbook ports** (Layer 3). Copy bespoke slides from SCD verbatim into `examples/`, replace talk-specific strings.
7. **AGENT.md.** Write the manifesto. Test by giving Claude a fresh project and a prompt.
8. **Starter + `npx stagecraft init`.** Scaffold command. Includes `stagecraft.config.js`.

### Phase 2 — Edit Mode

9. **Dev server + live reload.** `npx stagecraft serve`. WebSocket channel, file watcher, granular reload messages (slide / manifest / theme CSS / theme JS).
10. **Full transitions library.** Implement the remaining four transitions (`slide`, `dissolve`, `glitch`, `wipe`) for Phosphor. Theme-aware overrides scaffolded.
11. **Edit mode — Level 1 (slide-level notes).** Storyboard tile icons, textarea overlays, server endpoint to write `@note:` comments. Yellow underlines on annotated tiles.
12. **Edit mode — Storyboard drag-to-reorder.** Drag handles, drop targets, server endpoint to rewrite manifest array.
13. **Edit mode — Transition picker.** Click connector icon between storyboard tiles, picker overlay with looping live preview, write to manifest.
14. **Edit mode — Level 2 (element-pin notes).** Engine auto-assigns `data-stage-key` after render. Hover outline, click-to-pin, `@note[stage-key=...]:` comments. Storyboard pin markers.
15. **Edit mode — Level 3 (inline text edit).** Components auto-tag `data-stage-edit` on text leaves. ContentEditable UX. Server-side AST roundtrip (`@babel/parser`) for safe source mutation. Error toasts for ambiguous edits.

### Phase 3 — Publish

16. **Other themes** (Paper, Neon, Brand). Phosphor is enough to validate the system; the others ship to demonstrate theme-portability.
17. **Publish to npm.** Only after dogfooding against SCD migration. Tagged `1.0.0` once Phase 1 + 2 are battle-tested.

Each step lands in its own commit. Phase 1 steps 1-3 are the riskiest API-shape decisions. Phase 2 step 15 (Level-3 AST roundtrip) is the riskiest implementation. Step 7 (AGENT.md) is the most important deliverable for the agent-first promise.

## 10. Open questions

- **Component naming.** `Stage.KineticText` vs. `Stage.Text.Kinetic` vs. just `KineticText` as a named export. Decide when implementing.
- **Animation grammar.** Should `reveal: 'per-click' | 'staggered' | 'instant'` be a fixed enum or a string that components interpret freely? Probably enum for the common cases, but components can accept a function for bespoke.
- **CSS scoping.** Components inline their CSS today (via `<style>` tags in `init`). Move to per-component CSS files, or keep inline for portability? Likely: critical styles live in `themes/<theme>/components.css`, components inject only dynamic stuff.
- **`data-stage-key` stability across re-renders.** If a slide's `render()` produces different DOM on different runs (random words, time-based content), the depth-indexed keys can shift. Probably: require deterministic render output, document that random-content slides need explicit `data-stage-key` attributes if they want to receive pinned notes.
- **AST update on multi-call slides.** If a slide file has multiple `Stage.register(...)` calls or wraps the component in a helper function, the AST resolver needs disambiguation. Likely heuristic: prefer the call that takes a `Stage.<Component>(...)` factory as argument, else fail loudly with a helpful error.
- **"Process notes" agent ergonomics.** Should the edit-mode UI include a button that copies a ready-made prompt to clipboard ("process all notes in this deck")? Maybe ship a `.claude/commands/process-notes.md` slash command in the starter.
- **Region-circle annotations (Level 4).** Shift-drag to draw a region for "this whole area needs work" feedback. Out of scope for v1; revisit if Level 1+2 prove insufficient.
- **Versioning the AGENT.md.** When AGENT.md changes, what happens to slides written against the old version? Probably: AGENT.md is mostly stable; major changes mean a major version bump.

These are explicit deferrals — they get resolved during implementation, not in this spec.
