'use strict';

Stage.register(Stage.Gauge({
  section: 4,
  title: '04 · Gauge',
  value: 87,
  max: 100,
  label: 'agent-friendly',
  color: 'accent',
  ticks: 5
}), {
  notes: 'Semi-circular meter. The arc fills from 0 to value/max on init, with a count-up readout. Pair with a KPI for a status dashboard slide.'
});
