'use strict';

/**
 * BESPOKE · The countdown.
 *
 * T-10 to T-0, real time-ish. A big amber digit in the middle of the screen
 * cycles 10 → 9 → 8 → … → 1, with a "T - MINUS" label above and a tag below.
 * On T-0 we swap the digit out for the word "LIFT-OFF" with a slow pulse.
 *
 * Cinematic choices:
 *  - 900ms per digit, not 1000ms — feels brisker than a real wall clock.
 *  - Each digit transition uses a tiny opacity-blink so the eye notices the change.
 *  - The "LIFT-OFF" reveal has its own pulse animation via Web Animations API.
 *  - Cleanup tracks every timer in a single array — engine calls return value on unmount.
 */
function playCountdown(el) {
  const digit  = el.querySelector('.countdown-digit');
  const tag    = el.querySelector('.countdown-tag');
  const label  = el.querySelector('.countdown-label');
  const wrap   = el.querySelector('.countdown');

  let cancelled = false;
  const timers = [];

  let n = 10;
  digit.textContent = n;

  const setDigit = (value) => {
    if (cancelled) return;
    // Tiny blink → swap → fade back in. Reads as a clock tick.
    digit.style.transition = 'opacity 120ms ease-out';
    digit.style.opacity = '0.15';
    timers.push(setTimeout(() => {
      if (cancelled) return;
      digit.textContent = value;
      digit.style.opacity = '1';
    }, 130));
  };

  // Schedule the countdown: every 900ms, decrement.
  const tickEvery = 900;
  for (let i = 1; i <= 10; i++) {
    timers.push(setTimeout(() => {
      if (cancelled) return;
      if (i < 10) {
        n = 10 - i;
        setDigit(n);
      } else {
        // T-0 → LIFT-OFF.
        digit.style.transition = 'opacity 300ms ease-out';
        digit.style.opacity = '0';
        timers.push(setTimeout(() => {
          if (cancelled) return;
          // Reconfigure the wrap into the lift-off layout.
          label.textContent = 'T = 00:00:00';
          tag.textContent = 'Kennedy Space Center · 16 July 1969 · 13:32 UTC';
          digit.style.display = 'none';
          // Insert the LIFT-OFF type
          const lift = document.createElement('div');
          lift.className = 'countdown-liftoff';
          lift.textContent = 'LIFT-OFF';
          lift.style.opacity = '0';
          wrap.insertBefore(lift, tag);
          requestAnimationFrame(() => {
            lift.style.transition = 'opacity 600ms ease-out';
            lift.style.opacity = '1';
            // Slow pulse on the LIFT-OFF type.
            if (lift.animate) {
              lift.animate([
                { textShadow: '0 0 40px rgba(255,180,84,0.45), 0 0 100px rgba(255,180,84,0.45)' },
                { textShadow: '0 0 70px rgba(255,180,84,0.75), 0 0 160px rgba(255,180,84,0.75)' },
                { textShadow: '0 0 40px rgba(255,180,84,0.45), 0 0 100px rgba(255,180,84,0.45)' }
              ], { duration: 1800, iterations: Infinity });
            }
          });
        }, 320));
      }
    }, i * tickEvery));
  }

  return () => {
    cancelled = true;
    timers.forEach(clearTimeout);
  };
}

Stage.register({
  section: 3,
  title: '02 · T-10',
  render(el) {
    el.innerHTML = `
      <div class="countdown">
        <div class="countdown-label">T &mdash; MINUS</div>
        <div class="countdown-digit">10</div>
        <div class="countdown-tag">Kennedy Space Center &middot; 16 July 1969 &middot; 13:32 UTC</div>
      </div>
    `;
  },
  init(el)   { return playCountdown(el); },
  replay(el) { this.render(el); return playCountdown(el); }
}, {
  notes: [
    'BESPOKE COUNTDOWN. Total runtime ~10 seconds. The digit cycles 10 → 1 at 900 ms per tick, then T-0 swaps in the LIFT-OFF type with a glowing pulse.',
    'Presenter cue: stop talking at "T-10". Let the room watch the numbers fall. Say nothing until LIFT-OFF appears, then say the word out loud yourself.',
    'Historical: T-0 was 13:32:00 UTC on 16 July 1969. The flight directors had stopped breathing at T-30; the room exhaled at first-stage shutdown two and a half minutes later.'
  ].join(' ')
});
