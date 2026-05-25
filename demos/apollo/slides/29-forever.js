'use strict';

/**
 * Closing — mirror of the cold open. Three lines, slow.
 */
Stage.register(Stage.KineticText({
  section: 8,
  title: '08 · Forever',
  pace: 1400,
  lines: [
    { text: 'Apollo 11.',     color: 'fg'                  },
    { text: '1969.',          color: 'dim',    pause: 700 },
    { text: 'Forever.',       color: 'accent', pause: 1200 }
  ]
}), {
  notes: [
    'Close the deck the way you opened it. Same first two lines, different last.',
    'The footprints are still there. The atmosphere-less Moon does not erase them. Barring impact or future activity, Aldrin\'s bootprint will outlast any structure on Earth.',
    'Hold the final slide. Let the audience clap before you click away.',
    'Thank you.'
  ].join(' ')
});
