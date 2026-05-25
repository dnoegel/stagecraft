'use strict';

Stage.register(Stage.Spotlight({
  section: 4,
  title: '04 · Spotlight',
  focus: {
    icon: 'star',
    heading: 'The bespoke slide',
    body: 'When the message deserves more than a template.'
  },
  context: [
    'Custom render(el)',
    'Custom init(el) with cleanup',
    'SVG · Canvas · Web Animations API',
    'Read examples/ for inspiration'
  ],
  reveal: 'staggered'
}), {
  notes: 'Spotlight component — one focal card surrounded by dimmed supporting items. Great for landing a single point with backup context.'
});
