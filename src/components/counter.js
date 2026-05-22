'use strict';

/**
 * Stage.Counter — large numeric counters with optional live tick.
 *
 * Usage:
 *   Stage.register(Stage.Counter({
 *     section: 4,
 *     title: 'live stats',
 *     blocks: [
 *       { label: 'Lines written',  start: 0, perSecond: 47, color: 'accent' },
 *       { label: 'Bugs introduced', start: 0, perSecond: 3,  color: 'amber' }
 *     ],
 *     footer: 'Both numbers are wrong.'
 *   }));
 */

(function (root) {
  const Stage = root.Stage = root.Stage || {};

  Stage.Counter = function (opts) {
    const blocks = opts.blocks || [];
    const footer = opts.footer || '';

    return {
      section: opts.section,
      title: opts.title,
      transition: opts.transition,
      render(el) {
        el.innerHTML = `
          <div class="counter-wrap" data-stage-key="Counter">
            ${blocks.map((b, i) => `
              <div class="counter-block" data-stage-key="Counter/block[${i}]">
                <div class="counter-label ${b.color || ''}">
                  <span class="dot"></span><span data-stage-edit="blocks[${i}].label">${escape(b.label)}</span>
                </div>
                <div class="counter-num ${b.color || ''}" data-i="${i}">${b.start ?? 0}</div>
              </div>
            `).join('')}
          </div>
          ${footer ? `<div class="counter-foot" data-stage-edit="footer">${footer}</div>` : ''}
        `;
      },
      init(el) {
        const timers = [];
        const nums = el.querySelectorAll('.counter-num');
        blocks.forEach((b, i) => {
          if (!b.perSecond) return;
          let value = Number(b.start || 0);
          const target = nums[i];
          if (!target) return;
          const tickMs = Math.max(20, Math.floor(1000 / Math.max(1, b.perSecond)));
          const inc = b.perSecond * tickMs / 1000;
          const id = setInterval(() => {
            value += inc;
            target.textContent = Math.floor(value).toLocaleString();
          }, tickMs);
          timers.push(() => clearInterval(id));
        });
        if (footer) {
          const f = el.querySelector('.counter-foot');
          const t = setTimeout(() => f && f.classList.add('visible'), 3000);
          timers.push(() => clearTimeout(t));
        }
        return () => timers.forEach(fn => fn());
      },
      replay(el) {
        const nums = el.querySelectorAll('.counter-num');
        blocks.forEach((b, i) => { if (nums[i]) nums[i].textContent = b.start ?? 0; });
        const f = el.querySelector('.counter-foot');
        if (f) f.classList.remove('visible');
        return this.init(el);
      }
    };
  };

  function escape(s) {
    return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }
})(typeof window !== 'undefined' ? window : globalThis);
