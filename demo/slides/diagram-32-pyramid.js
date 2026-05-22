'use strict';

Stage.register(Stage.Pyramid({
  section: 32,
  title: '32 · Pyramid',
  orientation: 'up',
  layers: [
    { label: 'Vision',  body: 'rare',                      color: 'accent' },
    { label: 'Taste',   body: 'felt, not taught',          color: 'blue'   },
    { label: 'Skill',   body: 'practiced'                                 },
    { label: 'Effort',  body: 'available to anyone',       color: 'dim'    }
  ],
  reveal: 'staggered'
}));
