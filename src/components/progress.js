'use strict';

/**
 * Stage.Progress — stacked horizontal progress bars.
 *
 * Usage:
 *   Stage.register(Stage.Progress({
 *     section: 6,
 *     title: '06 · How far we got',
 *     items: [
 *       { label: 'Spec',          value: 92, color: 'accent' },
 *       { label: 'Implementation',value: 68, color: 'blue'   },
 *       { label: 'Tests',         value: 41, color: 'amber'  },
 *       { label: 'Docs',          value: 12, color: 'red'    }
 *     ],
 *     reveal: 'animated'  // 'instant' | 'animated' | 'per-click'
 *   }));
 *
 * Each item: `value` is treated as a fraction of `total` (default 100).
 * So the default is straight percentages.
 *
 * Layer-3 (inline edit): items[i].label, items[i].value.
 */

(function (root) {
  const Stage = root.Stage = root.Stage || {};

  Stage.Progress = function (opts) {
    const items = opts.items || [];
    const reveal = opts.reveal || 'instant';

    function pctFor(it) {
      const total = Number(it.total) > 0 ? Number(it.total) : 100;
      const v = Number(it.value) || 0;
      return Math.max(0, Math.min(100, (v / total) * 100));
    }

    function displayFor(it) {
      // For total=100 (default), show the value itself as percent. Otherwise
      // show the computed percentage rounded to nearest integer.
      const total = Number(it.total) > 0 ? Number(it.total) : 100;
      if (total === 100) return `${Math.round(Number(it.value) || 0)}%`;
      return `${Math.round(pctFor(it))}%`;
    }

    const slide = {
      section: opts.section,
      title: opts.title,
      transition: opts.transition,
      render(el) {
        const rows = items.map((it, i) => {
          const colorCls = it.color ? ` ${it.color}` : '';
          const p = pctFor(it);
          return `
            <div class="progress-row${colorCls}"
                 data-step="${i + 1}"
                 data-pct="${p}"
                 data-stage-key="Progress/item[${i}]">
              <div class="progress-label" data-stage-edit="items[${i}].label">${escape(it.label || '')}</div>
              <div class="progress-track" data-stage-key="Progress/item[${i}]/track">
                <div class="progress-fill" style="width: 0%;"></div>
              </div>
              <div class="progress-value" data-stage-edit="items[${i}].value">${escape(displayFor(it))}</div>
            </div>
          `;
        }).join('');

        el.innerHTML = `
          <div class="progress-list" data-stage-key="Progress">
            ${rows}
          </div>
        `;

        if (reveal === 'instant') {
          el.querySelectorAll('.progress-row').forEach(row => {
            row.classList.add('in');
            const fill = row.querySelector('.progress-fill');
            if (fill) {
              fill.style.transition = 'none';
              fill.style.width = `${row.dataset.pct}%`;
              // eslint-disable-next-line no-unused-expressions
              fill.offsetWidth;
              fill.style.transition = '';
            }
          });
        }
      }
    };

    if (reveal === 'animated') {
      slide.init = function (el) {
        const rows = Array.from(el.querySelectorAll('.progress-row'));
        const timers = [];
        rows.forEach((row, i) => {
          timers.push(setTimeout(() => {
            row.classList.add('in');
            const fill = row.querySelector('.progress-fill');
            if (fill) fill.style.width = `${row.dataset.pct}%`;
          }, 200 + i * 180));
        });
        return () => timers.forEach(clearTimeout);
      };
      slide.replay = function (el) {
        el.querySelectorAll('.progress-row').forEach(row => {
          row.classList.remove('in');
          const fill = row.querySelector('.progress-fill');
          if (fill) {
            fill.style.transition = 'none';
            fill.style.width = '0%';
            // eslint-disable-next-line no-unused-expressions
            fill.offsetWidth;
            fill.style.transition = '';
          }
        });
        return this.init(el);
      };
    } else if (reveal === 'per-click') {
      slide.steps = items.length;
      slide.onStep = function (el, step) {
        el.querySelectorAll('.progress-row').forEach((row) => {
          const s = Number(row.dataset.step);
          const on = s <= step;
          row.classList.toggle('in', on);
          const fill = row.querySelector('.progress-fill');
          if (fill) fill.style.width = on ? `${row.dataset.pct}%` : '0%';
        });
      };
    }

    return slide;
  };

  function escape(s) {
    return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }
})(typeof window !== 'undefined' ? window : globalThis);
