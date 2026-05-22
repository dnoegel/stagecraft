'use strict';

/**
 * Stage.Manifesto — numbered list of "We believe..." declarations.
 *
 * Usage:
 *   Stage.register(Stage.Manifesto({
 *     section: 3,
 *     title: '03 · What we believe',
 *     intro: 'A working manifesto, revised quarterly.',
 *     declarations: [
 *       { text: 'Taste is the scarce part.',     emphasis: ['scarce'] },
 *       { text: 'Speed without review is debt.', emphasis: ['debt'] },
 *       { text: 'The model is a colleague, not an oracle.', emphasis: ['colleague','oracle'] }
 *     ],
 *     reveal: 'staggered'   // 'staggered' | 'per-click' | 'instant'
 *   }));
 *
 * Edit paths:
 *   intro / declarations[i].text
 */

(function (root) {
  const Stage = root.Stage = root.Stage || {};

  Stage.Manifesto = function (opts) {
    const declarations = opts.declarations || [];
    const intro = opts.intro || '';
    const reveal = opts.reveal || 'staggered';

    const slide = {
      section: opts.section,
      title: opts.title,
      transition: opts.transition,
      render(el) {
        el.innerHTML = `
          <div class="manifesto" data-stage-key="Manifesto">
            ${intro ? `<div class="mf-intro" data-stage-edit="intro" data-stage-key="Manifesto/intro">${escape(intro)}</div>` : ''}
            <ol class="mf-list">
              ${declarations.map((d, i) => `
                <li class="mf-item" data-step="${i + 1}" data-stage-key="Manifesto/decl[${i}]">
                  <span class="mf-num" aria-hidden="true">${String(i + 1).padStart(2, '0')}</span>
                  <span class="mf-text" data-stage-edit="declarations[${i}].text" data-stage-key="Manifesto/decl[${i}]/text">${emphasizeHTML(d.text || '', d.emphasis || [])}</span>
                </li>
              `).join('')}
            </ol>
          </div>
        `;
        if (reveal === 'instant') {
          el.querySelectorAll('.mf-item, .mf-intro').forEach(n => n.classList.add('in'));
        }
      }
    };

    if (reveal === 'staggered') {
      slide.init = function (el) {
        const intro = el.querySelector('.mf-intro');
        const timers = [];
        if (intro) timers.push(setTimeout(() => intro.classList.add('in'), 100));
        const items = el.querySelectorAll('.mf-item');
        items.forEach((n, i) => {
          timers.push(setTimeout(() => n.classList.add('in'), 400 + i * 220));
        });
        return () => timers.forEach(clearTimeout);
      };
      slide.replay = function (el) {
        el.querySelectorAll('.mf-item, .mf-intro').forEach(n => n.classList.remove('in'));
        return this.init(el);
      };
    } else if (reveal === 'per-click') {
      slide.steps = declarations.length;
      slide.init = function (el) {
        const intro = el.querySelector('.mf-intro');
        if (intro) setTimeout(() => intro.classList.add('in'), 100);
      };
      slide.onStep = function (el, step) {
        el.querySelectorAll('.mf-item').forEach(n => {
          n.classList.toggle('in', Number(n.dataset.step) <= step);
        });
      };
    }

    return slide;
  };

  function emphasizeHTML(raw, emphasis) {
    let html = escape(raw);
    const sorted = [...emphasis].filter(Boolean).sort((a, b) => b.length - a.length);
    for (const phrase of sorted) {
      const esc = escape(phrase);
      const re = new RegExp(escapeRegex(esc), 'g');
      html = html.replace(re, `<span class="mf-em">${esc}</span>`);
    }
    return html;
  }

  function escapeRegex(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function escape(s) {
    return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }
})(typeof window !== 'undefined' ? window : globalThis);
