'use strict';

/**
 * The mission, in three numbers.
 */
Stage.register(Stage.Stats({
  section: 7,
  title: '06 · The mission',
  columns: 3,
  blocks: [
    { number: 47.5,    unit: ' lb',     label: 'lunar samples returned',  color: 'accent' },
    { number: 21,      unit: 'h 36m',   label: 'on the surface',          color: 'fg'     },
    { number: 195,     unit: 'h 18m',   label: 'total mission duration',  color: 'accent' }
  ]
}), {
  notes: [
    '47.5 pounds (21.55 kg) of lunar samples were returned to Earth and distributed to laboratories around the world. Tiny vials are still sealed today, awaiting techniques not yet invented.',
    '21h 36m on the lunar surface — Eagle was on the Moon from 20 July 20:17 UTC to 21 July 17:54 UTC. Armstrong and Aldrin were outside the LM for 2h 31m during the EVA.',
    '195h 18m total mission duration — from liftoff at Kennedy on 16 July to splashdown in the Pacific on 24 July. Eight days and seventeen hours.'
  ].join(' ')
});
