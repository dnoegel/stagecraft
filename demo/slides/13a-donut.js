'use strict';

Stage.register(Stage.DonutChart({
  section: 4,
  title: '04 · DonutChart',
  segments: [
    { label: 'Custom JS',         value: 25, color: 'accent' },
    { label: 'Factory + tweaks',  value: 40, color: 'blue'   },
    { label: 'Plain factories',   value: 35, color: 'amber'  }
  ],
  centerLabel: 'time spent',
  reveal: 'animated'
}), {
  notes: 'SVG donut. Each arc grows from 0 to its segment share on init. The split is the recommended mix from AGENT.md — bespoke, hybrid, factory.'
});
