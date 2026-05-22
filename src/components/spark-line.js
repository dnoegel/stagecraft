'use strict';

/**
 * Stage.SparkLine — hero number with an inline trend sparkline.
 *
 * Usage:
 *   Stage.register(Stage.SparkLine({
 *     section: 5,
 *     title: '05 · daily commits',
 *     value: 247,
 *     label: 'commits today',
 *     points: [42, 51, 68, 95, 130, 178, 247],
 *     color: 'accent',
 *     period: 'last 7 days'
 *   }));
 *
 * Big number counts up; sparkline draws on init.
 *
 * Edit paths: value / label / period
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

  // viewBox 200x60
  const VB_W = 200;
  const VB_H = 60;
  const PAD = 4;

  Stage.SparkLine = function (opts) {
    const target = Number(opts.value) || 0;
    const label = opts.label || '';
    const points = (opts.points || []).map(p => Number(p) || 0);
    const color = opts.color || 'accent';
    const period = opts.period || '';
    const stroke = COLOR_MAP[color] || COLOR_MAP.accent;

    const pMax = points.length ? Math.max(...points) : 1;
    const pMin = points.length ? Math.min(...points) : 0;
    const range = pMax - pMin || 1;

    function xAt(i, n) {
      if (n <= 1) return VB_W / 2;
      return PAD + (i / (n - 1)) * (VB_W - 2 * PAD);
    }
    function yAt(v) {
      return VB_H - PAD - ((v - pMin) / range) * (VB_H - 2 * PAD);
    }

    const path = points.length
      ? points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${xAt(i, points.length).toFixed(2)} ${yAt(p).toFixed(2)}`).join(' ')
      : '';
    const areaPath = points.length
      ? `${path} L ${xAt(points.length - 1, points.length).toFixed(2)} ${VB_H - PAD} L ${xAt(0, points.length).toFixed(2)} ${VB_H - PAD} Z`
      : '';

    return {
      section: opts.section,
      title: opts.title,
      transition: opts.transition,
      render(el) {
        el.innerHTML = `
          <div class="sparkline sparkline--${escape(color)}" data-stage-key="SparkLine">
            <div class="sl-figure">
              <span class="sl-num" data-stage-edit="value" data-target="${target}">0</span>
            </div>
            <div class="sl-label" data-stage-edit="label" data-stage-key="SparkLine/label">${escape(label)}</div>
            <div class="sl-svg-wrap">
              <svg class="sl-svg" viewBox="0 0 ${VB_W} ${VB_H}" preserveAspectRatio="none">
                ${areaPath ? `<path class="sl-area" d="${areaPath}" fill="${stroke}" fill-opacity="0.14"/>` : ''}
                ${path ? `<path class="sl-line" d="${path}" stroke="${stroke}" fill="none"/>` : ''}
                ${points.length ? `<circle class="sl-tip" cx="${xAt(points.length - 1, points.length).toFixed(2)}" cy="${yAt(points[points.length - 1]).toFixed(2)}" r="3" fill="${stroke}"/>` : ''}
              </svg>
            </div>
            ${period ? `<div class="sl-period" data-stage-edit="period">${escape(period)}</div>` : ''}
          </div>
        `;
      },
      init(el) {
        const numEl = el.querySelector('.sl-num');
        const line = el.querySelector('.sl-line');
        const area = el.querySelector('.sl-area');
        const tip = el.querySelector('.sl-tip');
        const duration = 1200;
        const start = performance.now();
        const isInt = Number.isInteger(target);
        let rafId;

        function tick(now) {
          const t = Math.min(1, (now - start) / duration);
          const eased = 1 - Math.pow(1 - t, 3);
          const val = target * eased;
          if (numEl) numEl.textContent = isInt ? Math.floor(val).toLocaleString() : val.toFixed(1);
          if (t < 1) rafId = requestAnimationFrame(tick);
          else if (numEl) numEl.textContent = isInt ? target.toLocaleString() : String(target);
        }
        rafId = requestAnimationFrame(tick);

        const timers = [];
        if (line) {
          const length = line.getTotalLength ? line.getTotalLength() : 500;
          line.style.strokeDasharray = `${length}`;
          line.style.strokeDashoffset = `${length}`;
          // eslint-disable-next-line no-unused-expressions
          line.getBoundingClientRect();
          timers.push(setTimeout(() => {
            line.style.transition = 'stroke-dashoffset 1300ms cubic-bezier(0.16, 1, 0.3, 1)';
            line.style.strokeDashoffset = '0';
          }, 200));
        }
        if (area) timers.push(setTimeout(() => area.classList.add('in'), 800));
        if (tip)  timers.push(setTimeout(() => tip.classList.add('in'), 1400));

        return () => {
          cancelAnimationFrame(rafId);
          timers.forEach(clearTimeout);
        };
      },
      replay(el) {
        const numEl = el.querySelector('.sl-num');
        if (numEl) numEl.textContent = '0';
        const line = el.querySelector('.sl-line');
        if (line) {
          line.style.transition = 'none';
          const length = line.getTotalLength ? line.getTotalLength() : 500;
          line.style.strokeDasharray = `${length}`;
          line.style.strokeDashoffset = `${length}`;
        }
        el.querySelectorAll('.sl-area, .sl-tip').forEach(n => n.classList.remove('in'));
        return this.init(el);
      }
    };
  };

  function escape(s) {
    return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }
})(typeof window !== 'undefined' ? window : globalThis);
