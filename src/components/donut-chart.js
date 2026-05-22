'use strict';

/**
 * Stage.DonutChart — SVG donut chart with legend.
 *
 * Usage:
 *   Stage.register(Stage.DonutChart({
 *     section: 5,
 *     title: '05 · time allocation',
 *     segments: [
 *       { label: 'Coding',   value: 42, color: 'accent' },
 *       { label: 'Meetings', value: 23, color: 'amber'  },
 *       { label: 'Review',   value: 18, color: 'blue'   },
 *       { label: 'Slack',    value: 17, color: 'red'    }
 *     ],
 *     centerLabel: 'time',
 *     reveal: 'animated'   // 'instant' | 'animated' | 'staggered'
 *   }));
 *
 * Each segment grows from 0 (length-0 arc) on init.
 *
 * Edit paths: segments[i].label / segments[i].value / centerLabel
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

  function colorFor(name, fallbackIdx) {
    if (COLOR_MAP[name]) return COLOR_MAP[name];
    const cycle = ['var(--accent)', 'var(--blue)', 'var(--amber)', 'var(--red)', 'var(--dim)'];
    return cycle[fallbackIdx % cycle.length];
  }

  Stage.DonutChart = function (opts) {
    const segments = opts.segments || [];
    const centerLabel = opts.centerLabel || '';
    const reveal = opts.reveal || 'animated';

    const total = segments.reduce((s, x) => s + (Number(x.value) || 0), 0) || 1;
    // SVG circle: cx=50, cy=50, r=40, circumference = 2*pi*40 ≈ 251.327
    const R = 40;
    const C = 2 * Math.PI * R;

    // Compute cumulative offsets so each segment is drawn at the right position
    let cum = 0;
    const arcs = segments.map((seg, i) => {
      const value = Number(seg.value) || 0;
      const fraction = value / total;
      const length = fraction * C;
      const offset = -cum * C;     // negative because SVG draws clockwise from 3 o'clock; we rotate to 12 o'clock
      cum += fraction;
      return {
        i,
        label: seg.label || '',
        value,
        color: colorFor(seg.color, i),
        length,
        offset,
        percent: Math.round(fraction * 100)
      };
    });

    const slide = {
      section: opts.section,
      title: opts.title,
      transition: opts.transition,
      render(el) {
        const svgArcs = arcs.map(a => `
          <circle class="donut-arc"
                  data-i="${a.i}"
                  data-stage-key="DonutChart/arc[${a.i}]"
                  cx="50" cy="50" r="${R}"
                  fill="none"
                  stroke="${a.color}"
                  stroke-width="12"
                  stroke-dasharray="0 ${C.toFixed(3)}"
                  stroke-dashoffset="${a.offset.toFixed(3)}"
                  data-length="${a.length.toFixed(3)}"
                  data-circumference="${C.toFixed(3)}"/>
        `).join('');

        const legend = arcs.map(a => `
          <div class="donut-legend-row" data-i="${a.i}" data-stage-key="DonutChart/legend[${a.i}]">
            <span class="donut-dot" style="--dc-color: ${a.color};"></span>
            <span class="donut-leg-label" data-stage-edit="segments[${a.i}].label">${escape(a.label)}</span>
            <span class="donut-leg-value" data-stage-edit="segments[${a.i}].value">${escape(String(a.value))}</span>
            <span class="donut-leg-pct">${a.percent}%</span>
          </div>
        `).join('');

        el.innerHTML = `
          <div class="donut" data-stage-key="DonutChart">
            <div class="donut-svg-wrap">
              <svg class="donut-svg" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
                <circle class="donut-track" cx="50" cy="50" r="${R}" fill="none" stroke="var(--dim-2)" stroke-width="12"/>
                <g class="donut-arcs" transform="rotate(-90 50 50)">
                  ${svgArcs}
                </g>
              </svg>
              ${centerLabel ? `<div class="donut-center" data-stage-edit="centerLabel" data-stage-key="DonutChart/center">${escape(centerLabel)}</div>` : ''}
            </div>
            <div class="donut-legend" data-stage-key="DonutChart/legend">
              ${legend}
            </div>
          </div>
        `;

        if (reveal === 'instant') {
          el.querySelectorAll('.donut-arc').forEach(arc => {
            const len = arc.dataset.length;
            arc.setAttribute('stroke-dasharray', `${len} ${C - Number(len)}`);
          });
          el.querySelectorAll('.donut-legend-row').forEach(n => n.classList.add('in'));
        }
      }
    };

    function animateArc(arc, durationMs) {
      const target = Number(arc.dataset.length);
      const start = performance.now();
      let rafId;
      function tick(now) {
        const t = Math.min(1, (now - start) / durationMs);
        const eased = 1 - Math.pow(1 - t, 3);
        const len = target * eased;
        arc.setAttribute('stroke-dasharray', `${len.toFixed(3)} ${(C - len).toFixed(3)}`);
        if (t < 1) rafId = requestAnimationFrame(tick);
      }
      rafId = requestAnimationFrame(tick);
      return () => cancelAnimationFrame(rafId);
    }

    if (reveal === 'animated' || reveal === 'staggered') {
      slide.init = function (el) {
        const arcsEl = Array.from(el.querySelectorAll('.donut-arc'));
        const rows = Array.from(el.querySelectorAll('.donut-legend-row'));
        const cancels = [];
        const timers = [];
        if (reveal === 'staggered') {
          arcsEl.forEach((arc, i) => {
            timers.push(setTimeout(() => cancels.push(animateArc(arc, 700)), 100 + i * 320));
            timers.push(setTimeout(() => rows[i] && rows[i].classList.add('in'), 200 + i * 320));
          });
        } else {
          arcsEl.forEach(arc => cancels.push(animateArc(arc, 1200)));
          rows.forEach((row, i) => {
            timers.push(setTimeout(() => row.classList.add('in'), 200 + i * 120));
          });
        }
        return () => {
          cancels.forEach(c => c());
          timers.forEach(clearTimeout);
        };
      };
      slide.replay = function (el) {
        el.querySelectorAll('.donut-arc').forEach(arc => {
          arc.setAttribute('stroke-dasharray', `0 ${C}`);
        });
        el.querySelectorAll('.donut-legend-row').forEach(n => n.classList.remove('in'));
        return this.init(el);
      };
    }

    return slide;
  };

  function escape(s) {
    return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }
})(typeof window !== 'undefined' ? window : globalThis);
