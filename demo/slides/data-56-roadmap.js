'use strict';

Stage.register(Stage.Roadmap({
  section: 56,
  title: '56 · Roadmap',
  months: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
  lanes: [
    { label: 'Platform', color: 'accent', bars: [
      { start: 0,  end: 3,  label: 'rewrite core' },
      { start: 4,  end: 7,  label: 'observability' },
      { start: 8,  end: 11, label: 'scale-out' }
    ]},
    { label: 'Product',  color: 'blue', bars: [
      { start: 2,  end: 6,  label: 'collab editor' },
      { start: 7,  end: 10, label: 'agentic UX' }
    ]},
    { label: 'Growth',   color: 'amber', bars: [
      { start: 1,  end: 4,  label: 'self-serve' },
      { start: 5,  end: 9,  label: 'partner network' }
    ]},
    { label: 'Risk',     color: 'red', bars: [
      { start: 0,  end: 12, label: 'compliance program' }
    ]}
  ],
  reveal: 'staggered'
}));
