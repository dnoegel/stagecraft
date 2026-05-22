'use strict';

/**
 * Stage.Quote — centered pull quote with attribution line.
 *
 * Usage:
 *   Stage.register(Stage.Quote({
 *     section: 5,
 *     title: '05 · Voices',
 *     quote: 'The model is a junior teammate who never sleeps and never learns.',
 *     author: 'A senior engineer',
 *     role: 'platform team',     // optional
 *     source: 'internal Slack'   // optional
 *   }));
 *
 * Edit paths: quote / author / role / source
 */

(function (root) {
  const Stage = root.Stage = root.Stage || {};

  Stage.Quote = function (opts) {
    const quote = opts.quote || '';
    const author = opts.author || '';
    const role = opts.role || '';
    const source = opts.source || '';

    return {
      section: opts.section,
      title: opts.title,
      transition: opts.transition,
      render(el) {
        const meta = [
          author ? `<span class="q-author" data-stage-edit="author" data-stage-key="Quote/author">${escape(author)}</span>` : '',
          role   ? `<span class="q-role"   data-stage-edit="role"   data-stage-key="Quote/role">${escape(role)}</span>`     : '',
          source ? `<span class="q-source" data-stage-edit="source" data-stage-key="Quote/source">${escape(source)}</span>` : ''
        ].filter(Boolean).join('<span class="q-sep">·</span>');

        el.innerHTML = `
          <div class="quote" data-stage-key="Quote">
            <div class="q-mark q-mark--open" aria-hidden="true">&#10077;</div>
            <blockquote class="q-text" data-stage-edit="quote" data-stage-key="Quote/text">${escape(quote)}</blockquote>
            <div class="q-mark q-mark--close" aria-hidden="true">&#10078;</div>
            ${meta ? `<div class="q-meta" data-stage-key="Quote/meta">${meta}</div>` : ''}
          </div>
        `;
      },
      init(el) {
        const timers = [];
        const openMark = el.querySelector('.q-mark--open');
        const text = el.querySelector('.q-text');
        const closeMark = el.querySelector('.q-mark--close');
        const meta = el.querySelector('.q-meta');
        timers.push(setTimeout(() => openMark && openMark.classList.add('in'), 100));
        timers.push(setTimeout(() => text && text.classList.add('in'), 400));
        timers.push(setTimeout(() => closeMark && closeMark.classList.add('in'), 900));
        timers.push(setTimeout(() => meta && meta.classList.add('in'), 1200));
        return () => timers.forEach(clearTimeout);
      },
      replay(el) {
        el.querySelectorAll('.q-mark, .q-text, .q-meta').forEach(n => n.classList.remove('in'));
        return this.init(el);
      }
    };
  };

  function escape(s) {
    return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }
})(typeof window !== 'undefined' ? window : globalThis);
