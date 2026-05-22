'use strict';

/**
 * Stage.ProcessFlow — sequence of step cards joined by arrows.
 *
 * Usage:
 *   Stage.register(Stage.ProcessFlow({
 *     section: 3,
 *     title: '03 · the loop',
 *     orientation: 'horizontal',   // default | 'vertical'
 *     steps: [
 *       { icon: 'edit_note',    label: 'Draft',  body: 'frame the intent',  color: 'accent' },
 *       { icon: 'visibility',   label: 'Review', body: 'read the diff',     color: 'blue'   },
 *       { icon: 'science',      label: 'Verify', body: 'run the evidence',  color: 'amber'  },
 *       { icon: 'rocket_launch',label: 'Ship',   body: 'land the change'                    }
 *     ],
 *     reveal: 'staggered'   // 'instant' | 'staggered' | 'per-click'
 *   }));
 *
 * Icons are Google Material Symbols (rendered via
 *   <span class="material-symbols-outlined">name</span>).
 *
 * For `per-click` reveal each arrow pulses briefly as the next step lands.
 *
 * Layer-3 (inline edit): steps[i].label, steps[i].body, steps[i].icon.
 */

(function (root) {
  const Stage = root.Stage = root.Stage || {};

  Stage.ProcessFlow = function (opts) {
    const steps = opts.steps || [];
    const orientation = opts.orientation === 'vertical' ? 'vertical' : 'horizontal';
    const reveal = opts.reveal || 'instant';
    const arrowChar = orientation === 'vertical' ? '↓' : '→';

    const slide = {
      section: opts.section,
      title: opts.title,
      transition: opts.transition,
      render(el) {
        const parts = [];
        steps.forEach((s, i) => {
          const colorCls = s.color ? ` ${s.color}` : '';
          parts.push(`
            <div class="pf-step${colorCls}"
                 data-step="${i + 1}"
                 data-stage-key="ProcessFlow/step[${i}]">
              ${s.icon ? `
                <div class="pf-icon" data-stage-key="ProcessFlow/step[${i}]/icon">
                  <span class="material-symbols-outlined" data-stage-edit="steps[${i}].icon">${escape(s.icon)}</span>
                </div>` : ''}
              <div class="pf-label" data-stage-edit="steps[${i}].label">${escape(s.label || '')}</div>
              ${s.body ? `<div class="pf-body" data-stage-edit="steps[${i}].body">${escape(s.body)}</div>` : ''}
            </div>
          `);
          if (i < steps.length - 1) {
            parts.push(`
              <div class="pf-arrow"
                   data-step="${i + 1}"
                   data-arrow-after="${i}"
                   data-stage-key="ProcessFlow/arrow[${i}]"
                   aria-hidden="true">${arrowChar}</div>
            `);
          }
        });

        el.innerHTML = `
          <div class="processflow ${orientation}" data-stage-key="ProcessFlow">
            ${parts.join('')}
          </div>
        `;

        if (reveal === 'instant') {
          el.querySelectorAll('.pf-step, .pf-arrow').forEach(n => n.classList.add('in'));
        }
      }
    };

    if (reveal === 'staggered') {
      slide.init = function (el) {
        const nodes = Array.from(el.querySelectorAll('.pf-step, .pf-arrow'));
        const timers = [];
        nodes.forEach((n, i) => {
          // Steps in a bit longer than arrows so the card lands before the arrow.
          const delay = 200 + i * 220;
          timers.push(setTimeout(() => n.classList.add('in'), delay));
        });
        return () => timers.forEach(clearTimeout);
      };
      slide.replay = function (el) {
        el.querySelectorAll('.pf-step, .pf-arrow').forEach(n => {
          n.classList.remove('in');
          n.classList.remove('pulse');
        });
        return this.init(el);
      };
    } else if (reveal === 'per-click') {
      slide.steps = steps.length;
      slide.onStep = function (el, step) {
        const stepNodes = el.querySelectorAll('.pf-step');
        const arrowNodes = el.querySelectorAll('.pf-arrow');
        stepNodes.forEach(n => {
          n.classList.toggle('in', Number(n.dataset.step) <= step);
        });
        arrowNodes.forEach(n => {
          const idx = Number(n.dataset.arrowAfter);
          // Arrow between step[i] and step[i+1] becomes visible after step[i+1] lands.
          const visible = (idx + 1) < step;
          n.classList.toggle('in', visible);
        });
        // Pulse the arrow that just connected (if any).
        if (step >= 2) {
          const justConnectedIdx = step - 2; // arrow index between step (step-1) and step
          const arrow = el.querySelector(`.pf-arrow[data-arrow-after="${justConnectedIdx}"]`);
          if (arrow) {
            arrow.classList.remove('pulse');
            // Restart animation
            // eslint-disable-next-line no-unused-expressions
            arrow.offsetWidth;
            arrow.classList.add('pulse');
          }
        }
      };
    }

    return slide;
  };

  function escape(s) {
    return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }
})(typeof window !== 'undefined' ? window : globalThis);
