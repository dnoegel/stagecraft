'use strict';

/**
 * Stage.Callout — sidebar callout box with colored left border and icon.
 *
 * Usage:
 *   Stage.register(Stage.Callout({
 *     section: 67,
 *     title: '67 · Callout',
 *     kind: 'tip',          // 'info' | 'tip' | 'warning' | 'danger' | 'success'
 *     icon: 'lightbulb',    // optional override; default per kind
 *     heading: 'Pro tip',
 *     body: 'Keep your specs short and your reviews shorter.',
 *     reveal: 'staggered'   // 'instant' | 'staggered'
 *   }));
 *
 * Edit paths: heading / body
 */

(function (root) {
  const Stage = root.Stage = root.Stage || {};

  const DEFAULTS = {
    info:    { icon: 'info'         },
    tip:     { icon: 'lightbulb'    },
    warning: { icon: 'warning'      },
    danger:  { icon: 'error'        },
    success: { icon: 'check_circle' }
  };

  Stage.Callout = function (opts) {
    const kind = DEFAULTS[opts.kind] ? opts.kind : 'info';
    const icon = opts.icon || DEFAULTS[kind].icon;
    const reveal = opts.reveal || 'instant';

    const slide = {
      section: opts.section,
      title: opts.title,
      transition: opts.transition,
      render(el) {
        el.innerHTML = `
          <div class="callout callout--${kind}" data-stage-key="Callout">
            <span class="callout-icon material-symbols-outlined">${escape(icon)}</span>
            <div class="callout-body">
              <div class="callout-heading" data-stage-edit="heading" data-stage-key="Callout/heading">${escape(opts.heading || '')}</div>
              <div class="callout-text" data-stage-edit="body" data-stage-key="Callout/body">${escape(opts.body || '')}</div>
            </div>
          </div>
        `;
        if (reveal === 'instant') {
          el.querySelector('.callout')?.classList.add('in');
        }
      }
    };

    if (reveal === 'staggered') {
      slide.init = function (el) {
        const co = el.querySelector('.callout');
        const t1 = setTimeout(() => co?.classList.add('in'), 120);
        const t2 = setTimeout(() => co?.classList.add('reveal-text'), 480);
        return () => { clearTimeout(t1); clearTimeout(t2); };
      };
      slide.replay = function (el) {
        el.querySelector('.callout')?.classList.remove('in', 'reveal-text');
        return this.init(el);
      };
    }

    return slide;
  };

  function escape(s) {
    return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }
})(typeof window !== 'undefined' ? window : globalThis);
