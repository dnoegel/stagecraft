'use strict';

/**
 * Stage.Stats — grid of statistic mini-cards.
 *
 * Usage:
 *   Stage.register(Stage.Stats({
 *     section: 6,
 *     title: '06 · The numbers',
 *     blocks: [
 *       { number: 92, unit: '%', label: 'cost-per-token drop', color: 'accent' },
 *       { number: 7,  unit: 'x', label: 'context window growth', color: 'amber' },
 *       { number: 3,  unit: 'd', label: 'avg PR turnaround',     color: 'blue' }
 *     ],
 *     columns: 3                       // optional, defaults to blocks.length up to 4
 *   }));
 *
 * On init each number counts up from 0 → target, staggered by ~200ms.
 *
 * Edit paths: blocks[i].number / blocks[i].unit / blocks[i].label
 */

(function (root) {
  const Stage = root.Stage = root.Stage || {};

  Stage.Stats = function (opts) {
    const blocks = opts.blocks || [];
    const columns = Math.min(4, opts.columns || Math.min(4, blocks.length || 1));

    return {
      section: opts.section,
      title: opts.title,
      transition: opts.transition,
      render(el) {
        el.innerHTML = `
          <div class="stats stats--cols-${columns}" data-stage-key="Stats">
            ${blocks.map((b, i) => `
              <div class="stat ${b.color ? 'stat--' + b.color : ''}" data-stage-key="Stats/block[${i}]">
                <div class="stat-figure">
                  <span class="stat-num" data-stage-edit="blocks[${i}].number" data-target="${Number(b.number) || 0}">0</span>${b.unit ? `<span class="stat-unit" data-stage-edit="blocks[${i}].unit">${escape(b.unit)}</span>` : ''}
                </div>
                <div class="stat-label" data-stage-edit="blocks[${i}].label">${escape(b.label || '')}</div>
              </div>
            `).join('')}
          </div>
        `;
      },
      init(el) {
        const nums = el.querySelectorAll('.stat-num');
        const cards = el.querySelectorAll('.stat');
        const duration = 1200;
        const stagger = 200;
        const rafs = [];
        const timers = [];
        cards.forEach((card, i) => {
          timers.push(setTimeout(() => card.classList.add('in'), 100 + i * stagger));
        });
        nums.forEach((numEl, i) => {
          const target = Number(numEl.dataset.target) || 0;
          const isInt = Number.isInteger(target);
          const begin = performance.now() + 200 + i * stagger;
          let rafId;
          function tick(now) {
            if (now < begin) { rafId = requestAnimationFrame(tick); rafs.push(rafId); return; }
            const t = Math.min(1, (now - begin) / duration);
            const eased = 1 - Math.pow(1 - t, 3);
            const value = target * eased;
            numEl.textContent = isInt ? Math.floor(value).toLocaleString() : value.toFixed(1);
            if (t < 1) { rafId = requestAnimationFrame(tick); rafs.push(rafId); }
            else numEl.textContent = isInt ? target.toLocaleString() : String(target);
          }
          rafId = requestAnimationFrame(tick);
          rafs.push(rafId);
        });
        return () => {
          rafs.forEach(cancelAnimationFrame);
          timers.forEach(clearTimeout);
        };
      },
      replay(el) {
        el.querySelectorAll('.stat-num').forEach(n => n.textContent = '0');
        el.querySelectorAll('.stat').forEach(n => n.classList.remove('in'));
        return this.init(el);
      }
    };
  };

  function escape(s) {
    return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }
})(typeof window !== 'undefined' ? window : globalThis);
