'use strict';

Stage.register(Stage.Stats({
  section: 2,
  title: '02 · The specs',
  columns: 4,
  blocks: [
    { number: 1.0,   unit: ' MHz', label: 'cpu',     color: 'accent' },
    { number: 64,    unit: ' KB',  label: 'ram',     color: 'fg'     },
    { number: 16,    unit: '',     label: 'colors',  color: 'accent' },
    { number: 8,     unit: '',     label: 'sprites', color: 'fg'     }
  ]
}), {
  notes: '1 MHz. 64 kilobytes. 16 colors. 8 hardware sprites. Read those numbers slowly — every one of them sounds like a joke today, and yet this machine outsold every computer that came before or after.'
});
