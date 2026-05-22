'use strict';

/**
 * Stage.Compare — two-column comparison (old vs new).
 *
 * Usage:
 *   Stage.register(Stage.Compare({
 *     section: 4,
 *     title: 'before / after',
 *     left:  { heading: 'OLD', items: ['type', 'compile', 'run'], style: 'strikethrough' },
 *     right: { heading: 'NEW', items: ['describe', 'review', 'ship'], style: 'accent' },
 *     reveal: 'staggered' // | 'instant' | 'per-click'
 *   }));
 */

(function (root) {
  const Stage = root.Stage = root.Stage || {};

  Stage.Compare = function (opts) {
    const left = opts.left || { heading: '', items: [] };
    const right = opts.right || { heading: '', items: [] };
    const reveal = opts.reveal || 'instant';

    const slide = {
      section: opts.section,
      title: opts.title,
      transition: opts.transition,
      render(el) {
        el.innerHTML = `
          <div class="compare" data-stage-key="Compare">
            <div class="compare-col" data-stage-key="Compare/left">
              <div class="compare-h ${classFor(left.style)}" data-stage-edit="left.heading">${escape(left.heading)}</div>
              <ul class="compare-list ${left.style || ''}">
                ${left.items.map((it, i) => `<li data-step="${i + 1}" data-stage-edit="left.items[${i}]" data-stage-key="Compare/left/item[${i}]">${escape(it)}</li>`).join('')}
              </ul>
            </div>
            <div class="compare-divider"></div>
            <div class="compare-col" data-stage-key="Compare/right">
              <div class="compare-h ${classFor(right.style)}" data-stage-edit="right.heading">${escape(right.heading)}</div>
              <ul class="compare-list ${right.style || ''}">
                ${right.items.map((it, i) => `<li data-step="${left.items.length + i + 1}" data-stage-edit="right.items[${i}]" data-stage-key="Compare/right/item[${i}]">${escape(it)}</li>`).join('')}
              </ul>
            </div>
          </div>
        `;
        if (reveal === 'instant') {
          el.querySelectorAll('li').forEach(n => n.classList.add('in'));
        }
      }
    };

    if (reveal === 'staggered') {
      slide.init = function (el) {
        const all = [
          ...el.querySelectorAll('.compare-col:first-child li'),
          ...el.querySelectorAll('.compare-col:last-child li')
        ];
        return Stage.staggerIn(all, 200, 200);
      };
      slide.replay = function (el) {
        el.querySelectorAll('li').forEach(n => n.classList.remove('in'));
        return this.init(el);
      };
    } else if (reveal === 'per-click') {
      slide.steps = left.items.length + right.items.length;
      slide.onStep = function (el, step) {
        el.querySelectorAll('li').forEach(n => {
          n.classList.toggle('in', Number(n.dataset.step) <= step);
        });
      };
    }

    return slide;
  };

  function classFor(style) {
    if (style === 'strikethrough') return 'old';
    if (style === 'accent') return 'new';
    return '';
  }

  function escape(s) {
    return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }
})(typeof window !== 'undefined' ? window : globalThis);
