'use strict';

Stage.register(Stage.KineticText({
  section: 1,
  title: '01 · Stagecraft',
  pace: 700,
  lines: [
    { text: 'Stagecraft.',                       color: 'fg' },
    { text: 'Reveal.js',                          color: 'dim' },
    { text: 'reimagined for the LLM era.',       color: 'accent', pause: 500 }
  ]
}), {
  notes: 'Open with the title slide. Pause briefly on each line so the audience reads them as you say them. The accent line lands the thesis: this is reveal.js, but built for an era where agents author slides.'
});
