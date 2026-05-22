'use strict';

/**
 * Cookbook · whoami
 * -----------------
 * Technique: terminal prompt cycling through a list of strings,
 * landing on a final one.
 *
 * What to copy:
 *  - The replace-in-place pattern: each tick wipes `out.innerHTML`
 *    and renders one new span. Simpler (and less fiddly) than
 *    cross-fading between two layered elements.
 *  - The `isFinal` branch — the last identity gets a different
 *    class (.final) and a caret appended; the cycle stops there.
 *  - Cumulative-delay scheduling (`t += 2000`) — easier to reason
 *    about than computing each delay from the start.
 *  - The static prompt (`~/path $ whoami`) is plain HTML — only
 *    the output area animates. Cheap separation of layout vs motion.
 */

function playWhoami(el) {
  const out = el.querySelector('#whoami-out');
  if (!out) return () => {};
  out.innerHTML = '';

  const identities = [
    'role_one',
    'role_two',
    'role_three',
    'role_four',
    'role_five',
    'role_six',
    '¯\\_(ツ)_/¯',
  ];

  let cancelled = false;
  const timers = [];

  const show = (text, delay, isFinal) => {
    timers.push(setTimeout(() => {
      if (cancelled) return;
      out.innerHTML = '';
      const span = document.createElement('span');
      span.className = isFinal ? 'wm-id final' : 'wm-id';
      span.textContent = text;
      out.appendChild(span);
      if (isFinal) {
        const c = document.createElement('span');
        c.className = 'caret';
        out.appendChild(c);
      }
      // small fade-in
      span.style.opacity = '0';
      span.style.transition = 'opacity 180ms ease-out';
      requestAnimationFrame(() => { span.style.opacity = '1'; });
    }, delay));
  };

  // initial prompt typed already — start cycling — ~2s per identity
  let t = 700; // initial pause after prompt
  identities.forEach((id, i) => {
    const isFinal = i === identities.length - 1;
    show(id, t, isFinal);
    t += isFinal ? 0 : 2000;
  });

  return () => {
    cancelled = true;
    timers.forEach(clearTimeout);
  };
}

Stage.register({
  section: 4,
  title: 'Example · whoami',
  render(el) {
    el.innerHTML = `
      <div class="whoami">
        <div class="wm-prompt">
          <span class="wm-path accent">~/example</span>
          <span class="wm-sigil">$</span>
          <span class="wm-cmd">whoami</span>
        </div>
        <div class="wm-out" id="whoami-out"></div>
      </div>
    `;
  },
  init(el) { return playWhoami(el); },
  replay(el) { return playWhoami(el); }
});
