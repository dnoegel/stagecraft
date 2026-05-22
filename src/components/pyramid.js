'use strict';

/**
 * Stage.Pyramid — stacked horizontal layers (clip-path trapezoids).
 *
 * Usage:
 *   Stage.register(Stage.Pyramid({
 *     section: 6,
 *     title: '06 · Trust pyramid',
 *     orientation: 'up',           // 'up' | 'down'  (up = top narrow)
 *     layers: [
 *       { label: 'Vision',  body: 'rare',        color: 'accent' },
 *       { label: 'Taste',   body: 'felt',        color: 'blue'   },
 *       { label: 'Skill',   body: 'practiced'                    },
 *       { label: 'Effort',  body: 'available',   color: 'dim'    }
 *     ],
 *     reveal: 'staggered'          // 'instant' | 'staggered' | 'per-click'
 *   }));
 *
 * Reveal order: bottom-up for 'up'; top-down for 'down'.
 */

(function (root) {
  const Stage = root.Stage = root.Stage || {};

  Stage.Pyramid = function (opts) {
    const layers = opts.layers || [];
    const reveal = opts.reveal || 'instant';
    const orientation = opts.orientation === 'down' ? 'down' : 'up';
    const n = layers.length;

    // Width ratio per layer index (0 = top in render order).
    // For 'up' shape: top layer is narrowest, bottom widest.
    // For 'down': inverted.
    function widthFor(i) {
      if (n <= 1) return 100;
      const min = 32; // %
      const max = 100;
      const t = i / (n - 1);
      const ratio = orientation === 'up' ? t : (1 - t);
      return min + (max - min) * ratio;
    }

    const slide = {
      section: opts.section,
      title: opts.title,
      transition: opts.transition,
      render(el) {
        el.innerHTML = `
          <div class="pyramid pyramid--${orientation}" data-stage-key="Pyramid">
            ${layers.map((layer, i) => {
              const w = widthFor(i).toFixed(2);
              // Reveal order: for 'up' we reveal bottom-to-top -> step n-i, for 'down' top-to-bottom -> step i+1.
              const step = orientation === 'up' ? (n - i) : (i + 1);
              return `
                <div class="pyr-layer ${layer.color ? 'pyc-' + escape(layer.color) : ''}"
                     data-step="${step}"
                     style="--pyr-w: ${w}%;"
                     data-stage-key="Pyramid/layer[${i}]">
                  <div class="pyr-shape">
                    <div class="pyr-content">
                      <div class="pyr-label" data-stage-edit="layers[${i}].label" data-stage-key="Pyramid/layer[${i}]/label">${escape(layer.label || '')}</div>
                      ${layer.body ? `<div class="pyr-body" data-stage-edit="layers[${i}].body" data-stage-key="Pyramid/layer[${i}]/body">${escape(layer.body)}</div>` : ''}
                    </div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        `;
        if (reveal === 'instant') {
          el.querySelectorAll('.pyr-layer').forEach(n => n.classList.add('in'));
        }
      }
    };

    if (reveal === 'staggered') {
      slide.init = function (el) {
        // Walk in reveal-order (low step first).
        const nodes = Array.from(el.querySelectorAll('.pyr-layer'))
          .sort((a, b) => Number(a.dataset.step) - Number(b.dataset.step));
        const timers = [];
        nodes.forEach((node, i) => {
          timers.push(setTimeout(() => node.classList.add('in'), 200 + i * 240));
        });
        return () => timers.forEach(clearTimeout);
      };
      slide.replay = function (el) {
        el.querySelectorAll('.pyr-layer').forEach(n => n.classList.remove('in'));
        return this.init(el);
      };
    } else if (reveal === 'per-click') {
      slide.steps = layers.length;
      slide.onStep = function (el, step) {
        el.querySelectorAll('.pyr-layer').forEach(n => {
          n.classList.toggle('in', Number(n.dataset.step) <= step);
        });
      };
    }

    return slide;
  };

  function escape(s) {
    return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }
})(typeof window !== 'undefined' ? window : globalThis);
