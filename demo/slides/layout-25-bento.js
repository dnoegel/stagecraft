'use strict';

Stage.register(Stage.Bento({
  section: 25,
  title: '25 · Bento',
  cells: [
    { span: 2, heading: 'Agents',  body: 'Long-running, async, tool-using. They think while you sleep.', color: 'accent' },
    {          heading: 'Reviews', body: 'The human stays in the loop.' },
    {          heading: 'Evals',   body: 'Measure twice. Ship once.',              color: 'amber' },
    {          heading: 'Specs',   image: { src: 'https://picsum.photos/seed/bento-specs/800/600' } },
    {          heading: 'Notes',   body: 'Cheap, persistent context.',             color: 'blue' },
    { span: 2, heading: 'Taste',   body: 'The scarce part. Still yours.' }
  ]
}));
