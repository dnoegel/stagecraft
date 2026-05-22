# Stagecraft — Slides for Creative Directors

You're not filling a template. You're directing a scene.

If your slide is fewer than three lines, it's probably boring. The components below are anchors, not cages. Take them apart. Add particles, typewriters, glitch transitions, SVG. The Web Animations API is your friend.

## 1. The rule

- A deck is a collection of `.js` files registered via `Stage.register({...})`.
- Each slide owns its DOM, its animation, its lifecycle.
- The engine handles navigation, the storyboard, and transitions.
- If you copy-paste a component call and don't customize it, you've wasted the opportunity.

## 2. The toolbox (Layer-2 components)

Components have spare defaults on purpose. Adding animation is opt-in.

### Stage.KineticText — multi-line staggered reveal (workhorse, ~50% of slides)
```js
Stage.register(Stage.KineticText({
  section: 2,
  title: '02 · The shift',
  pace: 800,
  lines: [
    { text: 'You start with a sentence.', color: 'fg' },
    { text: 'You end with the sentence',  color: 'dim' },
    { text: 'rewritten.',                 color: 'accent', pause: 800 }
  ]
}));
```
Colors: `fg` `dim` `accent` `amber` `blue`. `pause` is extra ms before that line.

### Stage.SectionCard — section divider
```js
Stage.register(Stage.SectionCard({
  section: 3, number: '03',
  title: 'Where the work goes',
  tag: 'time and attention'
}));
```

### Stage.ActivityList — numbered items (num · name · description)
```js
Stage.register(Stage.ActivityList({
  section: 3,
  items: [
    { num: '01', name: 'Problem framing', desc: 'understand the actual ask' },
    { num: '02', name: 'Architecture',    desc: 'pick the shape' }
  ],
  reveal: 'staggered'   // 'staggered' | 'per-click' | 'instant'
}));
```

### Stage.Compare — two-column comparison
```js
Stage.register(Stage.Compare({
  section: 4,
  left:  { heading: 'OLD', items: ['type', 'compile'], style: 'strikethrough' },
  right: { heading: 'NEW', items: ['describe', 'review'], style: 'accent' },
  reveal: 'staggered'
}));
```

### Stage.Counter — live numeric counters
```js
Stage.register(Stage.Counter({
  section: 4,
  blocks: [
    { label: 'Lines written',  start: 0, perSecond: 47, color: 'accent' },
    { label: 'Bugs introduced', start: 0, perSecond: 3,  color: 'amber' }
  ],
  footer: 'Both numbers are wrong.'
}));
```

### Stage.ShiftArrow — `from → to` mental model
```js
Stage.register(Stage.ShiftArrow({
  section: 6, from: 'writing code', to: 'reviewing code'
}));
```

### Layout family

#### Stage.ImageText — image one side, text the other
```js
Stage.register(Stage.ImageText({
  section: 3,
  image: { src: 'assets/photo.jpg', alt: '...' },
  side: 'left',                              // or 'right'
  heading: 'The thing',
  body: 'First sentence.\nSecond sentence.', // \n staggers per line
  caption: 'optional small dim line',
  reveal: 'staggered'
}));
```

#### Stage.FullImage — full-bleed image with optional overlay
```js
Stage.register(Stage.FullImage({
  section: 4,
  image: { src: 'assets/landscape.jpg', alt: '...' },
  overlay: { position: 'bottom-left', headline: 'BIG IDEA', body: 'small subtitle' }
}));
```
Without `overlay`: subtle ken-burns drift. Positions: `center`, `top`, `bottom-left`, `bottom-right`.

#### Stage.Quote — large quote with attribution
```js
Stage.register(Stage.Quote({
  section: 2,
  quote: 'The best way to predict the future is to invent it.',
  author: 'Alan Kay',
  role: 'computer scientist',
  source: '1971'
}));
```

