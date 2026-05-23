'use strict';

Stage.register(Stage.Matrix2x2({
  section: 4,
  title: '04 · Matrix2x2',
  axes: {
    x: { label: 'Effort',     low: 'low',  high: 'high' },
    y: { label: 'Visual oomph', low: 'meh',  high: 'wow'  }
  },
  quadrants: [
    { x: 'low',  y: 'high', label: 'Quick wins',  body: 'Counter · ShiftArrow', color: 'accent' },
    { x: 'high', y: 'high', label: 'Showstoppers', body: 'OrchestrationGraph · TokenStream', color: 'blue' },
    { x: 'low',  y: 'low',  label: 'Fillers',      body: 'BulletList in a hurry' },
    { x: 'high', y: 'low',  label: 'Waste',        body: 'overengineered nothing', color: 'red' }
  ],
  reveal: 'per-click'
}), {
  notes: 'The classic 2x2 — but for slide-component selection. Aim for the upper half. Per-click reveal walks you through each quadrant.'
});
