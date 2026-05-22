'use strict';

/**
 * Stage.Roadmap — horizontal timeline with swimlanes.
 *
 * Usage:
 *   Stage.register(Stage.Roadmap({
 *     section: 5,
 *     title: '05 · 2026 roadmap',
 *     months: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
 *     lanes: [
 *       { label: 'Platform', color: 'accent', bars: [
 *           { start: 0, end: 3, label: 'rewrite core' },
 *           { start: 4, end: 7, label: 'observability' }
 *       ]},
 *       { label: 'Product',  color: 'blue', bars: [
 *           { start: 2, end: 6, label: 'collab editor' }
 *       ]}
 *     ],
 *     reveal: 'staggered'                   // 'instant' | 'staggered'
 *   }));
 *
 * `start` and `end` are indices into `months` (or arbitrary numbers if no months).
 *
 * Edit paths: lanes[i].label, lanes[i].bars[j].label, months[k]
 */

(function (root) {
  const Stage = root.Stage = root.Stage || {};

  Stage.Roadmap = function (opts) {
    const lanes = opts.lanes || [];
    const months = opts.months || [];
    const reveal = opts.reveal || 'staggered';

    // Determine min/max for normalisation
    let lo = months.length ? 0 : Infinity;
    let hi = months.length ? months.length : -Infinity;
    if (!months.length) {
      lanes.forEach(lane => (lane.bars || []).forEach(b => {
        const s = Number(b.start);
        const e = Number(b.end);
        if (Number.isFinite(s) && s < lo) lo = s;
        if (Number.isFinite(e) && e > hi) hi = e;
      }));
    }
    if (!Number.isFinite(lo)) lo = 0;
    if (!Number.isFinite(hi)) hi = 1;
    const span = (hi - lo) || 1;

    function pct(v) {
      return ((Number(v) - lo) / span) * 100;
    }

    const slide = {
      section: opts.section,
      title: opts.title,
      transition: opts.transition,
      render(el) {
        // Month headers
        const monthCells = months.length
          ? months.map((m, i) => `<div class="rm-month" data-stage-edit="months[${i}]">${escape(m)}</div>`).join('')
          : '';

        const laneRows = lanes.map((lane, i) => {
          const colorClass = lane.color ? `rm-${escape(lane.color)}` : '';
          const bars = (lane.bars || []).map((b, j) => {
            const left = pct(b.start);
            const right = pct(b.end);
            const w = Math.max(0, right - left);
            return `<div class="rm-bar ${colorClass}"
                         data-i="${i}" data-j="${j}"
                         data-stage-key="Roadmap/lane[${i}]/bar[${j}]"
                         style="--rm-left: ${left.toFixed(2)}%; --rm-width: ${w.toFixed(2)}%;">
                      <span class="rm-bar-label" data-stage-edit="lanes[${i}].bars[${j}].label">${escape(b.label || '')}</span>
                    </div>`;
          }).join('');
          return `<div class="rm-lane" data-stage-key="Roadmap/lane[${i}]">
                    <div class="rm-lane-label ${colorClass}" data-stage-edit="lanes[${i}].label">${escape(lane.label || '')}</div>
                    <div class="rm-lane-track">${bars}</div>
                  </div>`;
        }).join('');

        el.innerHTML = `
          <div class="roadmap" data-stage-key="Roadmap">
            ${months.length ? `
              <div class="rm-header">
                <div class="rm-lane-label-spacer"></div>
                <div class="rm-months" style="--rm-cols: ${months.length};">${monthCells}</div>
              </div>
            ` : ''}
            <div class="rm-body">
              ${laneRows}
            </div>
          </div>
        `;

        if (reveal === 'instant') {
          el.querySelectorAll('.rm-bar, .rm-lane').forEach(n => n.classList.add('in'));
        }
      }
    };

    if (reveal === 'staggered') {
      slide.init = function (el) {
        const lanesEl = Array.from(el.querySelectorAll('.rm-lane'));
        const barsEl = Array.from(el.querySelectorAll('.rm-bar'));
        const timers = [];
        lanesEl.forEach((lane, i) => {
          timers.push(setTimeout(() => lane.classList.add('in'), 150 + i * 180));
        });
        barsEl.forEach((bar, i) => {
          const laneIdx = Number(bar.dataset.i);
          timers.push(setTimeout(() => bar.classList.add('in'), 400 + laneIdx * 180 + Number(bar.dataset.j) * 120));
        });
        return () => timers.forEach(clearTimeout);
      };
      slide.replay = function (el) {
        el.querySelectorAll('.rm-bar, .rm-lane').forEach(n => n.classList.remove('in'));
        return this.init(el);
      };
    }

    return slide;
  };

  function escape(s) {
    return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }
})(typeof window !== 'undefined' ? window : globalThis);
