'use strict';

/**
 * Stage.BarChart — simple horizontal or vertical bar chart.
 *
 * Usage:
 *   Stage.register(Stage.BarChart({
 *     section: 4,
 *     title: '04 · where the hours go',
 *     orientation: 'horizontal',   // default
 *     bars: [
 *       { label: 'Coding',    value: 6,  color: 'accent' },
 *       { label: 'Meetings',  value: 3,  color: 'amber'  },
 *       { label: 'Slack',     value: 2,  color: 'blue'   },
 *       { label: 'Thinking',  value: 1,  color: 'dim'    }
 *     ],
 *     unit: ' h',
 *     reveal: 'animated'  // 'instant' | 'animated' | 'per-click'
 *   }));
 *
 * `maxValue` defaults to max(values) * 1.1.
 * Animation: CSS transitions on width/height when `.fill` class lands.
 *
 * Layer-3 (inline edit): bars[i].label, bars[i].value, unit, title.
 */

(function (root) {
  const Stage = root.Stage = root.Stage || {};

  Stage.BarChart = function (opts) {
    const bars = opts.bars || [];
    const orientation = opts.orientation === 'vertical' ? 'vertical' : 'horizontal';
    const unit = opts.unit || '';
    const reveal = opts.reveal || 'instant';
    const values = bars.map(b => Number(b.value) || 0);
    const computedMax = values.length ? Math.max(...values) : 1;
    const maxValue = Number(opts.maxValue) > 0
      ? Number(opts.maxValue)
      : (computedMax > 0 ? computedMax * 1.1 : 1);

    function pct(v) {
      const p = (Number(v) || 0) / maxValue * 100;
      return Math.max(0, Math.min(100, p));
    }

    function formatValue(v) {
      // Keep simple — leave numeric formatting to the caller via value/unit.
      return `${v}${unit}`;
    }

    const slide = {
      section: opts.section,
      title: opts.title,
      transition: opts.transition,
      render(el) {
        const sizeProp = orientation === 'vertical' ? 'height' : 'width';
        const rows = bars.map((b, i) => {
          const colorCls = b.color ? ` ${b.color}` : '';
          const p = pct(b.value);
          return `
            <div class="bar-row${colorCls}"
                 data-step="${i + 1}"
                 data-pct="${p}"
                 data-stage-key="BarChart/bar[${i}]">
              <div class="bar-label" data-stage-edit="bars[${i}].label">${escape(b.label || '')}</div>
              <div class="bar-track" data-stage-key="BarChart/bar[${i}]/track">
                <div class="bar-fill" style="${sizeProp}: 0%;"></div>
              </div>
              <div class="bar-value" data-stage-edit="bars[${i}].value">${escape(formatValue(b.value))}</div>
            </div>
          `;
        }).join('');

        el.innerHTML = `
          <div class="barchart ${orientation}" data-stage-key="BarChart">
            ${rows}
          </div>
        `;

        if (reveal === 'instant') {
          // Place rows + fills in their final state with no transition.
          el.querySelectorAll('.bar-row').forEach(n => n.classList.add('in'));
          el.querySelectorAll('.bar-row').forEach(row => {
            const fill = row.querySelector('.bar-fill');
            const p = row.dataset.pct;
            if (fill) {
              // Suppress the transition for the initial paint only.
              fill.style.transition = 'none';
              fill.style[sizeProp] = `${p}%`;
              // Force reflow then restore transition.
              // eslint-disable-next-line no-unused-expressions
              fill.offsetWidth;
              fill.style.transition = '';
            }
          });
        }
      }
    };

    const sizeProp = orientation === 'vertical' ? 'height' : 'width';

    function fillRow(row, immediate) {
      const fill = row.querySelector('.bar-fill');
      if (!fill) return;
      const p = row.dataset.pct;
      if (immediate) {
        fill.style.transition = 'none';
        fill.style[sizeProp] = `${p}%`;
        // eslint-disable-next-line no-unused-expressions
        fill.offsetWidth;
        fill.style.transition = '';
      } else {
        fill.style[sizeProp] = `${p}%`;
      }
    }

    if (reveal === 'animated') {
      slide.init = function (el) {
        const rows = Array.from(el.querySelectorAll('.bar-row'));
        const timers = [];
        rows.forEach((row, i) => {
          timers.push(setTimeout(() => {
            row.classList.add('in');
            fillRow(row, false);
          }, 200 + i * 220));
        });
        return () => timers.forEach(clearTimeout);
      };
      slide.replay = function (el) {
        el.querySelectorAll('.bar-row').forEach(row => {
          row.classList.remove('in');
          const fill = row.querySelector('.bar-fill');
          if (fill) {
            fill.style.transition = 'none';
            fill.style[sizeProp] = '0%';
            // eslint-disable-next-line no-unused-expressions
            fill.offsetWidth;
            fill.style.transition = '';
          }
        });
        return this.init(el);
      };
    } else if (reveal === 'per-click') {
      slide.steps = bars.length;
      slide.onStep = function (el, step) {
        el.querySelectorAll('.bar-row').forEach((row) => {
          const s = Number(row.dataset.step);
          const on = s <= step;
          row.classList.toggle('in', on);
          const fill = row.querySelector('.bar-fill');
          if (fill) fill.style[sizeProp] = on ? `${row.dataset.pct}%` : '0%';
        });
      };
    }

    return slide;
  };

  function escape(s) {
    return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }
})(typeof window !== 'undefined' ? window : globalThis);
