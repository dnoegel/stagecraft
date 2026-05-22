'use strict';

/**
 * Stage.Marquee — horizontal scrolling text strip (stock-ticker style).
 *
 * Usage:
 *   Stage.register(Stage.Marquee({
 *     section: 8,
 *     title: '08 · Headlines',
 *     items: ['ship faster', 'review harder', 'measure everything', 'sleep sometimes'],
 *     direction: 'left',   // 'left' | 'right'
 *     speed: 'medium',     // 'slow' | 'medium' | 'fast'
 *     double: true         // optional second track in opposite direction
 *   }));
 *
 * Pauses on hover. Pure CSS animation.
 *
 * Edit paths:
 *   items[i]
 */

(function (root) {
  const Stage = root.Stage = root.Stage || {};

  Stage.Marquee = function (opts) {
    const items = Array.isArray(opts.items) ? opts.items : [];
    const direction = opts.direction === 'right' ? 'right' : 'left';
    const speed = ['slow', 'medium', 'fast'].includes(opts.speed) ? opts.speed : 'medium';
    const double = !!opts.double;

    return {
      section: opts.section,
      title: opts.title,
      transition: opts.transition,
      render(el) {
        el.classList.add('marquee-host');
        el.innerHTML = `
          <div class="marquee mq--${escape(speed)} mq--${escape(direction)}" data-stage-key="Marquee">
            ${renderTrack(items, 'a')}
            ${double ? renderTrack(items, 'b', true) : ''}
          </div>
        `;
      }
    };
  };

  function renderTrack(items, key, reverse) {
    // Duplicate items so we can loop translateX 0 → -50% seamlessly.
    const track = items.map((it, i) => `
      <span class="mq-item" data-stage-edit="items[${i}]" data-stage-key="Marquee/item[${i}]">${escape(it)}</span>
      <span class="mq-sep" aria-hidden="true">·</span>
    `).join('');
    return `
      <div class="mq-track mq-track--${key} ${reverse ? 'mq-track--rev' : ''}" aria-hidden="${key === 'b' ? 'true' : 'false'}">
        <div class="mq-row">${track}${track}</div>
      </div>
    `;
  }

  function escape(s) {
    return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }
})(typeof window !== 'undefined' ? window : globalThis);
