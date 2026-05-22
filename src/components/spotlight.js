'use strict';

/**
 * Stage.Spotlight — one focal item with dimmer supporting items beneath.
 *
 * Usage:
 *   Stage.register(Stage.Spotlight({
 *     section: 7,
 *     title: '07 · The one thing',
 *     focus: {
 *       icon: 'auto_awesome',
 *       heading: 'Taste',
 *       body: 'The scarce part. Still yours to bring.'
 *     },
 *     context: ['speed', 'scale', 'cost', 'tooling'],
 *     reveal: 'staggered'   // 'staggered' | 'instant'
 *   }));
 *
 * Edit paths:
 *   focus.heading / focus.body / focus.icon / context[i]
 */

(function (root) {
  const Stage = root.Stage = root.Stage || {};

  Stage.Spotlight = function (opts) {
    const focus = opts.focus || {};
    const context = Array.isArray(opts.context) ? opts.context : [];
    const reveal = opts.reveal || 'instant';

    const slide = {
      section: opts.section,
      title: opts.title,
      transition: opts.transition,
      render(el) {
        el.innerHTML = `
          <div class="spotlight" data-stage-key="Spotlight">
            <div class="sp-focus" data-stage-key="Spotlight/focus">
              ${focus.icon ? `<span class="sp-icon material-symbols-outlined" data-stage-edit="focus.icon">${escape(focus.icon)}</span>` : ''}
              <div class="sp-focus-text">
                <div class="sp-heading" data-stage-edit="focus.heading" data-stage-key="Spotlight/focus/heading">${escape(focus.heading || '')}</div>
                ${focus.body ? `<div class="sp-body" data-stage-edit="focus.body" data-stage-key="Spotlight/focus/body">${escape(focus.body)}</div>` : ''}
              </div>
            </div>
            ${context.length ? `
              <div class="sp-context" data-stage-key="Spotlight/context">
                ${context.map((c, i) => `
                  <div class="sp-ctx-item" data-step="${i + 1}" data-stage-edit="context[${i}]" data-stage-key="Spotlight/context[${i}]">${escape(c)}</div>
                `).join('')}
              </div>
            ` : ''}
          </div>
        `;
        if (reveal === 'instant') {
          const focusEl = el.querySelector('.sp-focus');
          if (focusEl) focusEl.classList.add('in');
          el.querySelectorAll('.sp-ctx-item').forEach(n => n.classList.add('in'));
        }
      }
    };

    if (reveal === 'staggered') {
      slide.init = function (el) {
        const focusEl = el.querySelector('.sp-focus');
        const ctx = el.querySelectorAll('.sp-ctx-item');
        const timers = [];
        timers.push(setTimeout(() => focusEl && focusEl.classList.add('in'), 150));
        ctx.forEach((n, i) => {
          timers.push(setTimeout(() => n.classList.add('in'), 700 + i * 140));
        });
        return () => timers.forEach(clearTimeout);
      };
      slide.replay = function (el) {
        el.querySelectorAll('.sp-focus, .sp-ctx-item').forEach(n => n.classList.remove('in'));
        return this.init(el);
      };
    }

    return slide;
  };

  function escape(s) {
    return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }
})(typeof window !== 'undefined' ? window : globalThis);
