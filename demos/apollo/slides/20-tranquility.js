'use strict';

/**
 * The historic words. KineticText, paced like real radio call-and-response.
 */
Stage.register(Stage.KineticText({
  section: 5,
  title: '04 · Tranquility',
  pace: 1600,
  lines: [
    { text: 'Houston, Tranquility Base here.', color: 'fg',                 },
    { text: 'The Eagle has landed.',           color: 'accent', pause: 600 }
  ]
}), {
  notes: [
    'Armstrong, 20 July 1969, 20:17:40 UTC. The first sentence ever spoken from the surface of another world.',
    'Note "Tranquility Base" — Armstrong\'s improvised callsign that morning. It was not pre-planned; he wanted to mark the location with a name.',
    'Charlie Duke, CAPCOM, replied: "Roger, Twank— Tranquility, we copy you on the ground. You\'ve got a bunch of guys about to turn blue. We\'re breathing again."',
    'Pacing: 1600ms is slow on purpose. Let the first line sit. The second is the punchline of the century.'
  ].join(' ')
});
