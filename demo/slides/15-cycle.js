'use strict';

Stage.register(Stage.Cycle({
  section: 4,
  title: '04 · Cycle',
  items: [
    { label: 'You write',     icon: 'edit_note' },
    { label: 'You annotate',  icon: 'bookmark_added' },
    { label: 'Agent edits',   icon: 'auto_fix_high' },
    { label: 'Browser reloads', icon: 'refresh' }
  ],
  reveal: 'rotate'
}), {
  notes: 'The Cycle component — circular arrangement with curved arrows. Tells the agent-loop story visually.'
});
