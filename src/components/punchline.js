'use strict';

/**
 * Stage.Punchline — small buildup lines fade in, then a massive payoff lands.
 *
 * Usage:
 *   Stage.register(Stage.Punchline({
 *     section: 4,
 *     title: '04 · The setup',
 *     buildup: [
 *       'We hired the best engineers.',
 *       'We bought the best tools.',
 *       'We followed the best practices.'
 *     ],
 *     payoff: 'And we still shipped the bug.',
 *     reveal: 'auto'   // 'auto' (1.2s pacing) | 'manual' (per-click)
 *   }));
 *
 * Edit paths:
 *   buildup[i] / payoff
 */

(function (root) {
  const Stage = root.Stage = root.Stage || {};

  Stage.Punchline = function (opts) {
    const buildup = Array.isArray(opts.buildup) ? opts.buildup : [];
    const payoff = opts.payoff || '';
    const reveal = opts.reveal || 'auto';

    const slide = {
      section: opts.section,
      title: opts.title,
      transition: opts.transition,
      render(el) {
        el.innerHTML = `
          <div class="punchline" data-stage-key="Punchline">
            <div class="pl-buildup">
              ${buildup.map((b, i) => `
                <div class="pl-line" data-step="${i + 1}" data-stage-edit="buildup[${i}]" data-stage-key="Punchline/build[${i}]">${escape(b)}</div>
              `).join('')}
            </div>
            <div class="pl-payoff" data-step="${buildup.length + 1}" data-stage-edit="payoff" data-stage-key="Punchline/payoff">${escape(payoff)}</div>
          </div>
        `;
      }
    };

    if (reveal === 'auto') {
      slide.init = function (el) {
        const lines = el.querySelectorAll('.pl-line');
        const pay = el.querySelector('.pl-payoff');
        const timers = [];
        lines.forEach((n, i) => {
          timers.push(setTimeout(() => n.classList.add('in'), 200 + i * 1200));
        });
        timers.push(setTimeout(() => pay && pay.classList.add('in'), 200 + lines.length * 1200 + 400));
        return () => timers.forEach(clearTimeout);
      };
      slide.replay = function (el) {
        el.querySelectorAll('.pl-line, .pl-payoff').forEach(n => n.classList.remove('in'));
        return this.init(el);
      };
    } else {
      // 'manual' — per-click, one buildup line per step, payoff last
      slide.steps = buildup.length + 1;
      slide.onStep = function (el, step) {
        el.querySelectorAll('.pl-line').forEach(n => {
          n.classList.toggle('in', Number(n.dataset.step) <= step);
        });
        const pay = el.querySelector('.pl-payoff');
        if (pay) pay.classList.toggle('in', step >= (buildup.length + 1));
      };
    }

    return slide;
  };

  function escape(s) {
    return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }
})(typeof window !== 'undefined' ? window : globalThis);
