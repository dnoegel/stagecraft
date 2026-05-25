'use strict';

/**
 * 12 · "Goodbye Tokyo." / "Until next April." — final kinetic beat.
 *
 * Slow pacing on purpose so each line lands.
 */
Stage.register(Stage.KineticText({
  section: 6,
  title: 'goodbye',
  pace: 1100,
  lines: [
    { text: 'Goodbye Tokyo.',          color: 'fg',    pause: 200 },
    { text: 'Until next April.',       color: 'accent', pause: 600 },
    { text: 'see you soon',            color: 'amber',  pause: 800 }
  ]
}), {
  notes: 'Long pace (1100ms). The handwritten "see you soon" is the only one in Caveat — it should feel like a postscript scribbled at the bottom of a letter.'
});
