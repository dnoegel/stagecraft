'use strict';

Stage.register(Stage.Venn({
  section: 7,
  title: '07 · the overlap',
  sets: [
    { label: 'Knows',  color: 'accent' },
    { label: 'Cares',  color: 'amber'  },
    { label: 'Does',   color: 'blue'   }
  ],
  overlaps: [
    { ids: [0, 1],    label: 'opinions'  },
    { ids: [0, 2],    label: 'execution' },
    { ids: [1, 2],    label: 'effort'    },
    { ids: [0, 1, 2], label: 'the work'  }
  ],
  reveal: 'staggered'
}));
