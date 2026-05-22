'use strict';

/**
 * Stage.SectionCard — section divider with number + title + tag.
 *
 * Usage:
 *   Stage.register(Stage.SectionCard({
 *     section: 2,
 *     number: '02',
 *     title: 'What changed',
 *     tag: 'the shift in cost'
 *   }));
 */

(function (root) {
  const Stage = root.Stage = root.Stage || {};

  Stage.SectionCard = function (opts) {
    return {
      section: opts.section,
      title: opts.title || `${opts.number} · ${opts.titleText || ''}`.trim(),
      transition: opts.transition,
      render(el) {
        el.innerHTML = `
          <div class="section-card stagger" data-stage-key="SectionCard">
            <div class="sec-rule">
              <div class="sec-line"></div>
              <div class="sec-num" data-stage-edit="number" data-stage-key="SectionCard/number">${escape(opts.number || '')}</div>
              <div class="sec-line"></div>
            </div>
            <div class="sec-title" data-stage-edit="title" data-stage-key="SectionCard/title">${escape(opts.title || '')}</div>
            ${opts.tag ? `<div class="sec-tag" data-stage-edit="tag" data-stage-key="SectionCard/tag">${escape(opts.tag)}</div>` : ''}
          </div>
        `;
      },
      init(el) {
        return Stage.staggerIn(el.querySelectorAll('.section-card > *'), 200, 100);
      }
    };
  };

  function escape(s) {
    return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }
})(typeof window !== 'undefined' ? window : globalThis);
