'use strict';

/**
 * Stage.ImageGrid — gallery of images in a grid, with optional captions.
 *
 * Usage:
 *   Stage.register(Stage.ImageGrid({
 *     section: 6,
 *     title: '06 · Field notes',
 *     columns: 3,
 *     images: [
 *       { src: 'https://picsum.photos/seed/a/600/400', alt: 'team',    caption: 'team offsite' },
 *       { src: 'https://picsum.photos/seed/b/600/400', alt: 'console', caption: 'staging burn' },
 *       { src: 'https://picsum.photos/seed/c/600/400',                 caption: '4 a.m. ship' }
 *     ],
 *     reveal: 'cascade'   // 'cascade' (fall-in w/ rotation) | 'staggered' | 'instant'
 *   }));
 *
 * Edit paths:
 *   images[i].src / images[i].alt / images[i].caption
 */

(function (root) {
  const Stage = root.Stage = root.Stage || {};

  Stage.ImageGrid = function (opts) {
    const images = Array.isArray(opts.images) ? opts.images : [];
    const columns = [2, 3, 4].includes(opts.columns) ? opts.columns : 3;
    const reveal = opts.reveal || 'instant';

    const slide = {
      section: opts.section,
      title: opts.title,
      transition: opts.transition,
      render(el) {
        el.innerHTML = `
          <div class="image-grid ig-cols-${columns} ig--${escape(reveal)}" data-stage-key="ImageGrid">
            ${images.map((img, i) => `
              <figure class="ig-cell" data-step="${i + 1}" data-stage-key="ImageGrid/cell[${i}]">
                <div class="ig-frame">
                  <img class="ig-img"
                    src="${escape(img.src || '')}"
                    alt="${escape(img.alt || '')}"
                    loading="lazy"
                    data-stage-edit="images[${i}].src">
                </div>
                ${img.caption ? `<figcaption class="ig-cap" data-stage-edit="images[${i}].caption" data-stage-key="ImageGrid/cell[${i}]/caption">${escape(img.caption)}</figcaption>` : ''}
              </figure>
            `).join('')}
          </div>
        `;
        if (reveal === 'instant') {
          el.querySelectorAll('.ig-cell').forEach(n => n.classList.add('in'));
        }
      }
    };

    if (reveal === 'staggered' || reveal === 'cascade') {
      slide.init = function (el) {
        const cells = el.querySelectorAll('.ig-cell');
        const timers = [];
        const step = reveal === 'cascade' ? 220 : 150;
        cells.forEach((n, i) => {
          timers.push(setTimeout(() => n.classList.add('in'), 150 + i * step));
        });
        return () => timers.forEach(clearTimeout);
      };
      slide.replay = function (el) {
        el.querySelectorAll('.ig-cell').forEach(n => n.classList.remove('in'));
        return this.init(el);
      };
    }

    return slide;
  };

  function escape(s) {
    return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }
})(typeof window !== 'undefined' ? window : globalThis);
