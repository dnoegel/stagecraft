'use strict';

/**
 * Stage.Agenda — vertical schedule with time on left, label on right.
 *
 * Usage:
 *   Stage.register(Stage.Agenda({
 *     section: 63,
 *     title: '63 · Today',
 *     items: [
 *       { time: '09:00', label: 'Welcome',        duration: '15 min', icon: 'waving_hand' },
 *       { time: '09:15', label: 'Keynote',        duration: '45 min', icon: 'campaign' },
 *       { time: '10:00', label: 'Coffee',         duration: '20 min', icon: 'coffee' }
 *     ],
 *     reveal: 'staggered'  // 'instant' | 'staggered' | 'per-click'
 *   }));
 *
 * Edit paths: items[i].time / .label / .duration / .icon
 */

(function (root) {
  const Stage = root.Stage = root.Stage || {};

  Stage.Agenda = function (opts) {
    const items = opts.items || [];
    const reveal = opts.reveal || 'instant';

    const slide = {
      section: opts.section,
      title: opts.title,
      transition: opts.transition,
      render(el) {
        el.innerHTML = `
          <div class="agenda" data-stage-key="Agenda">
            <div class="agenda-rail"></div>
            ${items.map((it, i) => `
              <div class="agenda-item" data-step="${i + 1}" data-stage-key="Agenda/item[${i}]">
                ${it.time ? `<div class="agenda-time" data-stage-edit="items[${i}].time">${escape(it.time)}</div>` : `<div class="agenda-time"></div>`}
                <div class="agenda-dot">
                  ${it.icon ? `<span class="material-symbols-outlined" data-stage-edit="items[${i}].icon">${escape(it.icon)}</span>` : ''}
                </div>
                <div class="agenda-body">
                  <div class="agenda-label" data-stage-edit="items[${i}].label">${escape(it.label || '')}</div>
                  ${it.duration ? `<div class="agenda-duration" data-stage-edit="items[${i}].duration">${escape(it.duration)}</div>` : ''}
                </div>
              </div>
            `).join('')}
          </div>
        `;
        if (reveal === 'instant') {
          el.querySelectorAll('.agenda-item').forEach(n => n.classList.add('in'));
        }
      }
    };

    if (reveal === 'staggered') {
      slide.init = function (el) {
        return Stage.staggerIn(el.querySelectorAll('.agenda-item'), 140, 180);
      };
      slide.replay = function (el) {
        el.querySelectorAll('.agenda-item').forEach(n => n.classList.remove('in'));
        return this.init(el);
      };
    } else if (reveal === 'per-click') {
      slide.steps = items.length;
      slide.onStep = function (el, step) {
        el.querySelectorAll('.agenda-item').forEach(n => {
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
