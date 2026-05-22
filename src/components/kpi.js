'use strict';

/**
 * Stage.KPI — hero metric card with optional trend.
 *
 * Usage:
 *   Stage.register(Stage.KPI({
 *     section: 5,
 *     title: '05 · weekly active',
 *     value: 12480,
 *     unit: '',
 *     label: 'weekly active developers',
 *     change: { value: 12.4, direction: 'up', period: 'vs. last week' },
 *     color: 'accent',
 *     icon: 'group'
 *   }));
 *
 * On init the number counts up from 0 → value.
 * Direction 'up' colors the trend green/accent, 'down' colors it red.
 *
 * Edit paths: value / unit / label / change.value / change.period
 */

(function (root) {
  const Stage = root.Stage = root.Stage || {};

  Stage.KPI = function (opts) {
    const target = Number(opts.value) || 0;
    const unit = opts.unit || '';
    const label = opts.label || '';
    const change = opts.change || null;
    const color = opts.color || 'accent';
    const icon = opts.icon || '';

    return {
      section: opts.section,
      title: opts.title,
      transition: opts.transition,
      render(el) {
        const dirClass = change ? (change.direction === 'down' ? 'down' : 'up') : '';
        const arrow = change
          ? (change.direction === 'down' ? '▼' : '▲')
          : '';
        el.innerHTML = `
          <div class="kpi kpi--${escape(color)}" data-stage-key="KPI">
            <div class="kpi-head" data-stage-key="KPI/head">
              ${icon ? `<span class="kpi-icon material-symbols-outlined">${escape(icon)}</span>` : ''}
              <span class="kpi-label" data-stage-edit="label" data-stage-key="KPI/label">${escape(label)}</span>
            </div>
            <div class="kpi-figure" data-stage-key="KPI/figure">
              <span class="kpi-num" data-stage-edit="value" data-target="${target}">0</span>${unit ? `<span class="kpi-unit" data-stage-edit="unit">${escape(unit)}</span>` : ''}
            </div>
            ${change ? `
              <div class="kpi-change ${dirClass}" data-stage-key="KPI/change">
                <span class="kpi-arrow">${arrow}</span>
                <span class="kpi-change-num" data-stage-edit="change.value">${escape(String(change.value))}%</span>
                <span class="kpi-change-period" data-stage-edit="change.period">${escape(change.period || '')}</span>
              </div>
            ` : ''}
          </div>
        `;
      },
      init(el) {
        const numEl = el.querySelector('.kpi-num');
        const card = el.querySelector('.kpi');
        if (!numEl) return () => {};
        const duration = 1200;
        const start = performance.now();
        const isInt = Number.isInteger(target);
        let rafId;
        function tick(now) {
          const t = Math.min(1, (now - start) / duration);
          const eased = 1 - Math.pow(1 - t, 3);
          const value = target * eased;
          numEl.textContent = isInt ? Math.floor(value).toLocaleString() : value.toFixed(1);
          if (t < 1) rafId = requestAnimationFrame(tick);
          else numEl.textContent = isInt ? target.toLocaleString() : String(target);
        }
        rafId = requestAnimationFrame(tick);

        const timers = [];
        timers.push(setTimeout(() => card && card.classList.add('in'), 80));
        const changeEl = el.querySelector('.kpi-change');
        if (changeEl) timers.push(setTimeout(() => changeEl.classList.add('in'), 1100));

        return () => {
          cancelAnimationFrame(rafId);
          timers.forEach(clearTimeout);
        };
      },
      replay(el) {
        const numEl = el.querySelector('.kpi-num');
        if (numEl) numEl.textContent = '0';
        const card = el.querySelector('.kpi');
        if (card) card.classList.remove('in');
        const changeEl = el.querySelector('.kpi-change');
        if (changeEl) changeEl.classList.remove('in');
        return this.init(el);
      }
    };
  };

  function escape(s) {
    return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }
})(typeof window !== 'undefined' ? window : globalThis);
