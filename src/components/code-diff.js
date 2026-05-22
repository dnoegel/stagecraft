'use strict';

/**
 * Stage.CodeDiff — git-style diff view with add/remove/context lines.
 *
 * Usage:
 *   Stage.register(Stage.CodeDiff({
 *     section: 5,
 *     title: '05 · the refactor',
 *     fileName: 'src/server.ts',
 *     language: 'typescript',
 *     lines: [
 *       { type: 'context', text: 'function handle(req) {' },
 *       { type: 'remove',  text: '  return JSON.parse(req.body);' },
 *       { type: 'add',     text: '  return safeParse(req.body);' },
 *       { type: 'context', text: '}' }
 *     ],
 *     reveal: 'staggered'                // 'instant' | 'staggered'
 *   }));
 *
 * Edit paths: lines[i].text / fileName
 */

(function (root) {
  const Stage = root.Stage = root.Stage || {};

  Stage.CodeDiff = function (opts) {
    const fileName = opts.fileName || '';
    const language = opts.language || '';
    const lines = opts.lines || [];
    const reveal = opts.reveal || 'instant';

    // Track plus/minus counts for header summary
    const adds = lines.filter(l => l.type === 'add').length;
    const removes = lines.filter(l => l.type === 'remove').length;

    const slide = {
      section: opts.section,
      title: opts.title,
      transition: opts.transition,
      render(el) {
        const lineHtml = lines.map((line, i) => {
          const type = line.type || 'context';
          const marker = type === 'add' ? '+' : type === 'remove' ? '-' : ' ';
          return `
            <div class="cd-line cd-line--${escape(type)}"
                 data-i="${i}"
                 data-stage-key="CodeDiff/line[${i}]">
              <span class="cd-marker">${marker}</span>
              <span class="cd-text" data-stage-edit="lines[${i}].text">${escape(line.text || '') || '&nbsp;'}</span>
            </div>
          `;
        }).join('');

        el.innerHTML = `
          <div class="codediff" data-stage-key="CodeDiff">
            ${fileName ? `
              <div class="cd-head" data-stage-key="CodeDiff/head">
                <span class="cd-file" data-stage-edit="fileName">${escape(fileName)}</span>
                ${language ? `<span class="cd-lang">${escape(language)}</span>` : ''}
                <span class="cd-stats">
                  <span class="cd-adds">+${adds}</span>
                  <span class="cd-removes">-${removes}</span>
                </span>
              </div>
            ` : ''}
            <pre class="cd-body">${lineHtml}</pre>
          </div>
        `;

        if (reveal === 'instant') {
          el.querySelectorAll('.cd-line').forEach(n => n.classList.add('in'));
        }
      }
    };

    if (reveal === 'staggered') {
      slide.init = function (el) {
        const lineNodes = Array.from(el.querySelectorAll('.cd-line'));
        const timers = [];
        lineNodes.forEach((n, i) => {
          timers.push(setTimeout(() => n.classList.add('in'), 120 + i * 130));
        });
        return () => timers.forEach(clearTimeout);
      };
      slide.replay = function (el) {
        el.querySelectorAll('.cd-line').forEach(n => n.classList.remove('in'));
        return this.init(el);
      };
    }

    return slide;
  };

  function escape(s) {
    return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }
})(typeof window !== 'undefined' ? window : globalThis);
