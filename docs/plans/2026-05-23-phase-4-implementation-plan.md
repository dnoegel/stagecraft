# Phase 4 — Polish & Production-Ready

**Date:** 2026-05-23

## Goals

1. Full theme support — all 4 themes usable, switchable from edit mode.
2. Clean bundle — single `stagecraft.bundle.js` instead of 50 script tags.
3. CRUD — add + delete slides from storyboard (reorder already done).
4. Speaker Notes — `notes` field per slide.
5. Presenter view (multi-monitor) — laptop shows notes+timer+next, beamer shows clean slide. Sync via BroadcastChannel.
6. PDF export via Playwright.
7. Visual regression tests.
8. prefers-reduced-motion compliance.
9. Open-source basics: LICENSE, CONTRIBUTING.

## Dependency graph

```
LICENSE (independent, do first)
    │
Speaker Notes data model ─→ Presenter View ─→ PDF export
                                 │
Edit-mode UI extensions (theme picker, CRUD, process-notes button, present-mode pins)
                                 │
                                 ↓
Bundle script (depends on all components stable)
    │
Visual regression tests (depends on all of above stable)
    │
reduced-motion audit + README + LICENSE
```

## Parallelism plan

**Run as background subagents (no engine touch):**
- Bundle script (writes `scripts/bundle.js` + `dist/`)
- Paper theme polish (writes only in `themes/paper/`)
- Neon theme polish (writes only in `themes/neon/`)
- Brand theme polish (writes only in `themes/brand/`)
- Visual regression scaffolding (Playwright config + first snapshots)

**Main thread (engine + edit-mode wiring):**
- Speaker notes
- Presenter view + BroadcastChannel sync
- Theme picker in edit mode UI
- CRUD operations
- Pin notes in present mode
- Process-notes button
- PDF export integration
- reduced-motion audit
- README + LICENSE + CONTRIBUTING

## Architecture decisions

### Speaker Notes

Add optional `notes: string` to the slide registration contract:

```js
Stage.register({
  section: 2, title: 'Why now?',
  notes: 'Open by talking about the prior decade. Pause after "shift".',
  render(el) { ... }
});
```

Notes are plain strings (markdown allowed, rendered as preserved-line text). Stored alongside the slide in its own JS file, so the source-of-truth is right there next to the slide content.

### Presenter View

Same `index.html`. Activated by `?mode=presenter` query param OR by pressing `P` in present mode (which opens a new window with that param).

Layout:
```
┌──────────────────────────────┬──────────────────────────────┐
│                              │                              │
│       CURRENT SLIDE          │        NEXT SLIDE            │
│       (rendered)             │        (thumbnail)           │
│                              │                              │
├──────────────────────────────┴──────────────────────────────┤
│  TIMER (elapsed)        │  CLOCK (wall time)                │
├─────────────────────────────────────────────────────────────┤
│  SPEAKER NOTES                                              │
│  ...                                                        │
└─────────────────────────────────────────────────────────────┘
```

Two-window sync via BroadcastChannel API:
- Both windows join a channel named `stagecraft:<deckHash>` (deck hash = simple hash of manifest slides URLs).
- Each window posts navigation events (`{type: 'go', idx}`, `{type: 'step', n}`) and listens.
- The "presenter" window also originates navigation when arrows pressed.
- The "presentation" window (laptop or beamer) hides chrome but otherwise behaves as today.

### Multi-Monitor flow

User opens deck → press `P` → presenter window opens. They drag presenter window to laptop screen, presentation window to beamer (or vice versa). Press F to fullscreen the presentation. Navigation in either window updates both.

### Bundle

`scripts/bundle.js` concatenates in defined order:
1. `src/helpers.js`
2. `src/engine.js`
3. `src/transitions.js`
4. `src/components/*.js` (all)
5. `src/edit-mode.js`

Output to `dist/stagecraft.bundle.js`. Then starter `index.html` loads exactly one script: `node_modules/stagecraft/dist/stagecraft.bundle.js`. Demo deck keeps separate scripts for development clarity.

### PDF Export

`npx stagecraft export pdf [--out deck.pdf]`:
1. Starts internal server (or uses existing if running).
2. Launches Playwright headless Chromium.
3. Navigates through slides, screenshots each at viewport size.
4. Concatenates via pdf-lib OR uses Playwright's PDF API directly per slide.

Skip transitions during export. Wait for each slide to complete its `init` animations before screenshot.

### Visual Regression

Playwright config in `tests/visual/`. Test:
1. Start server against demo deck.
2. For each slide: navigate, wait for animations to settle, screenshot.
3. Compare against `baseline/` PNG. New baseline on first run.

Run: `npm run test:visual`. Run on every commit if user opts in to CI.

### reduced-motion

Add a global `@media (prefers-reduced-motion: reduce)` block per theme that:
- Disables transition animations (snap to enter/exit)
- Disables stagger reveals (everything appears immediately)
- Removes the film-grain animation, ken-burns, marquee scrolling, particle emit
- Keeps content visible — never hides anything as a "reduce" side effect

## Risk + mitigation

- **BroadcastChannel browser support**: 95%+. Fallback to localStorage events for older browsers.
- **AST-aware slide additions** (for CRUD Add): we don't generate slide code via AST, we just write a template file. The manifest is updated via the existing AST `reorderManifest`-style ops.
- **PDF export quality**: may need extra wait time per slide. Start with 800ms and tune.
- **Theme polish scope**: 50 components × 3 themes = 150 visual checks. Subagents do best-effort overrides for common patterns; perfect parity is post-MVP.

## Verification

End-to-end smoke:
- Open demo in browser → present, storyboard, edit mode all work.
- Press `P` → presenter window opens. Navigate in either, both stay in sync.
- Switch theme via picker → all 50 components still look reasonable.
- Add slide from storyboard → file written, manifest updated, browser reloads with new slide.
- Delete slide → confirmation, file removed, manifest updated.
- `npx stagecraft export pdf` → produces 52-page PDF.
- Visual regression: baseline matches across full demo deck.
