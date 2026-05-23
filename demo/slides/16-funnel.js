'use strict';

Stage.register(Stage.Funnel({
  section: 4,
  title: '04 · Funnel',
  stages: [
    { label: 'Slide ideas',   value: '∞' },
    { label: 'Drafted',       value: '40' },
    { label: 'Rehearsed',     value: '24' },
    { label: 'Shipped',       value: '12', color: 'accent' }
  ],
  reveal: 'staggered'
}), {
  notes: 'Funnel — narrows from top to bottom. Good for conversion-style stories or "many → few" reductions.'
});
