'use strict';

Stage.register(Stage.Funnel({
  section: 34,
  title: '34 · Funnel',
  stages: [
    { label: 'Awareness', value: '10k',  body: 'first touch'                 },
    { label: 'Trial',     value: '2.4k', body: 'they tried it'               },
    { label: 'Adoption',  value: '600',  body: 'used twice or more'          },
    { label: 'Champions', value: '42',   body: 'evangelise on their own', color: 'accent' }
  ],
  reveal: 'staggered'
}));
