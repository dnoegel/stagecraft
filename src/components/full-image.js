'use strict';

/**
 * Stage.FullImage — full-bleed background image with optional text overlay.
 *
 * Usage:
 *   Stage.register(Stage.FullImage({
 *     section: 4,
 *     title: '04 · The terrain',
 *     image: { src: 'https://...', alt: 'A wide horizon' },
 *     overlay: {
 *       position: 'bottom-left',             // 'center' | 'bottom-left' | 'top' | 'bottom-right'
 *       headline: 'Most slides should be quiet.',
 *       body: 'Let the picture speak first.' // optional
 *     }
 *   }));
 *
 * If `overlay` is omitted, the image gets a subtle ken-burns drift on init.
 *
 * Edit paths:
 *   image.src / image.alt / overlay.headline / overlay.body
 */

(function (root) {
  const Stage = root.Stage = root.Stage || {};

  Stage.FullImage = function (opts) {
    const image = opts.image || {};
    const overlay = opts.overlay;
    const position = overlay && overlay.position ? overlay.position : 'center';

    return {
      section: opts.section,
      title: opts.title,
      transition: opts.transition,
      render(el) {
        el.classList.add('full-image-host');
        el.innerHTML = `
          <div class="full-image" data-stage-key="FullImage">
            <div class="fi-bg"
              style="background-image: url('${escape(image.src || '')}')"
              role="img"
              aria-label="${escape(image.alt || '')}"
              data-stage-edit="image.src"></div>
            ${overlay ? `
              <div class="fi-overlay fi-overlay--${position}" data-stage-key="FullImage/overlay">
                <div class="fi-scrim fi-scrim--${position}"></div>
                <div class="fi-overlay-inner">
                  <div class="fi-headline" data-stage-edit="overlay.headline" data-stage-key="FullImage/headline">${escape(overlay.headline || '')}</div>
                  ${overlay.body ? `<div class="fi-body" data-stage-edit="overlay.body" data-stage-key="FullImage/body">${escape(overlay.body)}</div>` : ''}
                </div>
              </div>
            ` : ''}
          </div>
        `;
      },
      init(el) {
        const bg = el.querySelector('.fi-bg');
        const headline = el.querySelector('.fi-headline');
        const body = el.querySelector('.fi-body');
        const timers = [];
        timers.push(setTimeout(() => bg && bg.classList.add('in'), 50));
        if (!overlay) {
          // ken-burns on the bg
          timers.push(setTimeout(() => bg && bg.classList.add('drift'), 400));
        }
        if (headline) timers.push(setTimeout(() => headline.classList.add('in'), 600));
        if (body)     timers.push(setTimeout(() => body.classList.add('in'), 900));
        return () => timers.forEach(clearTimeout);
      },
      replay(el) {
        el.querySelectorAll('.fi-bg, .fi-headline, .fi-body')
          .forEach(n => { n.classList.remove('in'); n.classList.remove('drift'); });
        return this.init(el);
      }
    };
  };

  function escape(s) {
    return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }
})(typeof window !== 'undefined' ? window : globalThis);
