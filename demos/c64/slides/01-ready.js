'use strict';

/**
 * The iconic Commodore 64 BASIC V2 startup screen.
 *
 * Bespoke — we want full control over the layout: centered block of monospace
 * text, typewriter reveal line by line, then a blinking block cursor on the
 * empty prompt line. This is the audience's first "oh, THIS deck" moment.
 */
Stage.register({
  section: 1,
  title: '01 · READY.',
  render(el) {
    el.innerHTML = `
      <pre class="c64-readout" style="
        font-family: var(--body);
        font-size: clamp(1.1rem, 2vw, 1.9rem);
        line-height: 1.35;
        color: var(--fg);
        letter-spacing: 0.02em;
        text-align: left;
        white-space: pre;
        margin: 0;
      "><span class="c64-line" data-line="1">    **** COMMODORE 64 BASIC V2 ****</span>
<span class="c64-line" data-line="2"> </span>
<span class="c64-line" data-line="3"> 64K RAM SYSTEM  38911 BASIC BYTES FREE</span>
<span class="c64-line" data-line="4"> </span>
<span class="c64-line" data-line="5">READY.</span>
<span class="c64-line c64-prompt" data-line="6"> <span class="c64-cursor"></span></span></pre>
    `;
    // Hide all lines initially.
    el.querySelectorAll('.c64-line').forEach(n => { n.style.opacity = '0'; });
  },
  init(el) {
    const lines = Array.from(el.querySelectorAll('.c64-line'));
    const cursor = el.querySelector('.c64-cursor');
    const timers = [];

    // Reveal lines one by one with a small delay so it feels like the C64
    // is booting. The blank lines get the same beat, which gives the rhythm.
    lines.forEach((line, i) => {
      const t = setTimeout(() => {
        line.style.transition = 'opacity 220ms ease-out';
        line.style.opacity = '1';
      }, 400 + i * 380);
      timers.push(t);
    });

    // After everything is shown, install the blinking block cursor.
    const cursorT = setTimeout(() => {
      cursor.style.cssText = `
        display: inline-block;
        width: 0.62em;
        height: 1.05em;
        background: var(--accent);
        vertical-align: -0.18em;
        animation: c64-blink 600ms steps(2, end) infinite;
      `;
    }, 400 + lines.length * 380 + 200);
    timers.push(cursorT);

    return () => timers.forEach(clearTimeout);
  },
  replay(el) {
    // Restart by re-running init logic.
    this.render(el);
    return this.init(el);
  }
}, {
  notes: 'The C64 booted into BASIC instantly — no OS, no splash screen, just this. Many people in the audience saw this screen first on a CRT in their living room. Let it land. The cursor is the punchline.'
});
