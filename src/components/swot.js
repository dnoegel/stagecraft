'use strict';

/**
 * Stage.SWOT — 2x2 SWOT grid (Strengths / Weaknesses / Opportunities / Threats).
 *
 * Usage:
 *   Stage.register(Stage.SWOT({
 *     section: 5,
 *     title: '05 · SWOT',
 *     strengths:     ['fast iteration', 'strong brand', 'tier-1 talent'],
 *     weaknesses:    ['legacy code', 'fragmented data'],
 *     opportunities: ['agentic tooling', 'developer SaaS reset'],
 *     threats:       ['foundation model race', 'commoditisation'],
 *     reveal: 'staggered'   // 'instant' | 'staggered' | 'per-click'
 *   }));
 *
 * S = accent · W = amber · O = blue · T = red.
 *
 * Edit paths: strengths[i] / weaknesses[i] / opportunities[i] / threats[i]
 */

(function (root) {
  const Stage = root.Stage = root.Stage || {};

  Stage.SWOT = function (opts) {
    const strengths     = opts.strengths     || [];
    const weaknesses    = opts.weaknesses    || [];
    const opportunities = opts.opportunities || [];
    const threats       = opts.threats       || [];
    const reveal        = opts.reveal        || 'instant';

    const cells = [
      { key: 'strengths',     label: 'Strengths',     short: 'S', color: 'accent', items: strengths     },
      { key: 'weaknesses',    label: 'Weaknesses',    short: 'W', color: 'amber',  items: weaknesses    },
      { key: 'opportunities', label: 'Opportunities', short: 'O', color: 'blue',   items: opportunities },
      { key: 'threats',       label: 'Threats',       short: 'T', color: 'red',    items: threats       }
    ];

    const slide = {
      section: opts.section,
      title: opts.title,
      transition: opts.transition,
      render(el) {
        const cellHtml = cells.map((cell, idx) => {
          const items = cell.items.map((t, i) => `
            <li class="swot-item" data-stage-edit="${cell.key}[${i}]" data-stage-key="SWOT/${cell.key}/item[${i}]">${escape(t)}</li>
          `).join('');
          return `
            <div class="swot-cell swot-cell--${cell.color}"
                 data-quad-index="${idx}"
                 data-stage-key="SWOT/${cell.key}">
              <div class="swot-head">
                <span class="swot-letter">${cell.short}</span>
                <span class="swot-title">${escape(cell.label)}</span>
              </div>
              <ul class="swot-list">${items}</ul>
            </div>
          `;
        }).join('');

        el.innerHTML = `
          <div class="swot" data-stage-key="SWOT">
            ${cellHtml}
          </div>
        `;

        if (reveal === 'instant') {
          el.querySelectorAll('.swot-cell, .swot-item').forEach(n => n.classList.add('in'));
        }
      }
    };

    if (reveal === 'staggered') {
      slide.init = function (el) {
        const cellNodes = Array.from(el.querySelectorAll('.swot-cell'));
        const timers = [];
        cellNodes.forEach((cell, i) => {
          timers.push(setTimeout(() => {
            cell.classList.add('in');
            const items = cell.querySelectorAll('.swot-item');
            items.forEach((it, j) => {
              timers.push(setTimeout(() => it.classList.add('in'), 200 + j * 120));
            });
          }, 200 + i * 350));
        });
        return () => timers.forEach(clearTimeout);
      };
      slide.replay = function (el) {
        el.querySelectorAll('.swot-cell, .swot-item').forEach(n => n.classList.remove('in'));
        return this.init(el);
      };
    } else if (reveal === 'per-click') {
      slide.steps = cells.length;
      slide.onStep = function (el, step) {
        el.querySelectorAll('.swot-cell').forEach(n => {
          const idx = Number(n.dataset.quadIndex);
          const on = idx < step;
          n.classList.toggle('in', on);
          n.querySelectorAll('.swot-item').forEach(it => it.classList.toggle('in', on));
        });
      };
    }

    return slide;
  };

  function escape(s) {
    return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }
})(typeof window !== 'undefined' ? window : globalThis);
