'use strict';

Stage.register(Stage.Timeline({
  section: 4,
  title: '04 · Timeline',
  orientation: 'horizontal',
  events: [
    { date: 'Day 1',  heading: 'Spec',       icon: 'edit_note',     color: 'accent' },
    { date: 'Day 1',  heading: 'Engine',     icon: 'memory' },
    { date: 'Day 2',  heading: '50 comps',   icon: 'dashboard',     color: 'accent' },
    { date: 'Day 2',  heading: 'Edit mode',  icon: 'edit_square' },
    { date: 'Day 2',  heading: 'Multi-mon',  icon: 'cast',          color: 'accent' }
  ],
  reveal: 'per-click'
}), {
  notes: 'Timeline component. Use ←/→ to reveal milestones one at a time. The active milestone is filled with accent.'
});
