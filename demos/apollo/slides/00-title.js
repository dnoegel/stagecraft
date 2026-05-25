'use strict';

/**
 * Cold open. Three lines, three beats. Apollo 11 · 1969 · One small step.
 * KineticText with a slow pace — let each line sit and weight the silence.
 */
Stage.register(Stage.KineticText({
  section: 1,
  title: '01 · Apollo 11',
  pace: 1200,
  lines: [
    { text: 'Apollo 11.',           color: 'fg'                  },
    { text: '1969.',                color: 'dim',    pause: 700  },
    { text: 'One small step.',      color: 'accent', pause: 900  }
  ]
}), {
  notes: [
    'Open in near-silence. Three lines, three slow beats — almost twelve seconds of total dwell time.',
    'Pause hard after the second line ("1969.") — the audience should feel the date land.',
    'The third line is the title of the talk and also the punchline of human history. Let it sit a full beat before clicking on.',
    'Mission: Apollo 11 launched 16 July 1969, landed on the Moon 20 July, returned 24 July. Crew: Armstrong, Aldrin, Collins.'
  ].join(' ')
});
