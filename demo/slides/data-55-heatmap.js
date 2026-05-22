'use strict';

// Generate a 7x12 heatmap (days of week × weeks)
const ROWS = 7;
const COLS = 12;
const data = Array.from({ length: ROWS }, (_, r) =>
  Array.from({ length: COLS }, (_, c) => {
    // Heavier activity midweek and later in the period
    const dayBias = [1, 3, 4, 5, 4, 2, 1][r] || 1;
    const weekBias = Math.min(10, Math.floor(c * 0.8 + 1));
    const noise = ((r * 31 + c * 17 + 7) % 5);
    return Math.min(10, Math.max(0, dayBias + weekBias - 4 + noise - 2));
  })
);

Stage.register(Stage.Heatmap({
  section: 55,
  title: '55 · Heatmap',
  rows: ROWS,
  cols: COLS,
  data,
  min: 0,
  max: 10,
  xLabels: ['W1','W2','W3','W4','W5','W6','W7','W8','W9','W10','W11','W12'],
  yLabels: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
  color: 'accent'
}));
