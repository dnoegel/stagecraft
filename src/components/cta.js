'use strict';

/**
 * Stage.CTA — large call-to-action card.
 *
 * Usage:
 *   Stage.register(Stage.CTA({
 *     section: 66,
 *     title: '66 · Take action',
 *     headline: 'Ship the next release with confidence.',
 *     body: 'Start your 14-day trial. No credit card.',
 *     action: { label: 'Start free trial', hint: 'No setup required' },
 *     accent: true
 *   }));
 *
 * The button is visual only — it does not navigate.
 *
 * Edit paths: headline / body / action.label / action.hint
 */

(function (root) {
  const Stage = root.Stage = root.Stage || {};

  Stage.CTA = function (opts) {
    const action = opts.action || {};
    const accent = opts.accent === true;

    return {
      section: opts.section,
      title: opts.title,
      transition: opts.transition,
      render(el) {
        el.innerHTML = `
          <div class="cta ${accent ? 'cta--accent' : ''}" data-stage-key="CTA">
            <div class="cta-headline" data-stage-edit="headline" data-stage-key="CTA/headline">${escape(opts.headline || '')}</div>
            ${opts.body ? `<div class="cta-body" data-stage-edit="body" data-stage-key="CTA/body">${escape(opts.body)}</div>` : ''}
            <div class="cta-action" data-stage-key="CTA/action">
              <span class="cta-button">
                <span class="cta-button-label" data-stage-edit="action.label">${escape(action.label || 'Get started')}</span>
                <span class="cta-button-arrow material-symbols-outlined">arrow_forward</span>
              </span>
              ${action.hint ? `<span class="cta-hint" data-stage-edit="action.hint">${escape(action.hint)}</span>` : ''}
            </div>
          </div>
        `;
      },
      init(el) {
        const nodes = [
          el.querySelector('.cta-headline'),
          el.querySelector('.cta-body'),
          el.querySelector('.cta-action')
        ].filter(Boolean);
        const timers = [];
        nodes.forEach((n, i) => {
          timers.push(setTimeout(() => n.classList.add('in'), 150 + i * 250));
        });
        return () => timers.forEach(clearTimeout);
      },
      replay(el) {
        el.querySelectorAll('.cta-headline, .cta-body, .cta-action').forEach(n => n.classList.remove('in'));
        return this.init(el);
      }
    };
  };

  function escape(s) {
    return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }
})(typeof window !== 'undefined' ? window : globalThis);
