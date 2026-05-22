'use strict';

/**
 * Stage.Matrix2x2 — classic 2x2 decision/priority matrix
 * (e.g. Eisenhower, Effort/Impact, Importance/Urgency).
 *
 * Usage:
 *   Stage.register(Stage.Matrix2x2({
 *     section: 5,
 *     title: '05 · prioritize',
 *     axes: {
 *       x: { label: 'effort',    low: 'low',  high: 'high' },
 *       y: { label: 'impact',    low: 'low',  high: 'high' }
 *     },
 *     quadrants: [
 *       { x: 'low',  y: 'high', label: 'Quick wins',   body: 'do these first',  color: 'accent' },
 *       { x: 'high', y: 'high', label: 'Big bets',     body: 'plan carefully',  color: 'blue' },
 *       { x: 'low',  y: 'low',  label: 'Fill-ins',     body: 'spare cycles' },
 *       { x: 'high', y: 'low',  label: 'Money pit',    body: 'avoid',           color: 'red' }
 *     ],
 *     reveal: 'staggered'   // 'instant' | 'staggered' | 'per-click'
 *   }));
 *
 * Layer-3 (inline edit):
 *   axes.x.label, axes.x.low, axes.x.high
 *   axes.y.label, axes.y.low, axes.y.high
 *   quadrants[i].label, quadrants[i].body
 *
 * Per-click: each click highlights one more quadrant (in array order).
 */

(function (root) {
  const Stage = root.Stage = root.Stage || {};

  const COLOR_MAP = {
    accent: 'var(--accent)',
    amber:  'var(--amber)',
    blue:   'var(--blue)',
    red:    'var(--red)',
    dim:    'var(--dim)',
    fg:     'var(--fg)'
  };

  Stage.Matrix2x2 = function (opts) {
    const axes = opts.axes || { x: {}, y: {} };
    const xAxis = axes.x || {};
    const yAxis = axes.y || {};
    const quadrants = (opts.quadrants || []).slice(0, 4);
    const reveal = opts.reveal || 'instant';

    // Build a 2x2 grid lookup keyed by `${yPos}-${xPos}`. Render order is
    // top-left, top-right, bottom-left, bottom-right (CSS grid order).
    const cellOrder = [
      { x: 'low',  y: 'high' },
      { x: 'high', y: 'high' },
      { x: 'low',  y: 'low'  },
      { x: 'high', y: 'low'  }
    ];

    function findQuadrant(x, y) {
      const idx = quadrants.findIndex(q => q.x === x && q.y === y);
      return idx >= 0 ? { q: quadrants[idx], idx } : { q: null, idx: -1 };
    }

    function colorFor(name) {
      return COLOR_MAP[name] || COLOR_MAP.accent;
    }

    const slide = {
      section: opts.section,
      title: opts.title,
      transition: opts.transition,
      render(el) {
        el.classList.add('has-matrix');
        const cells = cellOrder.map((pos, cellIdx) => {
          const { q, idx } = findQuadrant(pos.x, pos.y);
          if (!q) {
            return `<div class="quadrant placeholder" data-stage-key="Matrix2x2/cell[${cellIdx}]"></div>`;
          }
          const color = colorFor(q.color);
          const tag = `${labelShort(pos.y)} · ${labelShort(pos.x)}`;
          return `
            <div class="quadrant"
                 data-quad-index="${idx}"
                 data-stage-key="Matrix2x2/quadrant[${idx}]"
                 style="--q-color: ${color};">
              <div class="q-tag">${escape(tag)}</div>
              <div class="q-label" data-stage-edit="quadrants[${idx}].label">${escape(q.label || '')}</div>
              ${q.body ? `<div class="q-body" data-stage-edit="quadrants[${idx}].body">${escape(q.body)}</div>` : ''}
            </div>
          `;
        }).join('');

        el.innerHTML = `
          <div class="matrix2x2" data-stage-key="Matrix2x2">
            <div class="y-axis" data-stage-key="Matrix2x2/y-axis">
              <span class="hi" data-stage-edit="axes.y.high">${escape(yAxis.high || 'high')}</span>
              <span class="label" data-stage-edit="axes.y.label">${escape(yAxis.label || '')}</span>
              <span class="lo" data-stage-edit="axes.y.low">${escape(yAxis.low || 'low')}</span>
            </div>
            <div class="grid" data-stage-key="Matrix2x2/grid">
              ${cells}
            </div>
            <div class="x-axis" data-stage-key="Matrix2x2/x-axis">
              <span class="lo" data-stage-edit="axes.x.low">${escape(xAxis.low || 'low')}</span>
              <span class="label" data-stage-edit="axes.x.label">${escape(xAxis.label || '')}</span>
              <span class="hi" data-stage-edit="axes.x.high">${escape(xAxis.high || 'high')}</span>
            </div>
          </div>
        `;

        if (reveal === 'instant') {
          el.querySelectorAll('.quadrant[data-quad-index]').forEach(n => n.classList.add('active'));
        }
      }
    };

    if (reveal === 'staggered') {
      slide.init = function (el) {
        const nodes = el.querySelectorAll('.quadrant[data-quad-index]');
        const timers = [];
        nodes.forEach((n, i) => {
          timers.push(setTimeout(() => n.classList.add('active'), 220 + i * 260));
        });
        return () => timers.forEach(clearTimeout);
      };
      slide.replay = function (el) {
        el.querySelectorAll('.quadrant').forEach(n => n.classList.remove('active'));
        return this.init(el);
      };
    } else if (reveal === 'per-click') {
      slide.steps = quadrants.length;
      slide.onStep = function (el, step) {
        el.querySelectorAll('.quadrant[data-quad-index]').forEach(n => {
          const idx = Number(n.dataset.quadIndex);
          n.classList.toggle('active', idx < step);
        });
      };
    }

    return slide;
  };

  function labelShort(pos) {
    return pos === 'high' ? 'hi' : 'lo';
  }

  function escape(s) {
    return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }
})(typeof window !== 'undefined' ? window : globalThis);
