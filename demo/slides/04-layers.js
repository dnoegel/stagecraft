'use strict';

Stage.register(Stage.Pillars({
  section: 2,
  title: '02 · The layers',
  intro: 'Four layers, each with one clear purpose:',
  pillars: [
    { icon: 'memory',         heading: 'Engine',     body: 'navigation, steps, storyboard, transitions' },
    { icon: 'extension',      heading: 'Primitives', body: 'staggerIn, typewriter, particles' },
    { icon: 'dashboard',      heading: 'Components', body: '50 anchors across 7 families' },
    { icon: 'menu_book',      heading: 'Cookbook',   body: 'bespoke examples — the real teachers' }
  ],
  reveal: 'staggered'
}), {
  notes: 'The engine handles the runtime. Primitives are tiny composable helpers. Components are anchors for the trivial 30%. The cookbook is how the agent learns the bar for the other 70%.'
});
