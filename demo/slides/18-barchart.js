'use strict';

Stage.register(Stage.BarChart({
  section: 4,
  title: '04 · BarChart',
  orientation: 'horizontal',
  unit: ' lines',
  bars: [
    { label: 'Engine',     value: 562, color: 'accent' },
    { label: 'Edit Mode',  value: 850, color: 'blue'   },
    { label: 'Components', value: 5152, color: 'amber' },
    { label: 'Helpers',    value: 168 },
    { label: 'Bundle',     value: 140 }
  ],
  reveal: 'animated'
}), {
  notes: 'Real numbers from this repo. The bars grow from 0 on slide entry. Use this for any "X by category" story.'
});
