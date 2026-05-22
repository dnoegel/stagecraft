'use strict';

Stage.register(Stage.LineChart({
  section: 52,
  title: '52 · LineChart',
  series: [
    { label: 'agentic',   color: 'accent', points: [ 6, 12, 21, 38, 55, 74, 92] },
    { label: 'baseline',  color: 'blue',   points: [ 6,  8, 11, 14, 18, 22, 27] }
  ],
  xLabels: ['Jan','Feb','Mar','Apr','May','Jun','Jul'],
  yMax: 100,
  area: true,
  reveal: 'animated'
}));
