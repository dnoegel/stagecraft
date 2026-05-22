'use strict';

/**
 * Stagecraft — Built-in transitions library.
 *
 * Six transitions: cut, fade, slide, dissolve, glitch, wipe.
 * Themes can override or extend via Stage.registerTransition(name, config).
 *
 * Each transition has optional enter(el) and exit(el) hooks. CSS classes
 * named `tx-<name>-enter` and `tx-<name>-exit` are added/removed; themes
 * provide the actual visual via CSS.
 */

(function (root) {
  const Stage = root.Stage = root.Stage || {};

  function classToggle(el, cls, ms = 800) {
    el.classList.add(cls);
    setTimeout(() => el.classList.remove(cls), ms);
  }

  Stage.registerTransition('cut', {
    enter(el) { /* no-op, instant */ },
    exit(el) { /* no-op */ }
  });

  Stage.registerTransition('fade', {
    enter(el) { classToggle(el, 'tx-fade-enter', 700); },
    exit(el) { classToggle(el, 'tx-fade-exit', 400); }
  });

  Stage.registerTransition('slide', {
    enter(el) { classToggle(el, 'tx-slide-enter', 700); },
    exit(el) { classToggle(el, 'tx-slide-exit', 500); }
  });

  Stage.registerTransition('dissolve', {
    enter(el) { classToggle(el, 'tx-dissolve-enter', 1200); },
    exit(el) { classToggle(el, 'tx-dissolve-exit', 1000); }
  });

  // Glitch: a brief scanline + RGB-shift overlay, then settle.
  Stage.registerTransition('glitch', {
    enter(el) {
      classToggle(el, 'tx-glitch-enter', 600);
      const overlay = document.createElement('div');
      overlay.className = 'tx-glitch-overlay';
      el.appendChild(overlay);
      setTimeout(() => overlay.remove(), 600);
    },
    exit(el) { classToggle(el, 'tx-glitch-exit', 200); }
  });

  Stage.registerTransition('wipe', {
    enter(el) { classToggle(el, 'tx-wipe-enter', 800); },
    exit(el) { classToggle(el, 'tx-wipe-exit', 500); }
  });

})(typeof window !== 'undefined' ? window : globalThis);
