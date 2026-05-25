'use strict';

/**
 * The AGC by the numbers — mind-blowing contrast with anything in your pocket.
 */
Stage.register(Stage.Stats({
  section: 5,
  title: '04 · The computer',
  columns: 4,
  blocks: [
    { number: 4,        unit: ' KB',  label: 'erasable memory (RAM)', color: 'accent' },
    { number: 72,       unit: ' KB',  label: 'rope core ROM',         color: 'fg'     },
    { number: 2.048,    unit: ' MHz', label: 'clock',                 color: 'accent' },
    { number: 145000,   unit: '',     label: 'lines of code',         color: 'fg'     }
  ]
}), {
  notes: [
    'The Apollo Guidance Computer (AGC) was custom-built at MIT\'s Instrumentation Laboratory under Charles Stark Draper and Margaret Hamilton.',
    '4 KB of erasable core memory. 72 KB of read-only "rope core" — copper wires woven through tiny ferrite cores by hand at Raytheon. "Little Old Lady Memory," they called it.',
    '2.048 MHz clock. ~145,000 lines of code total (Luminary + Colossus).',
    'For context: an Apple Watch is roughly 100,000 times faster and has 100,000 times the storage. A modern smartphone is in another universe entirely. And yet — that AGC put two humans on the Moon and brought them home.',
    'Margaret Hamilton was 32 years old when Apollo 11 launched. The photo of her standing next to a printout of her code, taller than she is, is one of the most-shared engineering images of all time.'
  ].join(' ')
});