#### Stage.BigNumber — one huge number + label
```js
Stage.register(Stage.BigNumber({
  section: 4,
  number: 47, unit: 'x',
  label: 'productivity multiplier',
  caption: 'observed on a focused refactor'
}));
```
Counts up from 0 to target on init.

#### Stage.Stats — grid of statistic cards
```js
Stage.register(Stage.Stats({
  section: 4,
  blocks: [
    { number: 12, unit: 'k', label: 'commits',   color: 'accent' },
    { number: 47, unit: 'x', label: 'speedup',   color: 'amber'  },
    { number: 99, unit: '%', label: 'caffeine',  color: 'blue'   }
  ],
  columns: 3
}));
```

#### Stage.Bento — 2026 modular grid
```js
Stage.register(Stage.Bento({
  section: 5,
  cells: [
    { span: 2, heading: 'Hero',   body: 'wide cell',   color: 'accent' },
    {           heading: 'Stat',  body: '...',         image: { src: 'a.jpg' } },
    {           heading: 'Quote', body: '...' },
    { span: 2, heading: 'Note',   body: 'wide cell' }
  ]
}));
```

### Diagram family

#### Stage.Pillars — N columns with material icons
```js
Stage.register(Stage.Pillars({
  section: 5,
  intro: 'Three pillars',
  pillars: [
    { icon: 'bolt',       heading: 'Speed',  body: 'iterate fast' },
    { icon: 'shield',     heading: 'Safety', body: 'never break prod' },
    { icon: 'visibility', heading: 'Clarity', body: 'see what you ship' }
  ],
  reveal: 'staggered'   // | 'per-click' | 'instant'
}));
```
Icons are Material Symbols Outlined names. See https://fonts.google.com/icons.

#### Stage.Timeline — milestones along a line
```js
Stage.register(Stage.Timeline({
  section: 5,
  orientation: 'horizontal',  // or 'vertical'
  events: [
    { date: '2024 Q1', heading: 'idea', icon: 'lightbulb' },
    { date: '2024 Q3', heading: 'prototype', icon: 'science' },
    { date: '2025 Q1', heading: 'launch', icon: 'rocket_launch', color: 'accent' }
  ],
  reveal: 'per-click'
}));
```

#### Stage.Pyramid — stacked tiers
```js
Stage.register(Stage.Pyramid({
  section: 6,
  layers: [
    { label: 'Vision',   body: 'where to' },
    { label: 'Strategy', body: 'how to'   },
    { label: 'Tactics',  body: 'do what'  }
  ],
  orientation: 'up',     // narrowest layer on top
  reveal: 'staggered'
}));
```

#### Stage.Cycle — circular arrangement
```js
Stage.register(Stage.Cycle({
  section: 6,
  items: [
    { label: 'Plan',    icon: 'edit_note' },
    { label: 'Build',   icon: 'construction' },
    { label: 'Measure', icon: 'monitor_heart' },
    { label: 'Learn',   icon: 'school' }
  ],
  reveal: 'rotate'   // spins in on entry
}));
```

#### Stage.Funnel — narrowing stages
```js
Stage.register(Stage.Funnel({
  section: 6,
  stages: [
    { label: 'Visitors',  value: '10,000' },
    { label: 'Trials',    value: '1,200'  },
    { label: 'Customers', value: '180',   color: 'accent' }
  ],
  reveal: 'staggered'
}));
```

### Chart family

#### Stage.Matrix2x2 — quadrant chart (Eisenhower-style)
```js
Stage.register(Stage.Matrix2x2({
  section: 7,
  axes: {
    x: { label: 'Effort', low: 'low', high: 'high' },
    y: { label: 'Impact', low: 'low', high: 'high' }
  },
  quadrants: [
    { x: 'low',  y: 'high', label: 'Quick wins', color: 'accent' },
    { x: 'high', y: 'high', label: 'Big bets',   color: 'blue'   },
    { x: 'low',  y: 'low',  label: 'Fill-ins'                    },
    { x: 'high', y: 'low',  label: 'Time sinks', color: 'red'    }
  ],
  reveal: 'per-click'
}));
```

