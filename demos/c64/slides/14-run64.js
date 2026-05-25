'use strict';

/**
 * Closing slide — types "RUN 64" at the prompt and leaves the cursor blinking.
 * Bespoke because we want the command to type itself on entry, then sit there
 * forever like the C64 always did, waiting for you to come back.
 */
Stage.register({
  section: 6,
  title: '06 · RUN 64.',
  render(el) {
    el.innerHTML = `
      <div style="text-align: center; display: flex; flex-direction: column; align-items: center; gap: 2.2rem;">
        <div class="pre-label"><span class="dot"></span>READY.</div>
        <pre class="c64-run" style="
          font-family: var(--display);
          font-size: clamp(2.2rem, 7vw, 5.5rem);
          color: var(--accent);
          line-height: 1.2;
          letter-spacing: 0;
          text-transform: uppercase;
          margin: 0;
          white-space: pre;
        "><span class="c64-typed"></span><span class="c64-cursor"></span></pre>
        <div class="sub" style="margin-top: 1.5rem;">Thank you.</div>
      </div>
    `;
  },
  init(el) {
    const typed = el.querySelector('.c64-typed');
    const cursor = el.querySelector('.c64-cursor');

    // Style the block cursor up front (hidden until first frame paint).
    cursor.style.cssText = `
      display: inline-block;
      width: 0.62em;
      height: 0.95em;
      background: var(--accent);
      vertical-align: -0.05em;
      margin-left: 0.08em;
      animation: c64-blink 600ms steps(2, end) infinite;
    `;

    // Lean on Stagecraft's built-in typewriter primitive — it handles the
    // character-by-character reveal and returns a cleanup we can chain.
    const cleanup = Stage.typewriter(typed, 'RUN 64', { speed: 180, jitter: 40 });
    return cleanup;
  },
  replay(el) {
    this.render(el);
    return this.init(el);
  }
}, {
  notes: 'Closing beat. Type the command, leave the cursor. The C64 always sat there waiting — that\'s how it ends every story it was ever part of. Let the cursor blink while the audience claps.'
});
