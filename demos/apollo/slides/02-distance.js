'use strict';

/**
 * The scale of the mission, in three numbers.
 */
Stage.register(Stage.Stats({
  section: 1,
  title: '01 · The scale',
  columns: 3,
  blocks: [
    { number: 238855, unit: ' mi', label: 'avg. distance to the Moon',   color: 'accent' },
    { number: 4,      unit: ' d',  label: 'one-way coast',               color: 'fg'     },
    { number: 7.6,    unit: 'M lbf', label: 'Saturn V first-stage thrust', color: 'accent' }
  ]
}), {
  notes: [
    '238,855 miles — about 384,400 km — the average Earth-Moon distance. Apollo 11 covered that in roughly three days (translunar coast was ~76 hours).',
    'The Saturn V first stage (S-IC) developed 7.6 million pounds of thrust from five F-1 engines. To this day the most powerful operational rocket ever flown, tied with NASA SLS Block 1B figures and exceeded only briefly by SpaceX Starship.',
    'Let the numbers breathe. Read each one aloud — the audience needs the contrast between "Moon" as an abstract idea and "238,855 miles" as a measurement.'
  ].join(' ')
});
