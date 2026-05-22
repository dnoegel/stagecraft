'use strict';

/**
 * Stage.Timeline — horizontal (default) or vertical milestone track.
 *
 * Usage:
 *   Stage.register(Stage.Timeline({
 *     section: 5,
 *     title: '05 · The arc',
 *     orientation: 'horizontal',   // 'horizontal' | 'vertical'
 *     events: [
 *       { date: '2022', heading: 'Copilot',  body: 'autocomplete',    icon: 'flash_on' },
 *       { date: '2023', heading: 'ChatGPT',  body: 'conversation',    icon: 'chat'     },
 *       { date: '2024', heading: 'Agents',   body: 'autonomy',        icon: 'memory'   }
 *     ],
 *     reveal: 'staggered'          // 'instant' | 'staggered' | 'per-click'
 *   }));
 *
 * Edit paths:
 *   events[i].date / .heading / .body / .icon
 */

(function (root) {
  const Stage = root.Stage = root.Stage || {};

  Stage.Timeline = function (opts) {
    const events = opts.events || [];
    const reveal = opts.reveal || 'instant';
    const orientation = opts.orientation === 'vertical' ? 'vertical' : 'horizontal';

    const slide = {
      section: opts.section,
      title: opts.title,
      transition: opts.transition,
      render(el) {
        el.innerHTML = `
          <div class="timeline timeline--${orientation}" data-stage-key="Timeline">
            <div class="timeline-track"></div>
            <div class="timeline-events">
              ${events.map((ev, i) => `
                <div class="tl-event ${ev.color ? 'tc-' + escape(ev.color) : ''}" data-step="${i + 1}" data-stage-key="Timeline/event[${i}]">
                  <div class="tl-date" data-stage-edit="events[${i}].date" data-stage-key="Timeline/event[${i}]/date">${escape(ev.date || '')}</div>
                  <div class="tl-dot">
                    ${ev.icon ? `<span class="tl-icon material-symbols-outlined" data-stage-edit="events[${i}].icon">${escape(ev.icon)}</span>` : ''}
                  </div>
                  <div class="tl-text">
                    <div class="tl-heading" data-stage-edit="events[${i}].heading" data-stage-key="Timeline/event[${i}]/heading">${escape(ev.heading || '')}</div>
                    ${ev.body ? `<div class="tl-body" data-stage-edit="events[${i}].body" data-stage-key="Timeline/event[${i}]/body">${escape(ev.body)}</div>` : ''}
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        `;
        if (reveal === 'instant') {
          el.querySelectorAll('.tl-event').forEach(n => n.classList.add('in', 'active'));
        }
      }
    };

    if (reveal === 'staggered') {
      slide.init = function (el) {
        const nodes = el.querySelectorAll('.tl-event');
        const timers = [];
        nodes.forEach((n, i) => {
          timers.push(setTimeout(() => { n.classList.add('in'); n.classList.add('active'); }, 200 + i * 280));
        });
        return () => timers.forEach(clearTimeout);
      };
      slide.replay = function (el) {
        el.querySelectorAll('.tl-event').forEach(n => n.classList.remove('in', 'active'));
        return this.init(el);
      };
    } else if (reveal === 'per-click') {
      slide.steps = events.length;
      slide.onStep = function (el, step) {
        el.querySelectorAll('.tl-event').forEach(n => {
          const idx = Number(n.dataset.step);
          n.classList.toggle('in', idx <= step);
          n.classList.toggle('active', idx === step);
        });
      };
    }

    return slide;
  };

  function escape(s) {
    return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }
})(typeof window !== 'undefined' ? window : globalThis);
