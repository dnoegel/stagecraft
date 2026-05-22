'use strict';

/**
 * Stage.Tip — compact single-paragraph emphasis box.
 *
 * Use when you want to highlight one thought (not a whole section).
 * For multi-line callouts with heading + body, use Stage.Callout.
 *
 * Usage:
 *   Stage.register(Stage.Tip({
 *     section: 68,
 *     title: '68 · Tip',
 *     kind: 'tip',                 // 'info' | 'tip' | 'warning' | 'danger' | 'success'
 *     icon: 'lightbulb',           // optional
 *     body: 'Think before you commit. Commit before you think too much.'
 *   }));
 *
 * Edit path: body
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

  Stage.Tip = function (opts) {
    const kind = DEFAULTS[opts.kind] ? opts.kind : 'tip';
    const icon = opts.icon || DEFAULTS[kind].icon;

    return {
      section: opts.section,
      title: opts.title,
      transition: opts.transition,
      render(el) {
        el.innerHTML = `
          <div class="tip tip--${kind}" data-stage-key="Tip">
            <span class="tip-icon material-symbols-outlined">${escape(icon)}</span>
            <p class="tip-body" data-stage-edit="body" data-stage-key="Tip/body">${escape(opts.body || '')}</p>
          </div>
        `;
      },
      init(el) {
        const tip = el.querySelector('.tip');
        const t = setTimeout(() => tip?.classList.add('in'), 100);
        return () => clearTimeout(t);
      },
      replay(el) {
        el.querySelector('.tip')?.classList.remove('in');
        return this.init(el);
      }
    };
  };

  function escape(s) {
    return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }
})(typeof window !== 'undefined' ? window : globalThis);
