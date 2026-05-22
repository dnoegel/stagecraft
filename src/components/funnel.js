'use strict';

/**
 * Stage.Funnel — stacked trapezoids, narrowing top-to-bottom.
 *
 * Usage:
 *   Stage.register(Stage.Funnel({
 *     section: 8,
 *     title: '08 · Down to it',
 *     stages: [
 *       { label: 'Awareness',  value: '10k', body: 'first touch' },
 *       { label: 'Trial',      value: '2.4k' },
 *       { label: 'Adoption',   value: '600' },
 *       { label: 'Champions',  value: '42',  color: 'accent', body: 'outcome' }
 *     ],
 *     reveal: 'staggered'   // 'instant' | 'staggered' | 'per-click'
 *   }));
 *
 * Bottom is treated as the outcome and is implicitly accent-colored
 * unless its own `color` is set.
 */

(function (root) {
  const Stage = root.Stage = root.Stage || {};

  Stage.Funnel = function (opts) {
    const stages = opts.stages || [];
    const reveal = opts.reveal || 'instant';
    const n = stages.length;

    // Top widest (100%) -> bottom narrowest (~40%).
    function topWidth(i) {
      if (n <= 1) return 100;
      const min = 38;
      const max = 100;
      const t = i / n;            // before this layer
      return max - (max - min) * t;
    }
    function bottomWidth(i) {
      if (n <= 1) return 38;
      const min = 38;
      const max = 100;
      const t = (i + 1) / n;
      return max - (max - min) * t;
    }

    const slide = {
      section: opts.section,
      title: opts.title,
      transition: opts.transition,
      render(el) {
        el.innerHTML = `
          <div class="funnel" data-stage-key="Funnel">
            ${stages.map((stage, i) => {
              const tw = topWidth(i);
              const bw = bottomWidth(i);
              const isOutcome = i === n - 1;
              const colorClass = stage.color
                ? 'fnc-' + escape(stage.color)
                : (isOutcome ? 'fnc-accent' : '');
              // Build a CSS clip-path polygon trapezoid (percentages within the layer).
              const leftTop = ((100 - tw) / 2).toFixed(2);
              const rightTop = (100 - (100 - tw) / 2).toFixed(2);
              const leftBot = ((100 - bw) / 2).toFixed(2);
              const rightBot = (100 - (100 - bw) / 2).toFixed(2);
              const clip = `polygon(${leftTop}% 0%, ${rightTop}% 0%, ${rightBot}% 100%, ${leftBot}% 100%)`;
              return `
                <div class="fn-stage ${colorClass} ${isOutcome ? 'fn-outcome' : ''}"
                     data-step="${i + 1}"
                     data-stage-key="Funnel/stage[${i}]">
                  <div class="fn-shape" style="clip-path: ${clip}; -webkit-clip-path: ${clip};"></div>
                  <div class="fn-content" style="--fn-pad: ${((100 - Math.min(tw, bw)) / 2).toFixed(2)}%;">
                    <div class="fn-label" data-stage-edit="stages[${i}].label" data-stage-key="Funnel/stage[${i}]/label">${escape(stage.label || '')}</div>
                    ${stage.value ? `<div class="fn-value" data-stage-edit="stages[${i}].value" data-stage-key="Funnel/stage[${i}]/value">${escape(stage.value)}</div>` : ''}
                    ${stage.body ? `<div class="fn-body" data-stage-edit="stages[${i}].body" data-stage-key="Funnel/stage[${i}]/body">${escape(stage.body)}</div>` : ''}
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        `;
        if (reveal === 'instant') {
          el.querySelectorAll('.fn-stage').forEach(n => n.classList.add('in'));
        }
      }
    };

    if (reveal === 'staggered') {
      slide.init = function (el) {
        return Stage.staggerIn(el.querySelectorAll('.fn-stage'), 220, 200);
      };
      slide.replay = function (el) {
        el.querySelectorAll('.fn-stage').forEach(n => n.classList.remove('in'));
        return this.init(el);
      };
    } else if (reveal === 'per-click') {
      slide.steps = stages.length;
      slide.onStep = function (el, step) {
        el.querySelectorAll('.fn-stage').forEach(n => {
          n.classList.toggle('in', Number(n.dataset.step) <= step);
        });
      };
    }

    return slide;
  };

  function escape(s) {
    return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }
})(typeof window !== 'undefined' ? window : globalThis);
