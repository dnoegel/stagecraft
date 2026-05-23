'use strict';

Stage.register(Stage.ShiftArrow({
  section: 2,
  title: '02 · The step model',
  from: 'one click → one slide',
  to: 'one click → one beat'
}), {
  notes: 'Slides can have internal steps. Set steps: N and onStep(el, step) — and ←/→ now navigate beats within a slide before moving on. Bullet reveals, particle emits, glow on click — all freely scriptable.'
});
