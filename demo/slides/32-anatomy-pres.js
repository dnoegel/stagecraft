'use strict';

Stage.register(Stage.Pillars({
  section: 6,
  title: '06 · Presenter view',
  pillars: [
    { icon: 'tv',            heading: 'Current slide', body: 'live, animations playing' },
    { icon: 'skip_next',     heading: 'Next slide',    body: 'static thumbnail' },
    { icon: 'notes',         heading: 'Speaker notes', body: 'your private cue card', color: 'accent' },
    { icon: 'timer',         heading: 'Timer + clock', body: 'elapsed talk time + wall time' }
  ],
  reveal: 'staggered'
}), {
  notes: 'The four panes of the presenter window. Notes are the prop the audience never sees.'
});
