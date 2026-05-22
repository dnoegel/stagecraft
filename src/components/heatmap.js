'use strict';

/**
 * Stage.Heatmap — grid of color-intensity cells (GitHub-contribution style).
 *
 * Usage:
 *   Stage.register(Stage.Heatmap({
 *     section: 5,
 *     title: '05 · activity',
 *     rows: 7, cols: 12,
 *     data: [
 *       [0, 1, 3, ...],   // row 0
 *       [1, 2, 4, ...],   // row 1
 *       ...
 *     ],
 *     min: 0, max: 10,                       // optional
 *     xLabels: ['Jan','Feb',...],            // optional
 *     yLabels: ['Mon','Tue',...],            // optional
 *     color: 'accent'                        // optional, default accent
 *   }));
 *
 * Cells fade in with a soft staggered sweep.
 *
 * Edit paths: xLabels[i], yLabels[i]
 */

(function (root) {
  const Stage = root.Stage = root.Stage || {};

  const COLOR_MAP = {
    accent: 'var(--accent)',
    amber:  'var(--amber)',
    blue:   'var(--blue)',
    red:    'var(--red)',
    fg:     'var(--fg)'
  };

  Stage.Heatmap = function (opts) {
    const rows = Math.max(1, Number(opts.rows) || (opts.data ? opts.data.length : 1));
    const cols = Math.max(1, Number(opts.cols) || (opts.data && opts.data[0] ? opts.data[0].length : 1));
    const data = opts.data || [];
    const xLabels = opts.xLabels || [];
    const yLabels = opts.yLabels || [];
    const color = opts.color || 'accent';
    const baseColor = COLOR_MAP[color] || COLOR_MAP.accent;

    // Find min/max if not provided
    let min = Number.isFinite(opts.min) ? Number(opts.min) : Infinity;
    let max = Number.isFinite(opts.max) ? Number(opts.max) : -Infinity;
    if (!Number.isFinite(opts.min) || !Number.isFinite(opts.max)) {
      data.forEach(row => (row || []).forEach(v => {
        const n = Number(v) || 0;
        if (!Number.isFinite(opts.min) && n < min) min = n;
        if (!Number.isFinite(opts.max) && n > max) max = n;
      }));
    }
    if (!Number.isFinite(min)) min = 0;
    if (!Number.isFinite(max)) max = 1;
    if (max === min) max = min + 1;

    function intensity(v) {
      const n = Number(v) || 0;
      return Math.max(0, Math.min(1, (n - min) / (max - min)));
    }

    return {
      section: opts.section,
      title: opts.title,
      transition: opts.transition,
      render(el) {
        const xLabelRow = xLabels.length
          ? `<div class="hm-x-labels">
              <div class="hm-corner"></div>
              ${Array.from({ length: cols }, (_, c) => `
                <div class="hm-x-label" data-stage-edit="xLabels[${c}]">${escape(xLabels[c] || '')}</div>
              `).join('')}
            </div>`
          : '';

        const cellRows = Array.from({ length: rows }, (_, r) => {
          const yLab = yLabels[r] || '';
          const cells = Array.from({ length: cols }, (_, c) => {
            const value = (data[r] || [])[c];
            const inten = intensity(value);
            return `<div class="hm-cell"
                         data-r="${r}" data-c="${c}"
                         data-stage-key="Heatmap/cell[${r}][${c}]"
                         style="--hm-intensity: ${inten.toFixed(3)};"
                         title="${escape(String(value ?? ''))}"></div>`;
          }).join('');
          return `<div class="hm-row">
                    ${yLabels.length ? `<div class="hm-y-label" data-stage-edit="yLabels[${r}]">${escape(yLab)}</div>` : ''}
                    <div class="hm-cells">${cells}</div>
                  </div>`;
        }).join('');

        el.innerHTML = `
          <div class="heatmap heatmap--${escape(color)}"
               style="--hm-base: ${baseColor}; --hm-cols: ${cols}; --hm-rows: ${rows};"
               data-stage-key="Heatmap">
            ${xLabelRow}
            <div class="hm-body">
              ${cellRows}
            </div>
            <div class="hm-scale">
              <span class="hm-scale-label">less</span>
              <span class="hm-scale-step" style="--hm-intensity: 0.05;"></span>
              <span class="hm-scale-step" style="--hm-intensity: 0.3;"></span>
              <span class="hm-scale-step" style="--hm-intensity: 0.55;"></span>
              <span class="hm-scale-step" style="--hm-intensity: 0.8;"></span>
              <span class="hm-scale-step" style="--hm-intensity: 1;"></span>
              <span class="hm-scale-label">more</span>
            </div>
          </div>
        `;
      },
      init(el) {
        const cells = Array.from(el.querySelectorAll('.hm-cell'));
        const timers = [];
        cells.forEach((cell, i) => {
          const r = Number(cell.dataset.r);
          const c = Number(cell.dataset.c);
          // Diagonal sweep: top-left to bottom-right
          const delay = 80 + (r + c) * 35;
          timers.push(setTimeout(() => cell.classList.add('in'), delay));
        });
        return () => timers.forEach(clearTimeout);
      },
      replay(el) {
        el.querySelectorAll('.hm-cell').forEach(c => c.classList.remove('in'));
        return this.init(el);
      }
    };
  };

  function escape(s) {
    return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }
})(typeof window !== 'undefined' ? window : globalThis);
