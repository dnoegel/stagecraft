'use strict';

/**
 * Stage.Cycle — items arranged on a circle with curved arrows between them.
 *
 * Usage:
 *   Stage.register(Stage.Cycle({
 *     section: 7,
 *     title: '07 · The loop',
 *     items: [
 *       { label: 'Plan',    icon: 'edit_note',     color: 'accent' },
 *       { label: 'Build',   icon: 'construction'                   },
 *       { label: 'Verify',  icon: 'fact_check'                     },
 *       { label: 'Reflect', icon: 'psychology'                     }
 *     ],
 *     reveal: 'instant'    // 'instant' | 'rotate' | 'per-click'
 *   }));
 *
 * SVG provides the circle + arcs; HTML cards float on top at polar positions.
 */

(function (root) {
  const Stage = root.Stage = root.Stage || {};

  Stage.Cycle = function (opts) {
    const items = opts.items || [];
    const reveal = opts.reveal || 'instant';
    const n = items.length;
    const VB = 1000;
    const CX = VB / 2;
    const CY = VB / 2;
    const R = VB * 0.36;
    const ITEM_R = VB * 0.11; // ring offset for label cards

    // Start at top (-PI/2) and go clockwise.
    function angle(i) { return -Math.PI / 2 + (i / Math.max(1, n)) * Math.PI * 2; }
    function pt(a, r) { return { x: CX + Math.cos(a) * r, y: CY + Math.sin(a) * r }; }

    // Build an arc from item i -> i+1 that sits *outside* the inner clear area,
    // so it visually connects the two cards.
    function arcPath(i) {
      const a1 = angle(i);
      const a2 = angle((i + 1) % n);
      const p1 = pt(a1, R);
      const p2 = pt(a2, R);
      // Use the circle radius itself for the SVG arc command; large-arc=0, sweep=1 (clockwise).
      return `M ${p1.x.toFixed(1)} ${p1.y.toFixed(1)} A ${R} ${R} 0 0 1 ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
    }

    // Arrow tip near each next item.
    function arrowAt(i) {
      const a = angle((i + 1) % n);
      // Pull tip slightly back along the tangent so it lands cleanly.
      const tipA = a - 0.18;
      const tip = pt(tipA, R);
      // Tangent direction (perpendicular to radius, clockwise).
      const tx = -Math.sin(tipA);
      const ty = Math.cos(tipA);
      const size = VB * 0.018;
      // Two wings off the tangent.
      const ax = tip.x - tx * size + ty * size * 0.6;
      const ay = tip.y - ty * size - tx * size * 0.6;
      const bx = tip.x - tx * size - ty * size * 0.6;
      const by = tip.y - ty * size + tx * size * 0.6;
      return `M ${tip.x.toFixed(1)} ${tip.y.toFixed(1)} L ${ax.toFixed(1)} ${ay.toFixed(1)} M ${tip.x.toFixed(1)} ${tip.y.toFixed(1)} L ${bx.toFixed(1)} ${by.toFixed(1)}`;
    }

    const slide = {
      section: opts.section,
      title: opts.title,
      transition: opts.transition,
      render(el) {
        const cardsHtml = items.map((it, i) => {
          const p = pt(angle(i), R);
          const xPct = (p.x / VB) * 100;
          const yPct = (p.y / VB) * 100;
          return `
            <div class="cyc-item ${it.color ? 'cyc-' + escape(it.color) : ''}"
                 data-step="${i + 1}"
                 style="left: ${xPct.toFixed(2)}%; top: ${yPct.toFixed(2)}%;"
                 data-stage-key="Cycle/item[${i}]">
              ${it.icon ? `<span class="cyc-icon material-symbols-outlined" data-stage-edit="items[${i}].icon">${escape(it.icon)}</span>` : ''}
              <div class="cyc-label" data-stage-edit="items[${i}].label" data-stage-key="Cycle/item[${i}]/label">${escape(it.label || '')}</div>
            </div>
          `;
        }).join('');

        const arcs = [];
        for (let i = 0; i < n; i++) {
          arcs.push(`<path class="cyc-arc" d="${arcPath(i)}" data-step="${i + 1}"/>`);
          arcs.push(`<path class="cyc-arrow" d="${arrowAt(i)}" data-step="${i + 1}"/>`);
        }

        el.innerHTML = `
          <div class="cycle" data-stage-key="Cycle">
            <div class="cyc-frame">
              <svg class="cyc-svg" viewBox="0 0 ${VB} ${VB}" preserveAspectRatio="xMidYMid meet">
                <circle class="cyc-ring" cx="${CX}" cy="${CY}" r="${R}"/>
                ${arcs.join('')}
              </svg>
              <div class="cyc-items">
                ${cardsHtml}
              </div>
            </div>
          </div>
        `;
        if (reveal === 'instant' || reveal === 'rotate') {
          el.querySelectorAll('.cyc-item, .cyc-arc, .cyc-arrow').forEach(n => n.classList.add('in'));
        }
      }
    };

    if (reveal === 'rotate') {
      slide.init = function (el) {
        const frame = el.querySelector('.cyc-frame');
        if (frame) {
          frame.classList.add('rotating');
          const id = setTimeout(() => frame.classList.remove('rotating'), 1700);
          return () => clearTimeout(id);
        }
      };
      slide.replay = function (el) {
        const frame = el.querySelector('.cyc-frame');
        if (frame) { frame.classList.remove('rotating'); void frame.offsetWidth; }
        return this.init(el);
      };
    } else if (reveal === 'per-click') {
      slide.steps = items.length;
      slide.onStep = function (el, step) {
        el.querySelectorAll('.cyc-item').forEach(node => {
          node.classList.toggle('in', Number(node.dataset.step) <= step);
        });
        el.querySelectorAll('.cyc-arc, .cyc-arrow').forEach(node => {
          // Arc i connects item i -> i+1; show when both endpoints are in.
          node.classList.toggle('in', Number(node.dataset.step) < step || (Number(node.dataset.step) === step && step === n));
        });
      };
    }

    return slide;
  };

  function escape(s) {
    return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }
})(typeof window !== 'undefined' ? window : globalThis);
