'use strict';

/**
 * Stage.Steps — numbered tutorial steps (big numeral + label + body).
 *
 * Usage:
 *   Stage.register(Stage.Steps({
 *     section: 65,
 *     title: '65 · How it works',
 *     orientation: 'horizontal',   // 'horizontal' | 'vertical'
 *     steps: [
 *       { number: '01', label: 'Install',   body: 'Run npx stagecraft init.', icon: 'download' },
 *       { number: '02', label: 'Write',     body: 'Add slides to slides/.',  icon: 'edit' },
 *       { number: '03', label: 'Present',   body: 'Open in any browser.',    icon: 'present_to_all' }
 *     ],
 *     reveal: 'staggered'   // 'instant' | 'staggered' | 'per-click'
 *   }));
 *
 * Steps differ from ProcessFlow: ProcessFlow is about *flow* (arrows between
 * states); Steps is about *teaching* (numeral + explanation per step).
 *
 * Edit paths: steps[i].number / .label / .body / .icon
 */

(function (root) {
  const Stage = root.Stage = root.Stage || {};

  Stage.Steps = function (opts) {
    const stepsList = opts.steps || [];
    const reveal = opts.reveal || 'instant';
    const orientation = opts.orientation === 'vertical' ? 'vertical' : 'horizontal';

    const slide = {
      section: opts.section,
      title: opts.title,
      transition: opts.transition,
      render(el) {
        el.innerHTML = `
          <div class="steps steps--${orientation}" data-stage-key="Steps">
            ${stepsList.map((s, i) => `
              <div class="step-card" data-step="${i + 1}" data-stage-key="Steps/step[${i}]">
                <div class="step-numeral" data-stage-edit="steps[${i}].number">${escape(s.number || String(i + 1).padStart(2, '0'))}</div>
                <div class="step-content">
                  <div class="step-head">
                    ${s.icon ? `<span class="step-icon material-symbols-outlined" data-stage-edit="steps[${i}].icon">${escape(s.icon)}</span>` : ''}
                    <div class="step-label" data-stage-edit="steps[${i}].label">${escape(s.label || '')}</div>
                  </div>
                  ${s.body ? `<div class="step-body" data-stage-edit="steps[${i}].body">${escape(s.body)}</div>` : ''}
                </div>
              </div>
            `).join('')}
          </div>
        `;
        if (reveal === 'instant') {
          el.querySelectorAll('.step-card').forEach(n => n.classList.add('in'));
        }
      }
    };

    if (reveal === 'staggered') {
      slide.init = function (el) {
        return Stage.staggerIn(el.querySelectorAll('.step-card'), 200, 220);
      };
      slide.replay = function (el) {
        el.querySelectorAll('.step-card').forEach(n => n.classList.remove('in'));
        return this.init(el);
      };
    } else if (reveal === 'per-click') {
      slide.steps = stepsList.length;
      slide.onStep = function (el, step) {
        el.querySelectorAll('.step-card').forEach(n => {
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
