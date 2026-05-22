'use strict';

Stage.register(Stage.BarChart({
  section: 4,
  title: '04 · where the hours go',
  orientation: 'horizontal',
  bars: [
    { label: 'Coding',    value: 6,  color: 'accent' },
    { label: 'Meetings',  value: 3,  color: 'amber'  },
    { label: 'Slack',     value: 2,  color: 'blue'   },
    { label: 'Thinking',  value: 1,  color: 'dim'    }
  ],
  unit: ' h',
  reveal: 'animated'
}));
