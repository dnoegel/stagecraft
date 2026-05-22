'use strict';

/**
 * Stage.LineChart — SVG line chart with optional area fill.
 *
 * Usage:
 *   Stage.register(Stage.LineChart({
 *     section: 5,
 *     title: '05 · adoption curve',
 *     series: [
 *       { label: 'Q1', color: 'accent', points: [10, 15, 22, 36, 51, 70] },
 *       { label: 'Q2', color: 'blue',   points: [ 8, 12, 18, 24, 35, 48] }
 *     ],
 *     xLabels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
 *     yMax: 80,                              // optional, defaults to max+10%
 *     area: true,                            // optional, fills below line
 *     reveal: 'animated'                     // 'animated' | 'instant'
 *   }));
 *
 * On init each line draws from left to right using stroke-dasharray.
 *
 * Edit paths: series[i].label, xLabels[i]
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

  function colorFor(name, idx) {
    if (COLOR_MAP[name]) return COLOR_MAP[name];
    const cycle = ['var(--accent)', 'var(--blue)', 'var(--amber)', 'var(--red)', 'var(--dim)'];
    return cycle[idx % cycle.length];
  }

  // viewBox geometry
  const VB_W = 800;
  const VB_H = 400;
  const PAD_L = 50;
  const PAD_R = 20;
  const PAD_T = 20;
  const PAD_B = 40;
  const PLOT_W = VB_W - PAD_L - PAD_R;
  const PLOT_H = VB_H - PAD_T - PAD_B;

  Stage.LineChart = function (opts) {
    const series = opts.series || [];
    const xLabels = opts.xLabels || [];
    const reveal = opts.reveal || 'animated';
    const area = !!opts.area;

    // Find global max
    let allMax = 0;
    series.forEach(s => (s.points || []).forEach(p => { if (Number(p) > allMax) allMax = Number(p); }));
    const yMax = Number(opts.yMax) > 0 ? Number(opts.yMax) : (allMax > 0 ? allMax * 1.1 : 1);

    // Use the longest series for x grid
    const maxLen = series.reduce((m, s) => Math.max(m, (s.points || []).length), 0);

    function xAt(i, n) {
      if (n <= 1) return PAD_L + PLOT_W / 2;
      return PAD_L + (i / (n - 1)) * PLOT_W;
    }
    function yAt(v) {
      return PAD_T + PLOT_H - (v / yMax) * PLOT_H;
    }

    function pathFor(points) {
      if (!points.length) return '';
      const n = points.length;
      return points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${xAt(i, n).toFixed(2)} ${yAt(Number(p) || 0).toFixed(2)}`).join(' ');
    }
    function areaFor(points) {
      if (!points.length) return '';
      const n = points.length;
      const top = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${xAt(i, n).toFixed(2)} ${yAt(Number(p) || 0).toFixed(2)}`).join(' ');
      const right = `L ${xAt(n - 1, n).toFixed(2)} ${(PAD_T + PLOT_H).toFixed(2)}`;
      const left = `L ${xAt(0, n).toFixed(2)} ${(PAD_T + PLOT_H).toFixed(2)} Z`;
      return `${top} ${right} ${left}`;
    }

    // y-axis ticks: 4 evenly spaced labels
    const yTicks = [0, 0.25, 0.5, 0.75, 1].map(t => ({
      y: PAD_T + PLOT_H - t * PLOT_H,
      label: formatNum(yMax * t)
    }));

    function formatNum(v) {
      if (v >= 1000) return (v / 1000).toFixed(v >= 10000 ? 0 : 1) + 'k';
      return Number.isInteger(v) ? String(v) : v.toFixed(1);
    }

    const slide = {
      section: opts.section,
      title: opts.title,
      transition: opts.transition,
      render(el) {
        const gridLines = yTicks.map(t => `
          <line class="lc-grid" x1="${PAD_L}" x2="${VB_W - PAD_R}" y1="${t.y}" y2="${t.y}"/>
          <text class="lc-y-label" x="${PAD_L - 8}" y="${t.y + 4}" text-anchor="end">${escape(t.label)}</text>
        `).join('');

        const xTicks = xLabels.slice(0, maxLen).map((lbl, i) => `
          <text class="lc-x-label"
                data-stage-edit="xLabels[${i}]"
                x="${xAt(i, maxLen).toFixed(2)}"
                y="${(VB_H - PAD_B + 22).toFixed(2)}"
                text-anchor="middle">${escape(lbl)}</text>
        `).join('');

        const seriesSvg = series.map((s, i) => {
          const points = s.points || [];
          const stroke = colorFor(s.color, i);
          const d = pathFor(points);
          const aPath = area ? areaFor(points) : '';
          return `
            <g class="lc-series" data-i="${i}" data-stage-key="LineChart/series[${i}]">
              ${area ? `<path class="lc-area" data-i="${i}" d="${aPath}" fill="${stroke}" fill-opacity="0.12"/>` : ''}
              <path class="lc-line" data-i="${i}" d="${d}" stroke="${stroke}"/>
              ${points.map((p, j) => `
                <circle class="lc-dot" data-i="${i}" data-j="${j}"
                        cx="${xAt(j, points.length).toFixed(2)}"
                        cy="${yAt(Number(p) || 0).toFixed(2)}"
                        r="3" fill="${stroke}"/>
              `).join('')}
            </g>
          `;
        }).join('');

        const legend = series.map((s, i) => `
          <div class="lc-leg-row" data-stage-key="LineChart/legend[${i}]">
            <span class="lc-dot-leg" style="--lc-color: ${colorFor(s.color, i)};"></span>
            <span class="lc-leg-label" data-stage-edit="series[${i}].label">${escape(s.label || '')}</span>
          </div>
        `).join('');

        el.innerHTML = `
          <div class="linechart" data-stage-key="LineChart">
            <div class="lc-svg-wrap">
              <svg class="lc-svg" viewBox="0 0 ${VB_W} ${VB_H}" preserveAspectRatio="xMidYMid meet">
                ${gridLines}
                ${xTicks}
                ${seriesSvg}
              </svg>
            </div>
            ${series.length > 1 ? `<div class="lc-legend">${legend}</div>` : ''}
          </div>
        `;

        if (reveal === 'instant') {
          el.querySelectorAll('.lc-line').forEach(line => {
            line.style.strokeDasharray = 'none';
            line.style.strokeDashoffset = '0';
          });
          el.querySelectorAll('.lc-dot').forEach(d => d.classList.add('in'));
          el.querySelectorAll('.lc-area').forEach(a => a.classList.add('in'));
        }
      }
    };

    if (reveal === 'animated') {
      slide.init = function (el) {
        const lines = Array.from(el.querySelectorAll('.lc-line'));
        const areas = Array.from(el.querySelectorAll('.lc-area'));
        const dots = Array.from(el.querySelectorAll('.lc-dot'));
        const timers = [];

        lines.forEach((line, idx) => {
          const length = line.getTotalLength ? line.getTotalLength() : 1000;
          line.style.strokeDasharray = `${length}`;
          line.style.strokeDashoffset = `${length}`;
          // Force reflow
          // eslint-disable-next-line no-unused-expressions
          line.getBoundingClientRect();
          timers.push(setTimeout(() => {
            line.style.transition = 'stroke-dashoffset 1400ms cubic-bezier(0.16, 1, 0.3, 1)';
            line.style.strokeDashoffset = '0';
          }, 100 + idx * 200));
        });
        areas.forEach((a, idx) => {
          timers.push(setTimeout(() => a.classList.add('in'), 800 + idx * 200));
        });
        dots.forEach((d, idx) => {
          timers.push(setTimeout(() => d.classList.add('in'), 800 + idx * 60));
        });

        return () => timers.forEach(clearTimeout);
      };
      slide.replay = function (el) {
        el.querySelectorAll('.lc-line').forEach(line => {
          line.style.transition = 'none';
          const length = line.getTotalLength ? line.getTotalLength() : 1000;
          line.style.strokeDasharray = `${length}`;
          line.style.strokeDashoffset = `${length}`;
        });
        el.querySelectorAll('.lc-dot').forEach(d => d.classList.remove('in'));
        el.querySelectorAll('.lc-area').forEach(a => a.classList.remove('in'));
        return this.init(el);
      };
    }

    return slide;
  };

  function escape(s) {
    return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }
})(typeof window !== 'undefined' ? window : globalThis);
