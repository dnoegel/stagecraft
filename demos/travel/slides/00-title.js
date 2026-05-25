'use strict';

/**
 * 00 · Title — "Tokyo. April 2026. Seven days."
 *
 * Three serif lines, then a final handwritten Caveat beat ("a diary").
 * The 'amber' color class is repurposed by the diary theme as the
 * handwritten Caveat treatment.
 */
Stage.register(Stage.KineticText({
  section: 1,
  title: 'Tokyo · April 2026',
  pace: 900,
  lines: [
    { text: 'Tokyo.',          color: 'fg' },
    { text: 'April 2026.',     color: 'dim',    pause: 200 },
    { text: 'Seven days.',     color: 'accent', pause: 400 },
    { text: 'a diary',         color: 'amber',  pause: 700 }
  ]
}), {
  notes: 'Hold the silence after each beat. The audience is still settling in — let the page breathe like a real diary cover. The handwritten "a diary" lands the tone for the whole deck.'
});
