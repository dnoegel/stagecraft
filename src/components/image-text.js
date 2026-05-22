'use strict';

/**
 * Stage.ImageText — two-column image + text.
 *
 * Usage:
 *   Stage.register(Stage.ImageText({
 *     section: 2,
 *     title: '02 · The view',
 *     image: { src: 'https://...', alt: 'Field of antennas' },
 *     side: 'left',                          // 'left' | 'right'
 *     heading: 'A new shape of work',
 *     body: 'You stop typing characters and start describing intent.',
 *     caption: 'Field notes, week 14',       // optional
 *     reveal: 'staggered'                    // 'staggered' | 'instant'
 *   }));
 *
 * The body string is split on \n into lines for the staggered reveal.
 *
 * Edit paths:
 *   image.src / image.alt / heading / body / caption
 */

(function (root) {
  const Stage = root.Stage = root.Stage || {};

  Stage.ImageText = function (opts) {
    const image = opts.image || {};
    const side = opts.side === 'right' ? 'right' : 'left';
    const reveal = opts.reveal || 'instant';
    const heading = opts.heading || '';
    const body = opts.body || '';
    const caption = opts.caption || '';
    const bodyLines = String(body).split('\n').filter(Boolean);

    return {
      section: opts.section,
      title: opts.title,
      transition: opts.transition,
      render(el) {
        el.innerHTML = `
          <div class="image-text image-text--${side}" data-stage-key="ImageText">
            <figure class="it-figure" data-stage-key="ImageText/figure">
              <img class="it-img"
                src="${escape(image.src || '')}"
                alt="${escape(image.alt || '')}"
                data-stage-edit="image.src" />
              <div class="it-img-frame"></div>
            </figure>
            <div class="it-text" data-stage-key="ImageText/text">
              <h2 class="it-heading" data-stage-edit="heading" data-stage-key="ImageText/heading">${escape(heading)}</h2>
              <div class="it-body" data-stage-key="ImageText/body">
                ${bodyLines.map((line, i) => `
                  <div class="it-line" data-stage-edit="body" data-line-index="${i}">${escape(line)}</div>
                `).join('')}
              </div>
              ${caption ? `<div class="it-caption" data-stage-edit="caption" data-stage-key="ImageText/caption">${escape(caption)}</div>` : ''}
            </div>
          </div>
        `;
        if (reveal === 'instant') {
          el.querySelectorAll('.it-figure, .it-heading, .it-line, .it-caption')
            .forEach(n => n.classList.add('in'));
        }
      },
      init(el) {
        if (reveal === 'instant') return () => {};
        const timers = [];
        const figure = el.querySelector('.it-figure');
        const heading = el.querySelector('.it-heading');
        const lines = el.querySelectorAll('.it-line');
        const caption = el.querySelector('.it-caption');

        timers.push(setTimeout(() => figure && figure.classList.add('in'), 100));
        timers.push(setTimeout(() => heading && heading.classList.add('in'), 500));
        lines.forEach((line, i) => {
          timers.push(setTimeout(() => line.classList.add('in'), 800 + i * 220));
        });
        const captionDelay = 800 + lines.length * 220 + 200;
        if (caption) {
          timers.push(setTimeout(() => caption.classList.add('in'), captionDelay));
        }
        return () => timers.forEach(clearTimeout);
      },
      replay(el) {
        el.querySelectorAll('.it-figure, .it-heading, .it-line, .it-caption')
          .forEach(n => n.classList.remove('in'));
        return this.init(el);
      }
    };
  };

  function escape(s) {
    return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }
})(typeof window !== 'undefined' ? window : globalThis);
