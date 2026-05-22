'use strict';

Stage.register(Stage.KineticText({
  section: 1,
  title: '01 · Welcome',
  pace: 700,
  lines: [
    { text: 'A new deck.',         color: 'fg' },
    { text: 'Ready to be built.',  color: 'dim' },
    { text: 'Press → to begin.',   color: 'accent', pause: 600 }
  ]
}));
