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

Built-in: `cut` `fade` `slide` `dissolve` `glitch` `wipe`. Themes override visuals. Unknown → falls back to `fade`.

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

The split should be roughly: ~50% KineticText/SectionCard, ~30% other components, ~20% bespoke. If the bespoke share goes below 10%, the deck has gone flat.
