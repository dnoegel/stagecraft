'use strict';

(function () {
  // Fake commit-activity heatmap — 7 rows (days) × 12 cols (weeks)
  const rows = 7, cols = 12;
  const data = [];
  for (let r = 0; r < rows; r++) {
    const row = [];
    for (let c = 0; c < cols; c++) {
      // weight toward weekday afternoons + recent weeks
      const dayWeight = (r >= 1 && r <= 4) ? 0.8 : 0.4;
      const weekWeight = 0.3 + (c / cols) * 0.7;
      row.push(Math.random() * dayWeight * weekWeight * 20);
    }
    data.push(row);
  }

  Stage.register(Stage.Heatmap({
    section: 4,
    title: '04 · Heatmap',
    rows, cols, data,
    xLabels: ['W1','W2','W3','W4','W5','W6','W7','W8','W9','W10','W11','W12'],
    yLabels: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
    color: 'accent'
  }), {
    notes: 'GitHub-contribution-style heatmap. Color intensity scales with value vs max. Random data here, but the layout works for any 2D activity grid.'
  });
})();
