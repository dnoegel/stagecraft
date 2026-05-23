'use strict';

/**
 * Stage.CodeBlock — monospace code block with optional reveal animations.
 *
 * Usage:
 *   Stage.register(Stage.CodeBlock({
 *     section: 5,
 *     title: '05 · the patch',
 *     fileName: 'src/agent.ts',
 *     language: 'typescript',
 *     code: `function agent(input) {\n  return loop(input);\n}`,
 *     highlight: [2],                    // 1-based line numbers
 *     reveal: 'typewriter'               // 'typewriter' | 'lines' | 'instant'
 *   }));
 *
 * Edit paths: code / fileName
 */

(function (root) {
  const Stage = root.Stage = root.Stage || {};

  Stage.CodeBlock = function (opts) {
    const code = String(opts.code || '');
    const fileName = opts.fileName || '';
    const language = opts.language || '';
    const highlight = new Set((opts.highlight || []).map(Number));
    const reveal = opts.reveal || 'instant';

    const lines = code.split('\n');

    return {
      section: opts.section,
      title: opts.title,
      transition: opts.transition,
      render(el) {
        const lineHtml = lines.map((line, i) => {
          const lineNum = i + 1;
          const hl = highlight.has(lineNum) ? ' cb-line--highlight' : '';
          return `
            <div class="cb-line${hl}" data-line="${lineNum}" data-stage-key="CodeBlock/line[${i}]">
              <span class="cb-line-num">${lineNum}</span>
              <span class="cb-line-text">${escape(line) || '&nbsp;'}</span>
            </div>
          `;
        }).join('');

        el.innerHTML = `
          <div class="codeblock" data-stage-key="CodeBlock">
            ${fileName ? `
              <div class="cb-head" data-stage-key="CodeBlock/head">
                <span class="cb-dots"><span></span><span></span><span></span></span>
                <span class="cb-file" data-stage-edit="fileName">${escape(fileName)}</span>
                ${language ? `<span class="cb-lang">${escape(language)}</span>` : ''}
              </div>
            ` : ''}
            <div class="cb-body" data-stage-edit="code">${lineHtml}</div>
          </div>
        `;

        if (reveal === 'instant') {
          el.querySelectorAll('.cb-line').forEach(n => n.classList.add('in'));
        }
      },
      init(el) {
        const lineNodes = Array.from(el.querySelectorAll('.cb-line'));
        const timers = [];
        const rafs = [];

        if (reveal === 'instant') {
          lineNodes.forEach(n => n.classList.add('in'));
          return () => {};
        }

        if (reveal === 'lines') {
          lineNodes.forEach((n, i) => {
            timers.push(setTimeout(() => n.classList.add('in'), 80 + i * 90));
          });
          return () => timers.forEach(clearTimeout);
        }

        if (reveal === 'typewriter') {
          // Hide all line texts, then type them sequentially char-by-char.
          const originals = lineNodes.map(n => {
            const txt = n.querySelector('.cb-line-text');
            return txt ? lines[Number(n.dataset.line) - 1] : '';
          });
          lineNodes.forEach(n => {
            n.classList.add('in');
            const txt = n.querySelector('.cb-line-text');
            if (txt) txt.textContent = '';
          });

          let lineIdx = 0;
          let charIdx = 0;
          const speed = 18; // ms/char
          function step() {
            if (lineIdx >= lineNodes.length) return;
            const node = lineNodes[lineIdx];
            const txt = node.querySelector('.cb-line-text');
            const target = originals[lineIdx] || '';
            if (!txt) { lineIdx++; charIdx = 0; rafs.push(requestAnimationFrame(step)); return; }
            if (charIdx <= target.length) {
              txt.textContent = target.slice(0, charIdx) || ' ';
              charIdx++;
              const id = setTimeout(step, speed);
              timers.push(id);
            } else {
              lineIdx++;
              charIdx = 0;
              const id = setTimeout(step, 40);
              timers.push(id);
            }
          }
          const startId = setTimeout(step, 150);
          timers.push(startId);
          return () => {
            timers.forEach(clearTimeout);
            rafs.forEach(cancelAnimationFrame);
          };
        }

        return () => {};
      },
      replay(el) {
        el.querySelectorAll('.cb-line').forEach(n => n.classList.remove('in'));
        // Restore text content
        const lineNodes = el.querySelectorAll('.cb-line');
        lineNodes.forEach((n, i) => {
          const txt = n.querySelector('.cb-line-text');
          if (txt) txt.innerHTML = escape(lines[i] || '') || '&nbsp;';
        });
        return this.init(el);
      }
    };
  };

  function escape(s) {
    return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }
})(typeof window !== 'undefined' ? window : globalThis);
