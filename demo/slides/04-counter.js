'use strict';

Stage.register(Stage.Counter({
  section: 2,
  title: '02 · Live numbers',
  blocks: [
    { label: 'Lines generated',  start: 0, perSecond: 47, color: 'accent' },
    { label: 'Bugs introduced',   start: 0, perSecond: 3,  color: 'amber' }
  ],
  footer: 'Both numbers are wrong.'
}));
