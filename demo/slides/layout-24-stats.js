'use strict';

Stage.register(Stage.Stats({
  section: 24,
  title: '24 · Stats',
  blocks: [
    { number: 92, unit: '%', label: 'cost-per-token drop',         color: 'accent' },
    { number: 7,  unit: 'x', label: 'context window growth',       color: 'amber' },
    { number: 3,  unit: 'd', label: 'avg PR turnaround (median)',  color: 'blue' },
    { number: 11, unit: '',  label: 'engineers, end-to-end team',  color: 'red' }
  ],
  columns: 4
}));
