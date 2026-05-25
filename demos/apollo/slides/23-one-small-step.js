'use strict';

/**
 * "That's one small step for [a] man, one giant leap for mankind."
 * KineticText, very slow. The accent line is the second.
 */
Stage.register(Stage.KineticText({
  section: 6,
  title: '05 · One small step',
  pace: 1800,
  lines: [
    { text: "That's one small step for a man,", color: 'fg',                  },
    { text: 'one giant leap for mankind.',       color: 'accent', pause: 800 }
  ]
}), {
  notes: [
    'Neil Armstrong, stepping off the LM ladder, 02:56:15 UTC on 21 July 1969 (UTC) — 22:56:15 EDT on 20 July at home.',
    'Armstrong always maintained he said "a man" — the missing "a" is widely attributed to radio static or the analog tape\'s limitations. 2006 analysis by linguist John Olsson recovered the "a" via spectrographic analysis. The "a" matters: "one small step for man" is tautological with "mankind"; "one small step for a man" has the contrast Armstrong intended.',
    'Pace this slow. 1800ms between lines. Say the words yourself as the second line glows in. The accent on "giant leap" carries the room.'
  ].join(' ')
});
