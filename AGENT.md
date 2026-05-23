# Stagecraft — Slides for Creative Directors

You're not filling a template. You're directing a scene.

**Reach for custom JS first. Reach for the component catalog when a pattern truly fits.** The 50 components below are sugar around one tiny primitive — they are anchors, never cages. Take them apart. Write raw `render(el)` and `init(el)` functions. Use the Web Animations API. Use SVG. Use Canvas. Animation is the language of your deck — not a checkbox.

If your slide reads like a filled-in form, you wasted the moment.

## 1. What a slide actually is

There is exactly one foundational API:

```js
Stage.register({
  section, title,
  render(el)       { /* set up DOM */ },
  init(el)?        { /* run animation, return cleanup */ },
  replay(el)?      { /* re-run on R */ },
  steps?, onStep?  { /* internal step navigation */ }
});
```

That's the whole contract. Everything else — every factory you'll see below — is sugar around this primitive.

### A 100% custom slide (the canonical form)

```js
Stage.register({
  section: 2,
  title: '02 · Custom motion',
  render(el) {
    el.innerHTML = `
      <h1 style="font-size: clamp(3rem, 9vw, 8rem); font-weight: 600;
                 letter-spacing: -0.025em; text-align: center;">
        Write <span class="accent">whatever HTML</span> you want.
      </h1>
      <svg id="field" viewBox="0 0 800 200"
           style="width:min(800px,80vw); height:200px; margin-top:2rem;"></svg>
    `;
  },
  init(el) {
    // Whatever JS animation you want. Web Animations API, RAF, intervals.
    const svg = el.querySelector('#field');
    const id = setInterval(() => {
      const x = Math.random() * 800;
      Stage.emitParticle(svg, x, 200, x + (Math.random() - 0.5) * 200, -20, 2400);
    }, 220);
    return () => clearInterval(id);     // cleanup when slide leaves
  }
}, {
  notes: 'Take this as proof: the catalog is optional. The full power lives here.'
});
```

That's a complete, finished slide. No factory required. You can do anything CSS, SVG, Canvas, the Web Animations API, and JS can do — which is everything.

### A factory call (sugar for common shapes)

```js
Stage.register(Stage.KineticText({
  lines: [
    { text: 'Sometimes', color: 'fg' },
    { text: 'a list of lines', color: 'dim' },
    { text: 'is enough.', color: 'accent' }
  ]
}));
```

Both forms coexist. Both accept a second `meta` arg for speaker notes (`{ notes: '...' }`).

## 2. When to write custom vs. reach for a factory

**Write a fully custom slide when:**
- The animation IS the message (token streams, particle fields, terminal logs)
- You're combining motion patterns no factory covers
- The slide is the centerpiece of a section — it deserves the time
- You can see the slide in your head and the catalog can't reproduce it

**Extend a factory's `init` when:**
- The shape fits (a bulleted list, a quote, a stat grid) but you want extra motion on top
- Get a factory, then call `Object.assign(slide, { init(el) { … } })` or write a wrapping registration

**Reach for the factory plain when:**
- It is genuinely the right pattern — list, comparison, divider — and motion sugar via `reveal: 'staggered' | 'per-click'` is enough

A healthy deck: roughly **20–30% bespoke from scratch**, **40% factory + customized init**, **30–40% plain factories**. If your bespoke share is 0%, the deck has gone flat. Add a centerpiece.

## 3. The cookbook (start here for bespoke inspiration)

Five real bespoke slides ship in `examples/` — they are not abstract demos, they are slides from a production deck. Read them before writing your own bespoke:

- `examples/token-stream.js` — interleaved word-fill across a split panel with particle emit
- `examples/orchestration-graph.js` — SVG hex-graph, particles flowing from satellites to center
- `examples/terminal-log.js` — streaming colored log lines + a "human realization" reveal arc
- `examples/whoami.js` — terminal prompt cycling through identity strings
- `examples/closing-card.js` — QR + dedication + underline + presenter names

These show you the bar. Don't copy them — take the *technique* (the interleaved queue, the SVG particle pattern, the streaming type) and apply it to your own content.

## 4. The toolbox (Layer-2 components — reference)

Components have spare defaults on purpose. Adding animation is opt-in. Treat this whole section as a *reference* — scan when you need an anchor, ignore otherwise.

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

