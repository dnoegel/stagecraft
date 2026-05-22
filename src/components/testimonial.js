'use strict';

/**
 * Stage.Testimonial — single large quote with photo + attribution.
 *
 * Usage:
 *   Stage.register(Stage.Testimonial({
 *     section: 61,
 *     title: '61 · Testimonial',
 *     quote: 'It cut our review cycles in half.',
 *     author: {
 *       name: 'Avery Chen',
 *       role: 'Staff Engineer',
 *       company: 'Acme Co',
 *       photo: 'https://picsum.photos/seed/avery/400/400',
 *       logo: 'https://example.com/logo.svg'
 *     },
 *     reveal: 'staggered'   // 'instant' | 'staggered'
 *   }));
 *
 * Edit paths: quote / author.name / author.role / author.company
 */

(function (root) {
  const Stage = root.Stage = root.Stage || {};

  Stage.Testimonial = function (opts) {
    const author = opts.author || {};
    const reveal = opts.reveal || 'instant';

    const slide = {
      section: opts.section,
      title: opts.title,
      transition: opts.transition,
      render(el) {
        el.innerHTML = `
          <div class="testimonial" data-stage-key="Testimonial">
            ${author.photo ? `
              <div class="testimonial-photo-wrap" data-stage-key="Testimonial/photo">
                <img class="testimonial-photo" src="${escape(author.photo)}" alt="${escape(author.name || '')}">
              </div>
            ` : ''}
            <div class="testimonial-body">
              <div class="testimonial-mark material-symbols-outlined">format_quote</div>
              <blockquote class="testimonial-quote"
                          data-stage-edit="quote"
                          data-stage-key="Testimonial/quote">${escape(opts.quote || '')}</blockquote>
              <div class="testimonial-meta" data-stage-key="Testimonial/meta">
                <div class="testimonial-author" data-stage-edit="author.name">${escape(author.name || '')}</div>
                <div class="testimonial-affil">
                  ${author.role ? `<span data-stage-edit="author.role">${escape(author.role)}</span>` : ''}
                  ${author.role && author.company ? `<span class="testimonial-sep">·</span>` : ''}
                  ${author.company ? `<span class="testimonial-company" data-stage-edit="author.company">${escape(author.company)}</span>` : ''}
                </div>
                ${author.logo ? `
                  <img class="testimonial-logo" src="${escape(author.logo)}" alt="${escape(author.company || 'company')}">
                ` : ''}
              </div>
            </div>
          </div>
        `;
        if (reveal === 'instant') {
          el.querySelectorAll('[data-anim]').forEach(n => n.classList.add('in'));
          el.querySelector('.testimonial')?.classList.add('in');
        }
      }
    };

    if (reveal === 'staggered') {
      slide.init = function (el) {
        const t = el.querySelector('.testimonial');
        const nodes = [
          el.querySelector('.testimonial-photo-wrap'),
          el.querySelector('.testimonial-mark'),
          el.querySelector('.testimonial-quote'),
          el.querySelector('.testimonial-meta')
        ].filter(Boolean);
        const timers = [];
        timers.push(setTimeout(() => t?.classList.add('in'), 80));
        nodes.forEach((n, i) => {
          timers.push(setTimeout(() => n.classList.add('in'), 220 + i * 240));
        });
        return () => timers.forEach(clearTimeout);
      };
      slide.replay = function (el) {
        el.querySelector('.testimonial')?.classList.remove('in');
        el.querySelectorAll('.testimonial-photo-wrap, .testimonial-mark, .testimonial-quote, .testimonial-meta')
          .forEach(n => n.classList.remove('in'));
        return this.init(el);
      };
    }

    return slide;
  };

  function escape(s) {
    return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }
})(typeof window !== 'undefined' ? window : globalThis);
