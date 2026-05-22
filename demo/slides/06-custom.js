'use strict';

/**
 * A custom slide — demonstrating the drawing-board mentality.
 * Pure HTML + a typewriter primitive + a step model + an SVG particle field.
 *
 * The AGENT.md says: if your slide is < 3 lines of Stage calls, it's probably
 * boring. This slide proves you can go further when content asks for it.
 */

Stage.register({
  section: 3,
  title: '03 · Bespoke',
  steps: 3,
  render(el) {
    el.innerHTML = `
      <div class="bespoke-stack">
        <div class="pre-label"><span class="dot"></span>Cookbook · custom</div>
        <div class="bespoke-line" data-step="1"></div>
        <div class="bespoke-line" data-step="2"></div>
        <div class="bespoke-line accent" data-step="3"></div>
        <svg class="bespoke-field" viewBox="0 0 800 200" style="margin-top:2rem;width:min(800px,80vw);height:200px;"></svg>
      </div>
      <style>
        .bespoke-stack { text-align: center; max-width: min(900px, 90vw); }
        .bespoke-line {
          font-size: clamp(1.5rem, 3vw, 2.5rem);
          font-weight: 500;
          letter-spacing: -0.02em;
          line-height: 1.4;
          min-height: 1.4em;
          color: var(--fg);
        }
        .bespoke-line.accent { color: var(--accent); }
      </style>
    `;
  },
  init(el) {
    const lines = [
      "When components don't reach the message",
      "step out of them.",
      "Write what the moment needs."
    ];
    const lineEls = el.querySelectorAll('.bespoke-line');
    const svg = el.querySelector('.bespoke-field');
    const NS = 'http://www.w3.org/2000/svg';

    // Subtle particle field across the bottom
    const intervalId = setInterval(() => {
      const x = Math.random() * 800;
      Stage.emitParticle(svg, x, 200, x + (Math.random() - 0.5) * 120, -20, 2400 + Math.random() * 800);
    }, 220);

    // Stash typewriters for cleanup
    const cleanups = [];
    let lastStep = 0;
    el._bespokeOnStep = (step) => {
      // Only run typewriter on the newly-shown line
      for (let i = lastStep + 1; i <= step; i++) {
        if (lineEls[i - 1] && !lineEls[i - 1].dataset.typed) {
          lineEls[i - 1].dataset.typed = '1';
          cleanups.push(Stage.typewriter(lineEls[i - 1], lines[i - 1], { speed: 28, jitter: 30 }));
        }
      }
      lastStep = step;
    };

    return () => {
      clearInterval(intervalId);
      cleanups.forEach(c => c?.());
    };
  },
  onStep(el, step) {
    el._bespokeOnStep?.(step);
  },
  replay(el) {
    el.querySelectorAll('.bespoke-line').forEach(l => { l.textContent = ''; delete l.dataset.typed; });
    return this.init(el);
  }
});
