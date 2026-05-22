# Implementation Plan — Stagecraft

**Date:** 2026-05-22
**Spec:** `docs/specs/2026-05-22-stagecraft-sdk-design.md`

## Strategy

Build foundation first (engine + Phosphor), then parallelize independent work (components, themes, cookbook, dev server). Edit mode comes last because it depends on everything else.

## Order

1. **Foundation**
   - Repo skeleton + `package.json` (deps: chokidar, ws, @babel/parser, @babel/generator, @babel/traverse, mime-types)
   - `src/engine.js` — `Stage.register`, `Stage.deck` loader, navigation, step model, storyboard, transitions hook, edit-mode WebSocket attempt
   - `src/helpers.js` — staggerIn, emitParticle, typewriter, revealByDataStep, blinkCaret, sessionElapsedClock
   - `themes/phosphor/` — tokens.css, base.css, components.css

2. **Layer 2 + Cookbook (parallelizable after foundation)**
   - 6 components (KineticText, SectionCard, ActivityList, Compare, Counter, ShiftArrow) with `data-stage-key` + `data-stage-edit` auto-tagging
   - 5 cookbook examples (token-stream, orchestration-graph, terminal-log, whoami, closing-card)

3. **Transitions library**
   - 6 transitions (cut, fade, slide, dissolve, glitch, wipe) in `src/transitions.js` + theme CSS

4. **Dev server**
   - `bin/serve.js` — HTTP + WebSocket (`ws://localhost:3000/stagecraft`), chokidar watcher, endpoints:
     - `POST /api/note/slide` — write slide-level note
     - `POST /api/note/element` — write element-pin note
     - `POST /api/edit/inline` — AST-aware string replacement
     - `POST /api/manifest/reorder` — rewrite slide array
     - `POST /api/manifest/transition` — set transition on slide

5. **Edit-mode UI** (browser-side)
   - WebSocket client + live reload
   - Storyboard: drag-to-reorder, note icon per tile, transition connectors
   - Present mode: element hover/click for pin notes, double-click for inline edit
   - Picker overlays: note textarea, transition picker with live preview

6. **AGENT.md** — the manifesto (~150 lines)

7. **Init command + starter** — `bin/init.js` + `starter/`

8. **Other themes** — Paper, Neon, Brand (token sets + minimal base)

9. **README + smoke-test demo** — `demo/` deck that exercises all components and transitions

## Verification approach

- **Syntax & loadability**: `node -e "require('./src/engine.js')"` for each JS file
- **Smoke test**: a `demo/` deck with one slide of each component. Open `demo/index.html` and navigate manually (browser test scripts left for the user since I can't drive a browser interactively).
- **Edit mode**: `npx stagecraft serve` against the demo deck — verify WS connects, file changes reload, a note write hits disk.

## Out of scope for this session

- Publishing to npm (Phase 3 step 17 in spec) — manual.
- Migrating SCD-2026 deck to Stagecraft — post-talk activity.
- Region-circle annotations (Level 4) — explicit Phase-2 deferral in spec.
