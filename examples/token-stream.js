'use strict';

/**
 * Cookbook · Token Stream
 * -----------------------
 * Technique: interleaved word-fill across a split panel.
 *
 * Two columns ("Side A" / "Side B") fill with words, alternating
 * A → B → A → B. When one side runs out, the other continues alone.
 * Only the final landing column gets a caret.
 *
 * What to copy:
 *  - The interleaved queue construction (the for-loop that zips two arrays).
 *  - The per-item randomized delay (320 + Math.random() * 280) for an
 *    organic, non-mechanical streaming feel.
 *  - The inline <style> element pattern — slide-scoped CSS injected by
 *    the slide itself, decoupled from the global theme.
 *  - The cancellation pattern: a `cancelled` flag plus a tracked `timers`
 *    array, returned from `init`/`replay` so the engine can clean up
 *    when the slide unmounts.
 */

function playTokenStream(el) {
  const sideA = ['task A', 'task B', 'task C', 'task D', 'task E', 'task F', 'task G'];
  const sideB = ['skill 1', 'skill 2', 'skill 3', 'skill 4', 'skill 5', 'skill 6', 'skill 7', 'skill 8'];

  const aEl = el.querySelector('#side-a');
  const bEl = el.querySelector('#side-b');
  aEl.innerHTML = '';
  bEl.innerHTML = '';

  // build interleaved queue: a[0], b[0], a[1], b[1], ...
  // when one side exhausts, only the other contributes.
  const queue = [];
  const max = Math.max(sideA.length, sideB.length);
  for (let i = 0; i < max; i++) {
    if (i < sideA.length) queue.push({ container: aEl, word: sideA[i] });
    if (i < sideB.length) queue.push({ container: bEl, word: sideB[i] });
  }

  const style = document.createElement('style');
  style.textContent = `.stream-text .item { transition: opacity 200ms ease-out; }`;
  el.appendChild(style);

  let idx = 0;
  let cancelled = false;
  const timers = [];

  function nextOne() {
    if (cancelled) return;
    if (idx >= queue.length) {
      // landed on side B — attach caret there
      const c = document.createElement('span');
      c.className = 'caret';
      bEl.appendChild(c);
      return;
    }
    const { container, word } = queue[idx++];
    const item = document.createElement('span');
    item.className = 'item';
    item.textContent = word;
    container.appendChild(item);
    requestAnimationFrame(() => item.style.opacity = '1');
    const delay = 320 + Math.random() * 280;
    timers.push(setTimeout(nextOne, delay));
  }

  timers.push(setTimeout(nextOne, 400));

  return () => {
    cancelled = true;
    timers.forEach(clearTimeout);
  };
}

Stage.register({
  section: 1,
  title: 'Example · Token Stream',
  render(el) {
    el.innerHTML = `
      <div class="split">
        <div class="split-col">
          <div class="split-label cheap"><span class="dot"></span>Side A</div>
          <div class="stream-text" id="side-a"></div>
        </div>
        <div class="split-divider"></div>
        <div class="split-col">
          <div class="split-label expensive"><span class="dot"></span>Side B</div>
          <div class="stream-text" id="side-b"></div>
        </div>
      </div>
    `;
  },
  init(el) { return playTokenStream(el); },
  replay(el) { return playTokenStream(el); }
});
