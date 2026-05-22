'use strict';

/**
 * Stage.ShiftArrow — "from → to" mental-model shift pattern.
 *
 * Usage:
 *   Stage.register(Stage.ShiftArrow({
 *     section: 6,
 *     title: 'the shift',
 *     from: 'writing code',
 *     to: 'reviewing code'
 *   }));
 */

(function (root) {
  const Stage = root.Stage = root.Stage || {};

  Stage.ShiftArrow = function (opts) {
    return {
      section: opts.section,
      title: opts.title,
      transition: opts.transition,
      render(el) {
        el.innerHTML = `
          <div class="shift-line stagger" data-stage-key="ShiftArrow">
            <div class="shift-from" data-stage-edit="from" data-stage-key="ShiftArrow/from">${escape(opts.from || '')}</div>
            <div class="shift-arrow">→</div>
            <div class="shift-to" data-stage-edit="to" data-stage-key="ShiftArrow/to">${escape(opts.to || '')}</div>
          </div>
        `;
      },
      init(el) {
        return Stage.staggerIn(el.querySelectorAll('.shift-line > *'), 350, 200);
      }
    };
  };

  function escape(s) {
    return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }
})(typeof window !== 'undefined' ? window : globalThis);
