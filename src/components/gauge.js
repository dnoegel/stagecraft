'use strict';

/**
 * Stage.Gauge — semi-circular gauge with animated arc.
 *
 * Usage:
 *   Stage.register(Stage.Gauge({
 *     section: 5,
 *     title: '05 · system load',
 *     value: 72,
 *     max: 100,                              // optional, default 100
 *     label: 'CPU load',                     // optional
 *     color: 'accent',                       // optional
 *     ticks: 5                               // optional, marks on the arc
 *   }));
 *
 * Arc fills from 0 → value/max ratio on init.
 *
 * Edit paths: value / max / label
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

  // viewBox 200x120, center (100, 100), radius 80, arc spans 180 degrees
  const CX = 100;
  const CY = 100;
  const R = 80;

  function polar(angleDeg) {
    // angle 0 = left (180° from positive x), 180 = right (0°)
    // Math: start at left (180°), end at right (0°) — semi-circle on top
    const rad = (180 - angleDeg) * Math.PI / 180;
    return { x: CX + R * Math.cos(rad), y: CY - R * Math.sin(rad) };
  }

  function arcPath(startDeg, endDeg) {
    const s = polar(startDeg);
    const e = polar(endDeg);
    const large = (endDeg - startDeg) > 180 ? 1 : 0;
    return `M ${s.x.toFixed(2)} ${s.y.toFixed(2)} A ${R} ${R} 0 ${large} 1 ${e.x.toFixed(2)} ${e.y.toFixed(2)}`;
  }

  Stage.Gauge = function (opts) {
    const target = Number(opts.value) || 0;
    const max = Number(opts.max) || 100;
    const label = opts.label || '';
    const color = opts.color || 'accent';
    const ticks = Math.max(0, Math.min(20, Number(opts.ticks) || 0));
    const strokeColor = COLOR_MAP[color] || COLOR_MAP.accent;

    const ratio = Math.max(0, Math.min(1, target / max));

    return {
      section: opts.section,
      title: opts.title,
      transition: opts.transition,
      render(el) {
        const trackPath = arcPath(0, 180);
        const fullArcPath = arcPath(0, 180);

        // Tick marks
        let tickSvg = '';
        if (ticks > 0) {
          const tickArr = [];
          for (let i = 0; i <= ticks; i++) {
            const deg = (i / ticks) * 180;
            const outer = polar(deg);
            const innerR = R - 10;
            const rad = (180 - deg) * Math.PI / 180;
            const ix = CX + innerR * Math.cos(rad);
            const iy = CY - innerR * Math.sin(rad);
            tickArr.push(`<line class="g-tick" x1="${outer.x.toFixed(2)}" y1="${outer.y.toFixed(2)}" x2="${ix.toFixed(2)}" y2="${iy.toFixed(2)}"/>`);
          }
          tickSvg = tickArr.join('');
        }

        el.innerHTML = `
          <div class="gauge gauge--${escape(color)}" data-stage-key="Gauge">
            <div class="g-svg-wrap">
              <svg class="g-svg" viewBox="0 0 200 120" preserveAspectRatio="xMidYMid meet">
                <path class="g-track" d="${trackPath}" fill="none" stroke="var(--dim-2)" stroke-width="14" stroke-linecap="round"/>
                <path class="g-fill"  d="${fullArcPath}"
                      data-stage-key="Gauge/arc"
                      fill="none"
                      stroke="${strokeColor}"
                      stroke-width="14"
                      stroke-linecap="round"
                      pathLength="100"
                      stroke-dasharray="0 100"/>
                ${tickSvg}
              </svg>
              <div class="g-readout" data-stage-key="Gauge/readout">
                <div class="g-num"><span class="g-num-val" data-stage-edit="value" data-target="${target}">0</span><span class="g-num-max" data-stage-edit="max">/ ${escape(String(max))}</span></div>
                ${label ? `<div class="g-label" data-stage-edit="label" data-stage-key="Gauge/label">${escape(label)}</div>` : ''}
              </div>
            </div>
          </div>
        `;
      },
      init(el) {
        const fill = el.querySelector('.g-fill');
        const numEl = el.querySelector('.g-num-val');
        const duration = 1400;
        const start = performance.now();
        const isInt = Number.isInteger(target);
        let rafId;
        function tick(now) {
          const t = Math.min(1, (now - start) / duration);
          const eased = 1 - Math.pow(1 - t, 3);
          const progress = eased * ratio;
          if (fill) {
            fill.setAttribute('stroke-dasharray', `${(progress * 100).toFixed(2)} ${(100 - progress * 100).toFixed(2)}`);
          }
          if (numEl) {
            const val = target * eased;
            numEl.textContent = isInt ? Math.floor(val).toLocaleString() : val.toFixed(1);
          }
          if (t < 1) rafId = requestAnimationFrame(tick);
          else if (numEl) numEl.textContent = isInt ? target.toLocaleString() : String(target);
        }
        rafId = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(rafId);
      },
      replay(el) {
        const fill = el.querySelector('.g-fill');
        const numEl = el.querySelector('.g-num-val');
        if (fill) fill.setAttribute('stroke-dasharray', '0 100');
        if (numEl) numEl.textContent = '0';
        return this.init(el);
      }
    };
  };

  function escape(s) {
    return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }
})(typeof window !== 'undefined' ? window : globalThis);
