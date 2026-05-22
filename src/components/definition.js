'use strict';

/**
 * Stage.Definition — dictionary-style entry.
 *
 * Usage:
 *   Stage.register(Stage.Definition({
 *     section: 5,
 *     title: '05 · Define your terms',
 *     term: 'taste',
 *     definition: 'the ability to tell a good answer from a plausible one.',
 *     etymology: 'from Old French "tast" — to touch, to feel.',   // optional
 *     examples: [                                                  // optional, 1-2
 *       'You can rent skill. You cannot rent taste.',
 *       'Without taste, the model writes very fast nonsense.'
 *     ]
 *   }));
 *
 * In examples, occurrences of the term get highlighted automatically.
 *
 * Edit paths:
 *   term / definition / etymology / examples[i]
 */

(function (root) {
  const Stage = root.Stage = root.Stage || {};

  Stage.Definition = function (opts) {
    const term = opts.term || '';
    const definition = opts.definition || '';
    const etymology = opts.etymology || '';
    const examples = Array.isArray(opts.examples) ? opts.examples : [];

    return {
      section: opts.section,
      title: opts.title,
      transition: opts.transition,
      render(el) {
        el.innerHTML = `
          <article class="definition" data-stage-key="Definition">
            <header class="df-head">
              <h1 class="df-term" data-stage-edit="term" data-stage-key="Definition/term">${escape(term)}</h1>
              <span class="df-pos" aria-hidden="true">n.</span>
            </header>
            <p class="df-def" data-stage-edit="definition" data-stage-key="Definition/definition">${escape(definition)}</p>
            ${etymology ? `<p class="df-ety" data-stage-edit="etymology" data-stage-key="Definition/etymology">${escape(etymology)}</p>` : ''}
            ${examples.length ? `
              <ul class="df-examples">
                ${examples.map((ex, i) => `
                  <li class="df-ex" data-stage-edit="examples[${i}]" data-stage-key="Definition/example[${i}]">${highlight(ex, term)}</li>
                `).join('')}
              </ul>
            ` : ''}
          </article>
        `;
      },
      init(el) {
        const term = el.querySelector('.df-term');
        const pos = el.querySelector('.df-pos');
        const def = el.querySelector('.df-def');
        const ety = el.querySelector('.df-ety');
        const exs = el.querySelectorAll('.df-ex');
        const timers = [];
        timers.push(setTimeout(() => term && term.classList.add('in'), 120));
        timers.push(setTimeout(() => pos && pos.classList.add('in'), 350));
        timers.push(setTimeout(() => def && def.classList.add('in'), 700));
        timers.push(setTimeout(() => ety && ety.classList.add('in'), 1100));
        exs.forEach((n, i) => {
          timers.push(setTimeout(() => n.classList.add('in'), 1400 + i * 280));
        });
        return () => timers.forEach(clearTimeout);
      },
      replay(el) {
        el.querySelectorAll('.df-term, .df-pos, .df-def, .df-ety, .df-ex')
          .forEach(n => n.classList.remove('in'));
        return this.init(el);
      }
    };
  };

  function highlight(raw, term) {
    let html = escape(raw);
    if (!term) return html;
    const esc = escape(term);
    const re = new RegExp(escapeRegex(esc), 'gi');
    return html.replace(re, m => `<span class="df-mark">${m}</span>`);
  }

  function escapeRegex(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function escape(s) {
    return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }
})(typeof window !== 'undefined' ? window : globalThis);
