'use strict';

Stage.register(Stage.Pillars({
  section: 7,
  title: '07 · Themes',
  pillars: [
    { icon: 'wb_iridescent',  heading: 'Phosphor', body: 'cinematic dark · green', color: 'accent' },
    { icon: 'menu_book',      heading: 'Paper',    body: 'academic light · navy' },
    { icon: 'bolt',           heading: 'Neon',     body: 'cyberpunk · magenta + cyan', color: 'amber' },
    { icon: 'business',       heading: 'Brand',    body: 'corporate · blue' }
  ],
  reveal: 'staggered'
}), {
  notes: 'Switch between them live from the storyboard toolbar in edit mode. Tokens, base, components, transitions per theme — pick the vibe that fits your talk.'
});
