'use strict';

/**
 * Stage.Bento — modular bento grid of cells.
 *
 * Usage:
 *   Stage.register(Stage.Bento({
 *     section: 7,
 *     title: '07 · The kit',
 *     cells: [
 *       { span: 2, heading: 'Agents', body: 'long-running, async, tool-using.', color: 'accent' },
 *       { heading: 'Reviews', body: 'human in the loop.' },
 *       { heading: 'Eval',    body: 'measure, then ship.', color: 'amber' },
 *       { heading: 'Specs',   image: { src: 'https://...' } },
 *       { heading: 'Notes',   body: 'cheap, persistent.', color: 'blue' }
 *     ]
 *   }));
 *
 * Layout: 4-column CSS grid. Cells default to 1 col, `span: 2` makes a cell wider.
 *
 * Edit paths:
 *   cells[i].heading / cells[i].body / cells[i].image.src
 */

(function (root) {
  const Stage = root.Stage = root.Stage || {};

  Stage.Bento = function (opts) {
    const cells = opts.cells || [];

    return {
      section: opts.section,
      title: opts.title,
      transition: opts.transition,
      render(el) {
        el.innerHTML = `
          <div class="bento" data-stage-key="Bento">
            ${cells.map((c, i) => {
              const colorClass = c.color ? `bento-cell--${c.color}` : '';
              const spanClass = c.span === 2 ? 'bento-cell--span-2' : '';
              const hasImage = c.image && c.image.src;
              const bg = hasImage
                ? `style="background-image: linear-gradient(180deg, rgba(10,10,10,0.45), rgba(10,10,10,0.85)), url('${escape(c.image.src)}')"`
                : '';
              return `
                <div class="bento-cell ${spanClass} ${colorClass} ${hasImage ? 'bento-cell--image' : ''}"
                     ${bg}
                     data-stage-key="Bento/cell[${i}]">
                  <div class="bento-cell-body">
                    <div class="bento-heading" data-stage-edit="cells[${i}].heading">${escape(c.heading || '')}</div>
                    ${c.body ? `<div class="bento-body" data-stage-edit="cells[${i}].body">${escape(c.body)}</div>` : ''}
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        `;
      },
      init(el) {
        const nodes = el.querySelectorAll('.bento-cell');
        return Stage.staggerIn(nodes, 120, 150);
      },
      replay(el) {
        el.querySelectorAll('.bento-cell').forEach(n => n.classList.remove('in'));
        return this.init(el);
      }
    };
  };

  function escape(s) {
    return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }
})(typeof window !== 'undefined' ? window : globalThis);
