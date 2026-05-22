'use strict';

/**
 * Stage.Pillars — N evenly-spaced columns, each with material icon, heading, body.
 *
 * Usage:
 *   Stage.register(Stage.Pillars({
 *     section: 4,
 *     title: '04 · Three pillars',
 *     intro: 'How the work splits',
 *     pillars: [
 *       { icon: 'bolt',  heading: 'Speed',    body: 'tight loops',   color: 'accent' },
 *       { icon: 'shield',heading: 'Trust',    body: 'evidence first',color: 'blue'   },
 *       { icon: 'eco',   heading: 'Restraint',body: 'do less',       color: 'amber'  }
 *     ],
 *     reveal: 'staggered'   // 'instant' | 'staggered' | 'per-click'
 *   }));
 *
 * Edit paths:
 *   intro / pillars[i].icon / pillars[i].heading / pillars[i].body
 */

(function (root) {
  const Stage = root.Stage = root.Stage || {};

  Stage.Pillars = function (opts) {
    const pillars = opts.pillars || [];
    const reveal = opts.reveal || 'instant';
    const intro = opts.intro || '';
    const count = Math.min(pillars.length, 5);

    const slide = {
      section: opts.section,
      title: opts.title,
      transition: opts.transition,
      render(el) {
        el.innerHTML = `
          <div class="pillars-wrap" data-stage-key="Pillars">
            ${intro ? `<div class="pillars-intro" data-stage-edit="intro" data-stage-key="Pillars/intro">${escape(intro)}</div>` : ''}
            <div class="pillars-grid" style="--pillars-count: ${count};">
              ${pillars.map((p, i) => `
                <div class="pillar ${p.color ? 'pc-' + escape(p.color) : ''}" data-step="${i + 1}" data-stage-key="Pillars/pillar[${i}]">
                  <span class="pillar-icon material-symbols-outlined" data-stage-edit="pillars[${i}].icon">${escape(p.icon || 'circle')}</span>
                  <div class="pillar-heading" data-stage-edit="pillars[${i}].heading" data-stage-key="Pillars/pillar[${i}]/heading">${escape(p.heading || '')}</div>
                  ${p.body ? `<div class="pillar-body" data-stage-edit="pillars[${i}].body" data-stage-key="Pillars/pillar[${i}]/body">${escape(p.body)}</div>` : ''}
                </div>
              `).join('')}
            </div>
          </div>
        `;
        if (reveal === 'instant') {
          el.querySelectorAll('.pillar').forEach(n => n.classList.add('in'));
        }
      }
    };

    if (reveal === 'staggered') {
      slide.init = function (el) {
        return Stage.staggerIn(el.querySelectorAll('.pillar'), 180, 200);
      };
      slide.replay = function (el) {
        el.querySelectorAll('.pillar').forEach(n => n.classList.remove('in'));
        return this.init(el);
      };
    } else if (reveal === 'per-click') {
      slide.steps = pillars.length;
      slide.onStep = function (el, step) {
        el.querySelectorAll('.pillar').forEach(n => {
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
