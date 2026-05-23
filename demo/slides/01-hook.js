'use strict';

Stage.register(Stage.KineticText({
  section: 1,
  title: '01 · The hook',
  pace: 800,
  lines: [
    { text: 'Agents now write your slides.',                  color: 'fg' },
    { text: 'But agent-written slides',                        color: 'dim',  pause: 300 },
    { text: 'look like agent-written slides.',                color: 'amber', pause: 200 },
    { text: 'Stagecraft is the fix.',                         color: 'accent', pause: 500 }
  ]
}), {
  notes: 'The setup-punchline rhythm. Most generic slide libraries produce generic-looking decks. Stagecraft is built on the opposite premise.'
});
