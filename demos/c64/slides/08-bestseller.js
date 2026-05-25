'use strict';

Stage.register(Stage.KineticText({
  section: 4,
  title: '04 · Best-seller',
  pace: 900,
  lines: [
    { text: 'Best-selling computer of all time.',   color: 'accent'                },
    { text: '12.5 to 17 million units shipped.',    color: 'fg',     pause: 400    },
    { text: '(Nobody knows the exact number.)',     color: 'dim',    pause: 600    }
  ]
}), {
  notes: 'Commodore was famously chaotic about record-keeping — the 12.5M figure comes from Commodore itself, 17M is the upper estimate, and the truth is somewhere in between. Either way: nothing has touched it since.'
});
