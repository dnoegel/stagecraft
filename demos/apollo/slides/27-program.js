'use strict';

/**
 * Timeline of the Apollo lunar landing program. Six landings, one near-disaster.
 */
Stage.register(Stage.Timeline({
  section: 8,
  title: '07 · The program',
  orientation: 'horizontal',
  reveal: 'staggered',
  events: [
    { date: 'Jul 1969', heading: 'Apollo 11',  icon: 'rocket_launch', color: 'accent' },
    { date: 'Nov 1969', heading: 'Apollo 12',  icon: 'rocket_launch'                  },
    { date: 'Apr 1970', heading: 'Apollo 13',  icon: 'error'                          },
    { date: 'Jan 1971', heading: 'Apollo 14',  icon: 'rocket_launch'                  },
    { date: 'Jul 1971', heading: 'Apollo 15',  icon: 'rocket_launch'                  },
    { date: 'Apr 1972', heading: 'Apollo 16',  icon: 'rocket_launch'                  },
    { date: 'Dec 1972', heading: 'Apollo 17',  icon: 'rocket_launch', color: 'accent' }
  ]
}), {
  notes: [
    'Six successful crewed landings over 41 months. Apollo 13 (April 1970) was aborted after an oxygen tank rupture en route; the crew used the LM as a lifeboat and returned safely. Apollo 7, 8, 9, 10 were the earlier crewed test missions; 7 and 9 in Earth orbit, 8 and 10 lunar orbit.',
    'Apollo 12 (Conrad, Bean, Gordon) landed in November 1969, four months after Apollo 11. They visited the Surveyor 3 probe and returned parts of it.',
    'Apollo 14 (Shepard, Roosa, Mitchell) — Shepard was the first American in space (Freedom 7, 1961). He played golf on the Moon.',
    'Apollo 15, 16, 17 carried the Lunar Roving Vehicle. Apollo 17 (Cernan, Schmitt, Evans) was the last — Cernan was the last human to walk on the Moon as of 2026.',
    'Apollo 18, 19, 20 were planned and cancelled in 1970 for budget reasons. The Saturn Vs they would have flown ended up as museum exhibits.'
  ].join(' ')
});
