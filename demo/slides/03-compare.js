'use strict';

Stage.register(Stage.Compare({
  section: 2,
  title: '02 · Old vs. New',
  left:  { heading: 'BEFORE', items: ['type', 'compile', 'debug', 'ship'], style: 'strikethrough' },
  right: { heading: 'AFTER',  items: ['describe', 'review', 'verify', 'ship'], style: 'accent' },
  reveal: 'staggered'
}));
