'use strict';

Stage.register(Stage.Steps({
  section: 65,
  title: '65 · How it works',
  orientation: 'horizontal',
  steps: [
    { number: '01', label: 'Install',  body: 'Run npx stagecraft init in your repo.',            icon: 'download' },
    { number: '02', label: 'Write',    body: 'Drop slide files into the slides/ directory.',     icon: 'edit_note' },
    { number: '03', label: 'Present',  body: 'Open the deck in any modern browser. No build.',   icon: 'present_to_all' }
  ],
  reveal: 'staggered'
}));
