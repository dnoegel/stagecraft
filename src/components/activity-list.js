'use strict';

/**
 * Stage.ActivityList — numbered items (num · name · description).
 *
 * Usage:
 *   Stage.register(Stage.ActivityList({
 *     section: 3,
 *     title: 'Where the work goes',
 *     items: [
 *       { num: '01', name: 'Problem framing', desc: 'understand the actual ask' },
 *       { num: '02', name: 'Architecture',    desc: 'pick the shape' }
 *     ],
 *     reveal: 'staggered' // | 'per-click' | 'instant'
 *   }));
 *
 * Spare defaults: passing nothing for `reveal` gives instant.
 * Use 'staggered' for entrance animation, 'per-click' for step-by-step.
 */

(function (root) {
  const Stage = root.Stage = root.Stage || {};

  Stage.ActivityList = function (opts) {
    const items = opts.items || [];
    const reveal = opts.reveal || 'instant';

    const slide = {
      section: opts.section,
      title: opts.title,
      transition: opts.transition,
      render(el) {
        el.innerHTML = `
          <div class="activities" data-stage-key="ActivityList">
            ${items.map((it, i) => `
              <div class="activity" data-step="${i + 1}" data-stage-key="ActivityList/item[${i}]">
                <div class="num" data-stage-edit="items[${i}].num">${escape(it.num)}</div>
                <div class="body">
                  <div class="name" data-stage-edit="items[${i}].name">${it.name || ''}</div>
                  ${it.desc ? `<div class="desc" data-stage-edit="items[${i}].desc">${escape(it.desc)}</div>` : ''}
                </div>
              </div>
            `).join('')}
          </div>
        `;
        if (reveal === 'instant') {
          el.querySelectorAll('.activity').forEach(n => n.classList.add('in'));
        }
      }
    };

    if (reveal === 'staggered') {
      slide.init = function (el) {
        return Stage.staggerIn(el.querySelectorAll('.activity'), 300, 200);
      };
      slide.replay = function (el) {
        el.querySelectorAll('.activity').forEach(n => n.classList.remove('in'));
        return this.init(el);
      };
    } else if (reveal === 'per-click') {
      slide.steps = items.length;
      slide.onStep = function (el, step) {
        el.querySelectorAll('.activity').forEach(n => {
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
