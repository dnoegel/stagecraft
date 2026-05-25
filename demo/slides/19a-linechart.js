'use strict';

Stage.register(Stage.LineChart({
  section: 4,
  title: '04 · LineChart',
  xLabels: ['v0.1', 'v0.2', '0.2.1', 'next'],
  series: [
    { label: 'Components', color: 'accent', points: [6, 22, 50, 60] },
    { label: 'Transitions', color: 'blue', points: [6, 14, 15, 15] }
  ],
  area: true,
  reveal: 'animated'
}), {
  notes: 'Multi-series line chart with stroke-dasharray draw-in animation. Optional filled area underneath. The numbers track Stagecraft\'s own catalog growth.'
});
