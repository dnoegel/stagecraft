'use strict';

/**
 * Stage.Checklist — items with checkbox icons; `done: true` items render checked.
 *
 * Usage:
 *   Stage.register(Stage.Checklist({
 *     section: 64,
 *     title: '64 · Pre-launch',
 *     items: [
 *       { text: 'Specs reviewed', done: true },
 *       { text: 'Tests green',    done: true,  body: 'CI passing on all branches' },
 *       { text: 'Docs updated' },
 *       { text: 'Comms drafted' }
 *     ],
 *     reveal: 'staggered'  // 'instant' | 'staggered' | 'per-click'
 *   }));
 *
 * Style choice: done items show a filled accent checkmark + softened text
 * (no strikethrough — looked cleaner). Undone items show an empty box outline.
 *
 * Edit paths: items[i].text / .body
 */

(function (root) {
  const Stage = root.Stage = root.Stage || {};

  Stage.Checklist = function (opts) {
    const items = opts.items || [];
    const reveal = opts.reveal || 'instant';

    const slide = {
      section: opts.section,
      title: opts.title,
      transition: opts.transition,
      render(el) {
        el.innerHTML = `
          <div class="checklist" data-stage-key="Checklist">
            ${items.map((it, i) => `
              <div class="checklist-item ${it.done ? 'is-done' : ''}"
                   data-step="${i + 1}"
                   data-stage-key="Checklist/item[${i}]">
                <span class="checklist-box material-symbols-outlined">${it.done ? 'check_box' : 'check_box_outline_blank'}</span>
                <div class="checklist-body">
                  <div class="checklist-text" data-stage-edit="items[${i}].text">${escape(it.text || '')}</div>
                  ${it.body ? `<div class="checklist-sub" data-stage-edit="items[${i}].body">${escape(it.body)}</div>` : ''}
                </div>
              </div>
            `).join('')}
          </div>
        `;
        if (reveal === 'instant') {
          el.querySelectorAll('.checklist-item').forEach(n => n.classList.add('in'));
        }
      }
    };

    if (reveal === 'staggered') {
      slide.init = function (el) {
        return Stage.staggerIn(el.querySelectorAll('.checklist-item'), 130, 180);
      };
      slide.replay = function (el) {
        el.querySelectorAll('.checklist-item').forEach(n => n.classList.remove('in'));
        return this.init(el);
      };
    } else if (reveal === 'per-click') {
      slide.steps = items.length;
      slide.onStep = function (el, step) {
        el.querySelectorAll('.checklist-item').forEach(n => {
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
