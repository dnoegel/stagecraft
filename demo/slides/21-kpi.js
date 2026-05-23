'use strict';

Stage.register(Stage.KPI({
  section: 4,
  title: '04 · KPI',
  value: 18_421,
  unit: '',
  label: 'lines of source — and counting',
  change: { value: 320, direction: 'up', period: 'today' },
  color: 'accent',
  icon: 'trending_up'
}), {
  notes: 'KPI card — hero metric with trend arrow. Pair with other KPIs in a row for an exec-style summary.'
});
