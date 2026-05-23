'use strict';

Stage.register(Stage.Pillars({
  section: 7,
  title: '07 · Five themes',
  pillars: [
    { icon: 'wb_iridescent',  heading: 'Phosphor', body: 'cinematic dark · green', color: 'accent' },
    { icon: 'menu_book',      heading: 'Paper',    body: 'academic light · navy' },
    { icon: 'bolt',           heading: 'Neon',     body: 'cyberpunk · magenta + cyan', color: 'amber' },
    { icon: 'business',       heading: 'Brand',    body: 'corporate · blue' },
    { icon: 'storefront',     heading: 'Shopware', body: 'official · Meteor tokens', color: 'accent' }
  ],
  reveal: 'staggered'
}), {
  notes: 'Switch between them live from the storyboard toolbar in edit mode. The Shopware theme uses Shopwares official Meteor design tokens — Inter, brand-blue #0870ff, and the full semantic palette.'
});
