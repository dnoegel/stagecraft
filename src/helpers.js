'use strict';

/**
 * Stagecraft — Layer 1 primitives.
 *
 * Small composable utilities every slide can use. Kept tiny on purpose:
 * an agent should be able to read any one in 30 seconds.
 *
 * All helpers attach to the global `Stage` namespace.
 */

(function (root) {
  const Stage = root.Stage = root.Stage || {};

  // ---------------------------------------------------------------------------
  // prefersReducedMotion()
  // Whether the OS user has requested reduced motion. JS animations
  // (typewriter, count-up, particle emit, stagger, etc.) should consult
  // this and shortcut to the final state.
  // ---------------------------------------------------------------------------
  Stage.prefersReducedMotion = function () {
    return typeof matchMedia !== 'undefined' &&
      matchMedia('(prefers-reduced-motion: reduce)').matches;
  };

  // ---------------------------------------------------------------------------
  // staggerIn(nodes, step, initial)
  // Fade-in nodes one after another by adding `.in` class. Pairs with
  // `.stagger > * { opacity: 0; transform: translateY(12px); transition: ... }`
  // and `.stagger > *.in { opacity: 1; transform: translateY(0); }` in theme CSS.
  // Reduced motion: snap all in at once.
  // ---------------------------------------------------------------------------
  Stage.staggerIn = function (nodes, step = 200, initial = 100) {
    if (Stage.prefersReducedMotion()) {
      nodes.forEach(n => n.classList.add('in'));
      return () => {};
    }
    const timers = [];
    nodes.forEach((n, i) => {
      timers.push(setTimeout(() => n.classList.add('in'), initial + i * step));
    });
    return () => timers.forEach(clearTimeout);
  };

  // ---------------------------------------------------------------------------
  // emitParticle(parent, x1, y1, x2, y2, duration)
  // SVG particle traveling between two points with smooth-step easing.
  // ---------------------------------------------------------------------------
  Stage.emitParticle = function (parent, x1, y1, x2, y2, duration = 800) {
    if (Stage.prefersReducedMotion()) {
      // Skip the particle entirely in reduced-motion mode.
      return () => {};
    }
    const NS = 'http://www.w3.org/2000/svg';
    const c = document.createElementNS(NS, 'circle');
    c.setAttribute('class', 'particle');
    c.setAttribute('r', 3.5);
    c.setAttribute('cx', x1);
    c.setAttribute('cy', y1);
    parent.appendChild(c);
    const start = performance.now();
    let rafId;
    function step(now) {
      const t = Math.min(1, (now - start) / duration);
      const eased = t * t * (3 - 2 * t);
      const x = x1 + (x2 - x1) * eased;
      const y = y1 + (y2 - y1) * eased;
      c.setAttribute('cx', x);
      c.setAttribute('cy', y);
      c.setAttribute('opacity', 1 - t * 0.3);
      if (t < 1) rafId = requestAnimationFrame(step);
      else c.remove();
    }
    rafId = requestAnimationFrame(step);
    return () => { cancelAnimationFrame(rafId); c.remove(); };
  };

  // ---------------------------------------------------------------------------
  // typewriter(el, text, opts)
  // Character-by-character text reveal. Returns cleanup.
  // opts: { speed: ms per char, jitter: ms random extra, onDone: fn }
  // ---------------------------------------------------------------------------
  Stage.typewriter = function (el, text, opts = {}) {
    if (Stage.prefersReducedMotion()) {
      el.textContent = text;
      opts.onDone?.();
      return () => {};
    }
    const speed = opts.speed ?? 50;
    const jitter = opts.jitter ?? 30;
    el.textContent = '';
    let i = 0;
    let cancelled = false;
    const timers = [];
    function tick() {
      if (cancelled) return;
      if (i >= text.length) { opts.onDone?.(); return; }
      el.textContent += text[i++];
      timers.push(setTimeout(tick, speed + Math.random() * jitter));
    }
    timers.push(setTimeout(tick, opts.initial ?? 0));
    return () => { cancelled = true; timers.forEach(clearTimeout); };
  };

  // ---------------------------------------------------------------------------
  // revealByDataStep(el, step)
  // Toggle a `.shown` class on `[data-step="n"]` elements where n <= step.
  // Designed to be passed directly as a slide's `onStep` for trivial reveals.
  // ---------------------------------------------------------------------------
  Stage.revealByDataStep = function (el, step) {
    el.querySelectorAll('[data-step]').forEach(n => {
      n.classList.toggle('shown', Number(n.dataset.step) <= step);
    });
  };

  // ---------------------------------------------------------------------------
  // blinkCaret(el)
  // Attach a blinking caret to an element. CSS does the visual; this returns a
  // cleanup that removes the caret span if you need it.
  // ---------------------------------------------------------------------------
  Stage.blinkCaret = function (el) {
    const c = document.createElement('span');
    c.className = 'caret';
    el.appendChild(c);
    return () => c.remove();
  };

  // ---------------------------------------------------------------------------
  // sessionElapsedClock(opts)
  // Live MM:SS / H:MM:SS clock that ticks every second. Returns the element
  // plus a stop() function.
  // ---------------------------------------------------------------------------
  Stage.sessionElapsedClock = function (opts = {}) {
    const start = opts.start ?? Date.now();
    const el = document.createElement('span');
    el.className = 'session-clock';
    function format(ms) {
      const total = Math.floor(ms / 1000);
      const h = Math.floor(total / 3600);
      const m = Math.floor((total % 3600) / 60);
      const s = total % 60;
      const pad = n => String(n).padStart(2, '0');
      return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
    }
    function tick() { el.textContent = format(Date.now() - start); }
    tick();
    const id = setInterval(tick, 1000);
    return { el, stop: () => clearInterval(id) };
  };

  // ---------------------------------------------------------------------------
  // assignStageKeys(root)
  // Walk a rendered element subtree, assigning `data-stage-key` to every
  // element via a depth-indexed path (e.g. "0", "0.1", "0.1.2").
  // Skipped for elements that already have a key (semantic override).
  // Used by edit mode for element-pin annotations.
  // ---------------------------------------------------------------------------
  Stage.assignStageKeys = function (root) {
    function walk(node, prefix) {
      Array.from(node.children).forEach((child, i) => {
        const key = prefix ? `${prefix}.${i}` : String(i);
        if (!child.dataset.stageKey) child.dataset.stageKey = key;
        walk(child, key);
      });
    }
    walk(root, '');
  };

})(typeof window !== 'undefined' ? window : globalThis);