### Data-viz family (10)

#### Stage.KPI — hero metric card
```js
Stage.register(Stage.KPI({
  section: 8, value: 42_300, unit: '€',
  label: 'monthly recurring revenue',
  change: { value: 18, direction: 'up', period: 'QoQ' },
  color: 'accent', icon: 'trending_up'
}));
```

#### Stage.DonutChart — pie/donut with segments
```js
Stage.register(Stage.DonutChart({
  section: 8,
  segments: [
    { label: 'Engineering', value: 12, color: 'accent' },
    { label: 'Sales',       value: 7,  color: 'amber'  },
    { label: 'Ops',         value: 3,  color: 'blue'   }
  ],
  centerLabel: 'headcount',
  reveal: 'animated'
}));
```

#### Stage.LineChart — multi-series line/area chart
```js
Stage.register(Stage.LineChart({
  section: 8,
  xLabels: ['Q1','Q2','Q3','Q4'],
  series: [
    { label: 'Revenue', color: 'accent', points: [12, 18, 24, 32] },
    { label: 'Cost',    color: 'amber',  points: [8, 11, 14, 17]  }
  ],
  area: true,
  reveal: 'animated'
}));
```

#### Stage.Gauge — semi-circular progress meter
```js
Stage.register(Stage.Gauge({
  section: 8, value: 73, max: 100,
  label: 'capacity used', color: 'amber', ticks: 5
}));
```

#### Stage.SparkLine — number + tiny inline trend
```js
Stage.register(Stage.SparkLine({
  section: 8, value: 1247, label: 'daily signups',
  points: [820, 880, 910, 1050, 1100, 1180, 1247],
  color: 'accent', period: 'past 7 days'
}));
```

#### Stage.Heatmap — calendar-style intensity grid
```js
Stage.register(Stage.Heatmap({
  section: 8, rows: 7, cols: 12,
  data: [[1,3,5,...], [2,4,6,...], ...],
  color: 'accent',
  xLabels: ['Jan','Feb','Mar', ...],
  yLabels: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']
}));
```

#### Stage.Roadmap — quarterly swimlanes
```js
Stage.register(Stage.Roadmap({
  section: 8,
  months: ['Q1','Q2','Q3','Q4'],
  lanes: [
    { label: 'Platform', color: 'accent', bars: [{start:0, end:2, label:'auth'}, {start:2, end:4, label:'billing'}] },
    { label: 'Growth',   color: 'amber',  bars: [{start:1, end:3, label:'onboarding'}] }
  ],
  reveal: 'staggered'
}));
```

#### Stage.SWOT — strengths/weaknesses/opportunities/threats
```js
Stage.register(Stage.SWOT({
  section: 8,
  strengths:     ['fast iteration', 'small team'],
  weaknesses:    ['no enterprise sales'],
  opportunities: ['LLM tailwind', 'market shift'],
  threats:       ['incumbents catching up'],
  reveal: 'per-click'
}));
```

#### Stage.CodeBlock — syntax-highlighted code
```js
Stage.register(Stage.CodeBlock({
  section: 8,
  language: 'javascript',
  fileName: 'engine.js',
  code: `function go(idx) {\n  if (idx < 0) return;\n  current = idx;\n}`,
  highlight: [2],
  reveal: 'typewriter'
}));
```

#### Stage.CodeDiff — unified diff with +/- lines
```js
Stage.register(Stage.CodeDiff({
  section: 8, fileName: 'engine.js',
  lines: [
    { type: 'context', text: 'function go(idx) {' },
    { type: 'remove',  text: '  if (idx < 0) return;' },
    { type: 'add',     text: '  if (idx < 0 || idx >= slides.length) return;' },
    { type: 'context', text: '  current = idx;' },
    { type: 'context', text: '}' }
  ],
  reveal: 'staggered'
}));
```

### Business family (10)

#### Stage.Pricing — N tiers with features
```js
Stage.register(Stage.Pricing({
  section: 9,
  tiers: [
    { name: 'Free',    price: '$0',  period: '/mo', features: ['1 deck', 'public sharing'] },
    { name: 'Pro',     price: '$12', period: '/mo', features: ['unlimited decks', 'edit mode', 'all themes'], featured: true, ctaLabel: 'Start trial' },
    { name: 'Team',    price: '$48', period: '/mo', features: ['everything Pro', '5 seats', 'analytics'] }
  ],
  reveal: 'staggered'
}));
```

