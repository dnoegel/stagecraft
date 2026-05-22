'use strict';

/**
 * Stage.BeforeAfter — split comparison: image-vs-image or text-vs-text.
 *
 * Usage (text vs text):
 *   Stage.register(Stage.BeforeAfter({
 *     section: 69,
 *     title: '69 · Before / After',
 *     before: { label: 'Before', text: 'Manual reviews. 3-day cycles.' },
 *     after:  { label: 'After',  text: 'AI-drafted reviews. 30-minute cycles.' },
 *     reveal: 'staggered'  // 'instant' | 'staggered' | 'slider'
 *   }));
 *
 * Usage (image vs image with slider):
 *   Stage.register(Stage.BeforeAfter({
 *     section: 69,
 *     before: { label: 'Before', image: 'https://picsum.photos/seed/before/1200/800' },
 *     after:  { label: 'After',  image: 'https://picsum.photos/seed/after/1200/800' },
 *     reveal: 'slider'
 *   }));
 *
 * `reveal: 'slider'` animates a diagonal divider from 0 to 50% on init (image mode).
 *
 * Edit paths: before.label / before.text / after.label / after.text
 */

(function (root) {
  const Stage = root.Stage = root.Stage || {};

  Stage.BeforeAfter = function (opts) {
    const before = opts.before || {};
    const after = opts.after || {};
    const reveal = opts.reveal || 'instant';
    const isImage = !!(before.image || after.image);
    const mode = isImage ? 'image' : 'text';

    const slide = {
      section: opts.section,
      title: opts.title,
      transition: opts.transition,
      render(el) {
        if (mode === 'image') {
          el.innerHTML = `
            <div class="before-after before-after--image" data-stage-key="BeforeAfter" style="--ba-clip: 0%;">
              <div class="ba-pane ba-before" data-stage-key="BeforeAfter/before">
                ${before.image ? `<img class="ba-img" src="${escape(before.image)}" alt="${escape(before.label || 'before')}">` : ''}
                <div class="ba-label ba-label--left">
                  <span class="ba-tag">${escape(before.label || 'Before')}</span>
                </div>
              </div>
              <div class="ba-pane ba-after" data-stage-key="BeforeAfter/after">
                ${after.image ? `<img class="ba-img" src="${escape(after.image)}" alt="${escape(after.label || 'after')}">` : ''}
                <div class="ba-label ba-label--right">
                  <span class="ba-tag ba-tag--accent">${escape(after.label || 'After')}</span>
                </div>
              </div>
              <div class="ba-divider"></div>
            </div>
          `;
        } else {
          el.innerHTML = `
            <div class="before-after before-after--text" data-stage-key="BeforeAfter">
              <div class="ba-col ba-before" data-stage-key="BeforeAfter/before">
                <div class="ba-col-tag">${escape(before.label || 'Before')}</div>
                <div class="ba-col-text" data-stage-edit="before.text">${escape(before.text || '')}</div>
              </div>
              <div class="ba-arrow material-symbols-outlined">arrow_forward</div>
              <div class="ba-col ba-after" data-stage-key="BeforeAfter/after">
                <div class="ba-col-tag ba-col-tag--accent">${escape(after.label || 'After')}</div>
                <div class="ba-col-text" data-stage-edit="after.text">${escape(after.text || '')}</div>
              </div>
            </div>
          `;
        }

        if (reveal === 'instant') {
          el.querySelectorAll('.ba-pane, .ba-col, .ba-arrow').forEach(n => n.classList.add('in'));
          if (mode === 'image') {
            const root = el.querySelector('.before-after--image');
            if (root) root.style.setProperty('--ba-clip', '50%');
          }
        }
      }
    };

    if (reveal === 'staggered') {
      slide.init = function (el) {
        const nodes = mode === 'image'
          ? el.querySelectorAll('.ba-pane')
          : el.querySelectorAll('.ba-col, .ba-arrow');
        const cleanup = Stage.staggerIn(nodes, 220, 200);
        let extra;
        if (mode === 'image') {
          extra = setTimeout(() => {
            const root = el.querySelector('.before-after--image');
            if (root) root.style.setProperty('--ba-clip', '50%');
          }, 600);
        }
        return () => { cleanup(); if (extra) clearTimeout(extra); };
      };
      slide.replay = function (el) {
        el.querySelectorAll('.ba-pane, .ba-col, .ba-arrow').forEach(n => n.classList.remove('in'));
        if (mode === 'image') {
          const root = el.querySelector('.before-after--image');
          if (root) root.style.setProperty('--ba-clip', '0%');
        }
        return this.init(el);
      };
    } else if (reveal === 'slider') {
      slide.init = function (el) {
        el.querySelectorAll('.ba-pane, .ba-col, .ba-arrow').forEach(n => n.classList.add('in'));
        const root = el.querySelector('.before-after--image');
        if (!root) return;
        root.style.setProperty('--ba-clip', '0%');
        // Force reflow then animate.
        // eslint-disable-next-line no-unused-expressions
        root.offsetWidth;
        const t = setTimeout(() => root.style.setProperty('--ba-clip', '50%'), 200);
        return () => clearTimeout(t);
      };
      slide.replay = function (el) {
        const root = el.querySelector('.before-after--image');
        if (root) root.style.setProperty('--ba-clip', '0%');
        return this.init(el);
      };
    }

    return slide;
  };

  function escape(s) {
    return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }
})(typeof window !== 'undefined' ? window : globalThis);