#### Stage.BarChart — simple bars
```js
Stage.register(Stage.BarChart({
  section: 7,
  orientation: 'horizontal',     // or 'vertical'
  bars: [
    { label: 'A', value: 42, color: 'accent' },
    { label: 'B', value: 78, color: 'amber' },
    { label: 'C', value: 31 }
  ],
  unit: 'h',
  reveal: 'animated'             // 0 → value tween
}));
```

#### Stage.Progress — stacked progress bars
```js
Stage.register(Stage.Progress({
  section: 7,
  items: [
    { label: 'Coverage',  value: 87 },                  // /100
    { label: 'Refactor',  value: 3, total: 5 },         // /5
    { label: 'Migration', value: 42, total: 100, color: 'amber' }
  ],
  reveal: 'animated'
}));
```

#### Stage.ProcessFlow — N → N → N with arrows
```js
Stage.register(Stage.ProcessFlow({
  section: 7,
  orientation: 'horizontal',     // or 'vertical'
  steps: [
    { icon: 'edit',      label: 'Draft' },
    { icon: 'visibility', label: 'Review' },
    { icon: 'check',     label: 'Ship', color: 'accent' }
  ],
  reveal: 'per-click'
}));
```

#### Stage.Venn — 2 or 3 overlapping circles
```js
Stage.register(Stage.Venn({
  section: 7,
  sets: [
    { label: 'speed',   color: 'accent' },
    { label: 'quality', color: 'amber' },
    { label: 'cost',    color: 'blue'  }
  ],
  overlaps: [
    { ids: [0, 1],     label: 'real eng' },
    { ids: [0, 2],     label: 'hack' },
    { ids: [1, 2],     label: 'craft' },
    { ids: [0, 1, 2],  label: 'unicorn' }
  ],
  reveal: 'staggered'
}));
```

## 3. The toolbox (Layer-1 primitives)

Available globally as `Stage.<name>`. Use them in any slide's `init()` to build bespoke motion.

| Primitive | Signature | What |
|---|---|---|
| `staggerIn` | `(nodes, step=200, initial=100) → cleanup` | Add `.in` class to nodes one after another. Pairs with `.stagger > *` CSS. |
| `typewriter` | `(el, text, {speed, jitter, onDone}) → cleanup` | Character-by-character text reveal. |
| `emitParticle` | `(parent, x1, y1, x2, y2, dur=800) → cleanup` | SVG particle traveling between two points. |
| `revealByDataStep` | `(el, step)` | Show `[data-step=N]` elements where N ≤ step. Pass as `onStep`. |
| `blinkCaret` | `(el) → cleanup` | Attach a blinking caret. |
| `sessionElapsedClock` | `({start}) → {el, stop}` | Live MM:SS clock element. |
| `assignStageKeys` | `(root)` | Auto-assigns `data-stage-key` for edit-mode pins (engine calls this). |

## 4. The cookbook

When you need motion that the components don't cover, **read these first** — they're the ceiling, not the floor. All in `examples/`:

- `examples/token-stream.js` — interleaved word-fill across a split panel, particle emit.
- `examples/orchestration-graph.js` — SVG hex-graph with particles flowing from satellites to center.
- `examples/terminal-log.js` — streaming colored log lines with a human realization reveal.
- `examples/whoami.js` — terminal prompt cycling through identity strings.
- `examples/closing-card.js` — QR + dedication + underline.

Don't copy them verbatim. Take the technique (the interleaved queue, the SVG particle pattern, the streaming type) and apply it to your own content.

## 5. The step model

A slide may declare `steps: N`. The engine:

