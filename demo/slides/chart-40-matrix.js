'use strict';

Stage.register(Stage.Matrix2x2({
  section: 4,
  title: '04 · effort vs impact',
  axes: {
    x: { label: 'effort', low: 'low',  high: 'high' },
    y: { label: 'impact', low: 'low',  high: 'high' }
  },
  quadrants: [
    { x: 'low',  y: 'high', label: 'Quick wins',  body: 'do these first',          color: 'accent' },
    { x: 'high', y: 'high', label: 'Big bets',    body: 'plan, then commit',       color: 'blue' },
    { x: 'low',  y: 'low',  label: 'Fill-ins',    body: 'spare cycles only',       color: 'dim' },
    { x: 'high', y: 'low',  label: 'Money pit',   body: 'avoid — kill on sight',   color: 'red' }
  ],
  reveal: 'per-click'
}));
