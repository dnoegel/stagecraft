'use strict';

/**
 * Stage.Venn — 2- or 3-circle Venn diagram with labeled regions.
 *
 * Usage (2 sets):
 *   Stage.register(Stage.Venn({
 *     section: 7,
 *     title: '07 · the overlap',
 *     sets: [
 *       { label: 'Taste',      color: 'accent' },
 *       { label: 'Throughput', color: 'blue'   }
 *     ],
 *     overlaps: [{ ids: [0,1], label: 'shipping value' }],
 *     reveal: 'staggered'   // 'instant' | 'staggered'
 *   }));
 *
 * Usage (3 sets):
 *   Stage.register(Stage.Venn({
 *     sets: [
 *       { label: 'Knows',  color: 'accent' },
 *       { label: 'Cares',  color: 'amber'  },
 *       { label: 'Does',   color: 'blue'   }
 *     ],
 *     overlaps: [
 *       { ids: [0,1],   label: 'opinions' },
 *       { ids: [0,2],   label: 'execution' },
 *       { ids: [1,2],   label: 'effort' },
 *       { ids: [0,1,2], label: 'the work' }
 *     ]
 *   }));
 *
 * Layer-3 (inline edit):
 *   sets[i].label, overlaps[j].label.
 */

(function (root) {
  const Stage = root.Stage = root.Stage || {};

  const COLOR_MAP = {
    accent: 'var(--accent)',
    amber:  'var(--amber)',
    blue:   'var(--blue)',
    red:    'var(--red)',
    dim:    'var(--dim)',
    fg:     'var(--fg)'
  };

  // viewBox is 100 x 78 (matches container aspect).
  const VB_W = 100;
  const VB_H = 78;

  function colorFor(name) {
    return COLOR_MAP[name] || COLOR_MAP.accent;
  }

  // Geometry presets — ALL coordinates in SVG viewBox units (100 × 78).
  // The render function converts to container-% for CSS positioning, so labels
  // align exactly with the circles regardless of the container's aspect ratio.
  // Each set label is placed in that set's *exclusive* region (the horn that
  // doesn't overlap any other set), and each overlap label sits in the
  // overlap region it names.
  const GEOMETRY = {
    2: {
      circles: [
        { cx: 38, cy: 39, r: 22 },
        { cx: 62, cy: 39, r: 22 }
      ],
      setLabels: [
        { x: 25, y: 39 },     // Knows-only horn (left)
        { x: 75, y: 39 }      // Cares-only horn (right)
      ],
      overlapLabels: {
        '0-1': { x: 50, y: 39 }
      }
    },
    3: {
      circles: [
        { cx: 38, cy: 32, r: 22 },
        { cx: 62, cy: 32, r: 22 },
        { cx: 50, cy: 53, r: 22 }
      ],
      setLabels: [
        { x: 28, y: 22 },     // Knows-only horn (upper-left)
        { x: 72, y: 22 },     // Cares-only horn (upper-right)
        { x: 50, y: 70 }      // Does-only horn (bottom)
      ],
      overlapLabels: {
        '0-1':   { x: 50, y: 23 },   // Knows ∩ Cares  (top center)
        '0-2':   { x: 31, y: 50 },   // Knows ∩ Does   (lower-left)
        '1-2':   { x: 69, y: 50 },   // Cares ∩ Does   (lower-right)
        '0-1-2': { x: 50, y: 40 }    // all three      (center)
      }
    }
  };

  // Convert viewBox-units position to container-% (which is what CSS uses).
  function toCSS(p) {
    return { left: (p.x / VB_W) * 100, top: (p.y / VB_H) * 100 };
  }

  Stage.Venn = function (opts) {
    const sets = (opts.sets || []).slice(0, 3);
    const overlaps = opts.overlaps || [];
    const reveal = opts.reveal || 'instant';
    const n = sets.length;
    const geo = GEOMETRY[n] || GEOMETRY[2];

    function keyFor(ids) {
      return ids.slice().sort((a, b) => a - b).join('-');
    }

    const slide = {
      section: opts.section,
      title: opts.title,
      transition: opts.transition,
      render(el) {
        const svgCircles = sets.map((s, i) => {
          const c = geo.circles[i] || geo.circles[0];
          return `<circle class="v-circle"
                          data-set="${i}"
                          data-stage-key="Venn/circle[${i}]"
                          cx="${c.cx}" cy="${c.cy}" r="${c.r}"
                          fill="${colorFor(s.color)}"
                          stroke="${colorFor(s.color)}"/>`;
        }).join('');

        const setLabels = sets.map((s, i) => {
          const pos = toCSS(geo.setLabels[i] || { x: 50, y: 39 });
          return `<div class="v-label set"
                       data-set="${i}"
                       data-stage-key="Venn/set-label[${i}]"
                       style="left:${pos.left}%; top:${pos.top}%; --vl-color:${colorFor(s.color)};">
                    <span class="name" data-stage-edit="sets[${i}].label">${escape(s.label || '')}</span>
                  </div>`;
        }).join('');

        const overlapLabels = overlaps.map((o, j) => {
          const key = keyFor(o.ids || []);
          const rawPos = geo.overlapLabels[key];
          if (!rawPos) return '';
          const pos = toCSS(rawPos);
          return `<div class="v-label overlap"
                       data-overlap="${j}"
                       data-stage-key="Venn/overlap-label[${j}]"
                       style="left:${pos.left}%; top:${pos.top}%;">
                    <span data-stage-edit="overlaps[${j}].label">${escape(o.label || '')}</span>
                  </div>`;
        }).join('');

        el.innerHTML = `
          <div class="venn" data-stage-key="Venn">
            <svg viewBox="0 0 ${VB_W} ${VB_H}" preserveAspectRatio="xMidYMid meet">
              ${svgCircles}
            </svg>
            ${setLabels}
            ${overlapLabels}
          </div>
        `;

        if (reveal === 'instant') {
          el.querySelectorAll('.v-circle, .v-label').forEach(n => n.classList.add('in'));
        }
      }
    };

    if (reveal === 'staggered') {
      slide.init = function (el) {
        const circles = Array.from(el.querySelectorAll('.v-circle'));
        const setLbls = Array.from(el.querySelectorAll('.v-label.set'));
        const overLbls = Array.from(el.querySelectorAll('.v-label.overlap'));
        const timers = [];
        circles.forEach((c, i) => {
          timers.push(setTimeout(() => c.classList.add('in'), 200 + i * 260));
        });
        const setStart = 200 + circles.length * 260;
        setLbls.forEach((l, i) => {
          timers.push(setTimeout(() => l.classList.add('in'), setStart + i * 160));
        });
        const overStart = setStart + setLbls.length * 160 + 200;
        overLbls.forEach((l, i) => {
          timers.push(setTimeout(() => l.classList.add('in'), overStart + i * 200));
        });
        return () => timers.forEach(clearTimeout);
      };
      slide.replay = function (el) {
        el.querySelectorAll('.v-circle, .v-label').forEach(n => n.classList.remove('in'));
        return this.init(el);
      };
    }

    return slide;
  };

  function escape(s) {
    return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }
})(typeof window !== 'undefined' ? window : globalThis);