- Tracks `currentStep` (starts at 0).
- On `→`: if `currentStep < N-1`, increment and call `onStep(el, currentStep)`. Otherwise advance to next slide.
- On `←`: mirror.
- On `R`: reset to step 0, re-run `init`.

```js
Stage.register({
  section: 5, title: 'reveal each',
  steps: 3,
  render(el) {
    el.innerHTML = `
      <ul>
        <li data-step="1">First insight</li>
        <li data-step="2">Second insight</li>
        <li data-step="3">Third insight</li>
      </ul>`;
  },
  onStep: Stage.revealByDataStep
});
```

For trivial cases use `Stage.revealByDataStep`. For anything richer (glow transitions, particle emit, typewriter on each step) write `onStep` yourself — that's the point.

## 6. The transition library

In `stagecraft.config.js`, the `transition` on each slide controls how it enters:

```js
Stage.deck({
  theme: 'phosphor',
  slides: [
    { src: 'slides/00-title.js' },
    { src: 'slides/01-shift.js',  transition: 'fade' },
    { src: 'slides/02-impact.js', transition: 'glitch' }
  ]
});
```

Built-in (14):

| | | |
|---|---|---|
| `cut` — hard, instant | `fade` — crossfade | `slide` — push from right |
| `dissolve` — slow blur fade | `glitch` — scanlines + RGB shift | `wipe` — masked sweep |
| `zoom-in` — scale up from small | `zoom-out` — start large, shrink | `flip` — 3D Y-axis rotate |
| `iris` — circular reveal | `shutter` — horizontal bands | `push` — strong horizontal push |
| `typewriter` — scaleX 0 → 1 | `shatter` — pixelated resolve | |

Themes override visuals. Unknown → falls back to `fade`.

## 7. Edit mode (you-might-not-see-it, but: it exists)

When the human runs `npx stagecraft serve`, they get a browser-based editor that writes back to source. They might leave notes in slides:

```js
// @note: too text-heavy, split into two slides
// @note[stage-key="KineticText/line[2]"]: this line is dishonest
Stage.register(Stage.KineticText({ ... }));
```

When they say "process my notes":
1. `grep -rn '@note' slides/`
2. Read each note + the slide it's attached to
3. Edit the slide accordingly
4. **Delete the `@note:` lines** (absence ⇔ resolved)

Notes don't get a "resolved" state. Deleting them is how you mark them done.

## 8. When to register a custom slide vs. use a component

Use a component when:
- It's truly a list of bullets / a comparison / a section divider — boring is fine for these.
- The visual you want is achievable with one component + minor styling.

Write a custom slide (just `Stage.register({section, title, render, init, ...})`) when:
- The animation is core to the message (token-stream, orchestration graph, terminal log).
- You're combining motion patterns no component covers.
- The slide is the centerpiece of a section — it deserves the attention.

The split should be roughly: ~40% workhorse components (KineticText, SectionCard, Quote, BigNumber), ~30% structural (ImageText, Bento, Compare, Pillars, Timeline), ~15% chart/diagram for data-heavy moments (BarChart, Matrix2x2, Pyramid, Funnel, Venn, ProcessFlow, Cycle), ~15% bespoke. If the bespoke share goes below 10%, the deck has gone flat.

## 9. The full component catalog at a glance

| Family | Components |
|---|---|
| **Core** | KineticText · SectionCard · ActivityList · Compare · Counter · ShiftArrow |
| **Layout** | ImageText · FullImage · Quote · BigNumber · Stats · Bento |
| **Diagram** | Pillars · Timeline · Pyramid · Cycle · Funnel |
| **Chart** | Matrix2x2 · BarChart · Progress · ProcessFlow · Venn |
| **Bespoke** | TokenStream · OrchestrationGraph · TerminalLog · Whoami · ClosingCard (cookbook in `examples/`) |

22 anchored components + 5 cookbook bespoke patterns. Pick the closest anchor, then customize. Animate. Pace. **Direct the scene.**
