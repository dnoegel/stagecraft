'use strict';

/**
 * Stage.BigNumber — one massive headline number with a label.
 *
 * Usage:
 *   Stage.register(Stage.BigNumber({
 *     section: 6,
 *     title: '06 · Cost collapse',
 *     number: 92,
 *     unit: '%',                              // optional
 *     label: 'drop in cost-per-token',
 *     caption: '2023 → 2026, frontier models' // optional
 *   }));
 *
 * On init the number counts up from 0 → target in ~1.2s.
 *
 * Edit paths: number / unit / label / caption
 */

(function (root) {
  const Stage = root.Stage = root.Stage || {};

  Stage.BigNumber = function (opts) {
    const target = Number(opts.number) || 0;
    const unit = opts.unit || '';
    const label = opts.label || '';
    const caption = opts.caption || '';

    return {
      section: opts.section,
      title: opts.title,
      transition: opts.transition,
      render(el) {
        el.innerHTML = `
          <div class="big-number" data-stage-key="BigNumber">
            <div class="bn-figure" data-stage-key="BigNumber/figure">
              <span class="bn-num" data-stage-edit="number" data-target="${target}">0</span>${unit ? `<span class="bn-unit" data-stage-edit="unit">${escape(unit)}</span>` : ''}
            </div>
            <div class="bn-label" data-stage-edit="label" data-stage-key="BigNumber/label">${escape(label)}</div>
            ${caption ? `<div class="bn-caption" data-stage-edit="caption" data-stage-key="BigNumber/caption">${escape(caption)}</div>` : ''}
          </div>
        `;
      },
      init(el) {
        const numEl = el.querySelector('.bn-num');
        const unitEl = el.querySelector('.bn-unit');
        const labelEl = el.querySelector('.bn-label');
        const capEl = el.querySelector('.bn-caption');
        const duration = 1200;
        const start = performance.now();
        const isInt = Number.isInteger(target);
        let rafId;
        function tick(now) {
          const t = Math.min(1, (now - start) / duration);
          // easeOutCubic
          const eased = 1 - Math.pow(1 - t, 3);
          const value = target * eased;
          numEl.textContent = isInt ? Math.floor(value).toLocaleString() : value.toFixed(1);
          if (t < 1) rafId = requestAnimationFrame(tick);
          else numEl.textContent = isInt ? target.toLocaleString() : String(target);
        }
        rafId = requestAnimationFrame(tick);

        const timers = [];
        timers.push(setTimeout(() => unitEl && unitEl.classList.add('in'), 200));
        timers.push(setTimeout(() => labelEl && labelEl.classList.add('in'), 600));
        timers.push(setTimeout(() => capEl && capEl.classList.add('in'), 1100));

        return () => {
          cancelAnimationFrame(rafId);
          timers.forEach(clearTimeout);
        };
      },
      replay(el) {
        const numEl = el.querySelector('.bn-num');
        if (numEl) numEl.textContent = '0';
        el.querySelectorAll('.bn-unit, .bn-label, .bn-caption').forEach(n => n.classList.remove('in'));
        return this.init(el);
      }
    };
  };

  function escape(s) {
    return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }
})(typeof window !== 'undefined' ? window : globalThis);
