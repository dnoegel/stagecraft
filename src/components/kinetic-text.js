'use strict';

/**
 * Stage.KineticText — multi-line staggered reveal.
 *
 * Usage:
 *   Stage.register(Stage.KineticText({
 *     section: 2,
 *     title: '02 · The shift',
 *     lines: [
 *       { text: 'You start with a sentence.', color: 'fg' },
 *       { text: 'You end with the sentence',  color: 'dim' },
 *       { text: 'rewritten.',                 color: 'accent', pause: 800 }
 *     ],
 *     pace: 800
 *   }));
 *
 * Colors: 'fg' (default) | 'dim' | 'accent' | 'amber' | 'blue'.
 * pause: ms before this specific line appears (in addition to pace).
 *
 * Layer-3 (inline edit): each line's text is tagged with
 *   data-stage-edit="lines[N].text"
 * Layer-2 (element-pin notes): each line has
 *   data-stage-key="KineticText/line[N]"
 */

(function (root) {
  const Stage = root.Stage = root.Stage || {};

  Stage.KineticText = function (opts) {
    const lines = opts.lines || [];
    const pace = opts.pace ?? 800;

    return {
      section: opts.section,
      title: opts.title,
      transition: opts.transition,
      render(el) {
        el.classList.add('kinetic');
        el.innerHTML = '';
        const wrap = document.createElement('div');
        wrap.className = 'kinetic-wrap';
        wrap.dataset.stageKey = 'KineticText';
        lines.forEach((line, i) => {
          const span = document.createElement('div');
          span.className = 'line ' + (line.color || 'fg');
          span.textContent = line.text;
          span.dataset.stageEdit = `lines[${i}].text`;
          span.dataset.stageKey = `KineticText/line[${i}]`;
          wrap.appendChild(span);
        });
        el.appendChild(wrap);
      },
      init(el) {
        const nodes = el.querySelectorAll('.line');
        const timers = [];
        let acc = 0;
        nodes.forEach((n, i) => {
          const line = lines[i] || {};
          const delay = (line.pause ?? 0) + (i === 0 ? 200 : pace);
          acc += delay;
          timers.push(setTimeout(() => n.classList.add('in'), acc));
        });
        return () => timers.forEach(clearTimeout);
      },
      replay(el) {
        el.querySelectorAll('.line').forEach(n => n.classList.remove('in'));
        return this.init(el);
      }
    };
  };
})(typeof window !== 'undefined' ? window : globalThis);