#### Stage.Testimonial — quote with photo + logo
```js
Stage.register(Stage.Testimonial({
  section: 9,
  quote: 'It cut our deck-prep time by 80%.',
  author: { name: 'Jane Doe', role: 'VP Product', company: 'Acme', photo: 'photo.jpg', logo: 'logo.svg' }
}));
```

#### Stage.TeamGrid — N people cards
```js
Stage.register(Stage.TeamGrid({
  section: 9, columns: 3,
  people: [
    { name: 'Ada Lovelace', role: 'Founder', photo: 'ada.jpg', bio: 'wrote the first program' },
    { name: 'Alan Turing',  role: 'CTO',     photo: 'alan.jpg', social: { linkedin: '…' } }
  ]
}));
```

#### Stage.Agenda — timed schedule
```js
Stage.register(Stage.Agenda({
  section: 9,
  items: [
    { time: '09:00', label: 'Kickoff',    duration: '30m', icon: 'flag' },
    { time: '09:30', label: 'Deep dive',  duration: '90m', icon: 'psychology' },
    { time: '11:00', label: 'Demo',       duration: '20m', icon: 'play_arrow' }
  ],
  reveal: 'per-click'
}));
```

#### Stage.Checklist — checked/unchecked items
```js
Stage.register(Stage.Checklist({
  section: 9,
  items: [
    { text: 'set up project',    done: true },
    { text: 'wire up auth',      done: true },
    { text: 'write tests',       done: false, body: 'integration first' },
    { text: 'ship it' }
  ],
  reveal: 'staggered'
}));
```

#### Stage.Steps — numbered tutorial steps
```js
Stage.register(Stage.Steps({
  section: 9,
  steps: [
    { number: 1, label: 'install', icon: 'download', body: 'npm i stagecraft' },
    { number: 2, label: 'init',    icon: 'create',   body: 'npx stagecraft init' },
    { number: 3, label: 'present', icon: 'play_arrow', body: 'open index.html' }
  ],
  orientation: 'horizontal',
  reveal: 'per-click'
}));
```

#### Stage.CTA — call to action
```js
Stage.register(Stage.CTA({
  section: 9,
  headline: 'Start building today',
  body: 'No credit card required.',
  action: { label: 'Sign up', hint: '→' },
  accent: true
}));
```

#### Stage.Callout — colored sidebar box
```js
Stage.register(Stage.Callout({
  section: 9,
  kind: 'warning',         // 'info' | 'tip' | 'warning' | 'danger' | 'success'
  icon: 'warning',
  heading: 'Heads up',
  body: 'Don\'t run this in production without backing up the database.'
}));
```

#### Stage.Tip — compact emphasis box
```js
Stage.register(Stage.Tip({
  section: 9, kind: 'tip',
  icon: 'lightbulb',
  body: 'Combining BarChart with reveal: per-click makes a great explainer.'
}));
```

#### Stage.BeforeAfter — split comparison
```js
Stage.register(Stage.BeforeAfter({
  section: 9,
  before: { label: 'BEFORE', image: { src: 'old.jpg' } },
  after:  { label: 'AFTER',  image: { src: 'new.jpg' } },
  reveal: 'slider'   // 'slider' animates the divider from 0 → 50%
}));
```

### Content / typography family (8)

#### Stage.Statement — single massive declarative
```js
Stage.register(Stage.Statement({
  section: 10,
  text: 'We are not in the widget business. We are in the trust business.',
  emphasis: ['trust']
}));
```

#### Stage.QandA — question + answer
```js
Stage.register(Stage.QandA({
  section: 10,
  question: 'What slows teams down most?',
  answer: 'Unclear ownership.',
  attribution: 'observed across 47 projects'
}));
```

#### Stage.Manifesto — numbered "We believe…"
```js
Stage.register(Stage.Manifesto({
  section: 10,
  intro: 'We believe...',
  declarations: [
    { text: 'Software should be honest.',      emphasis: ['honest'] },
    { text: 'Defaults should be excellent.',   emphasis: ['excellent'] },
    { text: 'Customers should never wait.',    emphasis: ['never wait'] }
  ],
  reveal: 'per-click'
}));
```

