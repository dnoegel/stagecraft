'use strict';

/**
 * BESPOKE · GO.
 *
 * One word. Enormous. Glowing. The moment Bales cleared the alarm and the
 * landing kept happening.
 */
Stage.register({
  section: 5,
  title: '04 · GO',
  render(el) {
    el.innerHTML = `
      <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;gap:0.4rem;text-align:center;">
        <div class="pre-label" style="margin-bottom: 0.8rem;"><span class="dot"></span>STEVE BALES &middot; FIDO &middot; 26 YEARS OLD</div>
        <div class="big-go">GO.</div>
        <div class="big-go-sub">on that alarm</div>
      </div>
    `;
  },
  init(el) {
    const go = el.querySelector('.big-go');
    const sub = el.querySelector('.big-go-sub');
    const pre = el.querySelector('.pre-label');
    go.style.opacity = '0';
    sub.style.opacity = '0';
    pre.style.opacity = '0';

    const t1 = setTimeout(() => {
      pre.style.transition = 'opacity 600ms ease-out';
      pre.style.opacity = '1';
    }, 200);

    const t2 = setTimeout(() => {
      go.style.transition = 'opacity 700ms ease-out, transform 700ms cubic-bezier(0.2, 0.8, 0.2, 1)';
      go.style.transform = 'scale(1)';
      go.style.opacity = '1';
      // Slow pulsing glow.
      if (go.animate) {
        go.animate([
          { textShadow: '0 0 50px rgba(255,180,84,0.45), 0 0 100px rgba(255,180,84,0.45)' },
          { textShadow: '0 0 90px rgba(255,180,84,0.85), 0 0 200px rgba(255,180,84,0.85)' },
          { textShadow: '0 0 50px rgba(255,180,84,0.45), 0 0 100px rgba(255,180,84,0.45)' }
        ], { duration: 2200, iterations: Infinity });
      }
    }, 900);

    const t3 = setTimeout(() => {
      sub.style.transition = 'opacity 700ms ease-out';
      sub.style.opacity = '1';
    }, 1800);

    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  },
  replay(el) { this.render(el); return this.init(el); }
}, {
  notes: [
    'BESPOKE STATEMENT. One word. Hold it.',
    'Steve Bales was 26 years old. The guidance officer ("FIDO" — Flight Dynamics Officer — though technically Bales was GUIDO, but FIDO was the broader callsign for the discipline) had two seconds to decide whether to abort. He cleared the alarm. Charlie Duke as CAPCOM relayed it: "We are GO on that alarm."',
    'Two weeks later, Bales received the Presidential Medal of Freedom — accepting it on behalf of the entire mission control team.',
    'Presenter cue: say nothing for the first beat. Say "GO" out loud yourself as the word appears, then explain Bales for one sentence, then move on. The slide does the work.'
  ].join(' ')
});
