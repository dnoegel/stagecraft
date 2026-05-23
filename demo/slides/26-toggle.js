'use strict';

Stage.register(Stage.KineticText({
  section: 5,
  title: '05 · Run the server',
  pace: 700,
  lines: [
    { text: 'npx stagecraft serve',         color: 'accent' },
    { text: 'Browser unlocks editing.',     color: 'fg' },
    { text: 'Press E to toggle off.',       color: 'dim', pause: 400 }
  ]
}), {
  notes: 'One command. The browser detects the dev server via WebSocket and turns on all the affordances. E toggles edit-mode on/off without disconnecting, so you can present with the server running.'
});
