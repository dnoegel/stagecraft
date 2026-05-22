'use strict';

/**
 * Stage.Statement — one massive declarative sentence, centered.
 *
 * Usage:
 *   Stage.register(Stage.Statement({
 *     section: 1,
 *     title: '01 · Thesis',
 *     text: 'We are not in the business of making widgets. We are in the business of trust.',
 *     emphasis: ['trust'],   // substrings within text get accent color
 *     color: 'accent'        // 'accent' | 'amber' | 'blue' — controls emphasis color
 *   }));
 *
 * On init the text reveals word by word.
 *
 * Edit paths:
 *   text  (the whole sentence; emphasis is structural, not inline-editable)
 */

(function (root) {
  const Stage = root.Stage = root.Stage || {};

  Stage.Statement = function (opts) {
    const text = opts.text || '';
    const emphasis = Array.isArray(opts.emphasis) ? opts.emphasis : [];
    const color = opts.color || 'accent';

    return {
      section: opts.section,
      title: opts.title,
      transition: opts.transition,
      render(el) {
        el.classList.add('statement-host');
        // Build emphasized HTML, then split by whitespace into word spans so we
        // can stagger reveal. We escape first, then wrap emphasis spans.
        const emphasized = emphasizeHTML(text, emphasis, color);
        const words = splitWords(emphasized);

        el.innerHTML = `
          <div class="statement" data-stage-key="Statement">
            <p class="statement-text" data-stage-edit="text" data-stage-key="Statement/text">${
              words.map((w, i) => `<span class="st-word" data-i="${i}">${w}</span>`).join(' ')
            }</p>
          </div>
        `;
      },
      init(el) {
        const words = el.querySelectorAll('.st-word');
        const timers = [];
        words.forEach((w, i) => {
          timers.push(setTimeout(() => w.classList.add('in'), 120 + i * 90));
        });
        return () => timers.forEach(clearTimeout);
      },
      replay(el) {
        el.querySelectorAll('.st-word').forEach(n => n.classList.remove('in'));
        return this.init(el);
      }
    };
  };

  // Build escaped HTML where each emphasis substring becomes
  // <span class="st-em st-em--accent">...</span>.
  function emphasizeHTML(raw, emphasis, color) {
    let html = escape(raw);
    // Sort longest first so substrings don't shadow longer matches.
    const sorted = [...emphasis].filter(Boolean).sort((a, b) => b.length - a.length);
    for (const phrase of sorted) {
      const esc = escape(phrase);
      const re = new RegExp(escapeRegex(esc), 'g');
      html = html.replace(re, `<span class="st-em st-em--${escape(color)}">${esc}</span>`);
    }
    return html;
  }

  // Split into word tokens, preserving emphasis tags intact (don't split inside <span>).
  function splitWords(html) {
    // Tokenize: keep tag-blocks atomic by splitting on plain whitespace
    // but only outside tags. Simple state machine.
    const tokens = [];
    let buf = '';
    let depth = 0;
    for (let i = 0; i < html.length; i++) {
      const c = html[i];
      if (c === '<') depth++;
      if (c === ' ' && depth === 0) {
        if (buf) tokens.push(buf);
        buf = '';
      } else {
        buf += c;
      }
      if (c === '>') depth--;
    }
    if (buf) tokens.push(buf);
    return tokens;
  }

  function escapeRegex(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function escape(s) {
    return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }
})(typeof window !== 'undefined' ? window : globalThis);
