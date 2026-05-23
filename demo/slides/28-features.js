'use strict';

Stage.register(Stage.Pillars({
  section: 5,
  title: '05 · What edit mode unlocks',
  pillars: [
    { icon: 'drag_indicator',  heading: 'Reorder',     body: 'drag tiles in the storyboard',  color: 'accent' },
    { icon: 'edit',            heading: 'Inline edit', body: 'click any text → AST roundtrip' },
    { icon: 'comment',         heading: 'Annotate',    body: 'shift-click to pin a note on an element' },
    { icon: 'animation',       heading: 'Transitions', body: 'click between tiles, hover to preview' }
  ],
  reveal: 'staggered'
}), {
  notes: 'Four affordances. Each writes back to the source files via the dev server. Plus add slides, delete slides, switch themes, and edit speaker notes.'
});
