'use strict';

Stage.register(Stage.DonutChart({
  section: 51,
  title: '51 · DonutChart',
  segments: [
    { label: 'Coding',   value: 42, color: 'accent' },
    { label: 'Meetings', value: 23, color: 'amber'  },
    { label: 'Review',   value: 18, color: 'blue'   },
    { label: 'Slack',    value: 17, color: 'red'    }
  ],
  centerLabel: 'time',
  reveal: 'animated'
}));