#### Stage.Punchline — buildup + payoff
```js
Stage.register(Stage.Punchline({
  section: 10,
  buildup: [
    'We tried scaling the team.',
    'We tried adding tools.',
    'We tried more meetings.'
  ],
  payoff: 'What worked was deleting code.',
  reveal: 'manual'
}));
```

#### Stage.Definition — dictionary-style entry
```js
Stage.register(Stage.Definition({
  section: 10,
  term: 'stagecraft',
  definition: 'a small JavaScript library for cinematic, agent-authored presentations.',
  etymology: 'from "stage" + "-craft"',
  examples: ['Stagecraft handled the keynote deck beautifully.']
}));
```

#### Stage.ImageGrid — gallery
```js
Stage.register(Stage.ImageGrid({
  section: 10, columns: 3,
  images: [
    { src: 'a.jpg', caption: 'one' },
    { src: 'b.jpg', caption: 'two' },
    { src: 'c.jpg' }
  ],
  reveal: 'cascade'
}));
```

#### Stage.Spotlight — focus + context strip
```js
Stage.register(Stage.Spotlight({
  section: 10,
  focus: { heading: 'The big one',  body: 'this is what matters', icon: 'star' },
  context: ['supporting fact 1', 'supporting fact 2', 'supporting fact 3'],
  reveal: 'staggered'
}));
```

#### Stage.Marquee — scrolling ticker
```js
Stage.register(Stage.Marquee({
  section: 10,
  items: ['shipped 2024-01', 'shipped 2024-02', 'shipped 2024-03', 'shipped 2024-04'],
  direction: 'left', speed: 'medium', double: true
}));
```

## 5. The toolbox (Layer-1 primitives)

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

## 6. The step model

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

## 7. The transition library

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

## 8. Edit mode (you-might-not-see-it, but: it exists)

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

## 9. The full component catalog at a glance

| Family | Components |
|---|---|
| **Core (6)** | KineticText · SectionCard · ActivityList · Compare · Counter · ShiftArrow |
| **Layout (6)** | ImageText · FullImage · Quote · BigNumber · Stats · Bento |
| **Diagram (5)** | Pillars · Timeline · Pyramid · Cycle · Funnel |
| **Chart (5)** | Matrix2x2 · BarChart · Progress · ProcessFlow · Venn |
| **Data-viz (10)** | KPI · DonutChart · LineChart · Gauge · SparkLine · Heatmap · Roadmap · SWOT · CodeBlock · CodeDiff |
| **Business (10)** | Pricing · Testimonial · TeamGrid · Agenda · Checklist · Steps · CTA · Callout · Tip · BeforeAfter |
| **Content (8)** | Statement · QandA · Manifesto · Punchline · Definition · ImageGrid · Spotlight · Marquee |
| **Bespoke (5)** | TokenStream · OrchestrationGraph · TerminalLog · Whoami · ClosingCard (cookbook in `examples/`) |

**50 anchored components + 5 cookbook bespoke patterns + 15 transitions.** Pick the closest anchor, then customize. Animate. Pace. **Direct the scene.**

## 10. Speaker notes

Slides take an optional second arg to `Stage.register` for metadata. The most common field is `notes`:

```js
Stage.register(Stage.KineticText({...}), {
  notes: 'Pause after the third line. The audience needs the beat.'
});
```

Notes show only in the **Presenter View** (`P` opens a second window with current + next + notes + timer). They're editable via the 🎙 button on each storyboard tile.

## 11. Themes (5)

| | |
|---|---|
| `phosphor` (default) | dark, JetBrains Mono, phosphor-green |
| `paper`              | light, Inter + Source Serif 4, navy |
| `neon`               | dark, magenta + cyan, heavy glow |
| `brand`              | dark, Inter, blue, schlicht |
| `shopware`           | light, Inter, brand-blue `#0870ff` — sourced from Shopware's Meteor design tokens |

Switch live from the storyboard, or set `data-theme="..."` on `<html>` and link the matching CSS bundle.

## 12. Keyboard cheat sheet

`→ ← Space` navigate · `1-9` jump to section · `R` replay · `F` fullscreen
`S` storyboard · `P` presenter window · `E` toggle edit mode · `N` slide-level note
`?` show hint · `Esc` close overlay
