'use strict';

Stage.register(Stage.Marquee({
  section: 4,
  title: '04 · Marquee',
  items: [
    'engine',
    'helpers',
    'transitions',
    'components',
    'examples',
    'edit-mode',
    'presenter-view',
    'pdf-export',
    'visual-tests',
    'multi-theme'
  ],
  direction: 'left',
  speed: 'medium',
  double: true
}), {
  notes: 'Pure-CSS scrolling ticker. The items duplicate so the loop is seamless. Pauses on hover. Use for ambient context or to dramatise a long list without filling vertical space.'
});
