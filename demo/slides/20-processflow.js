'use strict';

Stage.register(Stage.ProcessFlow({
  section: 4,
  title: '04 · ProcessFlow',
  orientation: 'horizontal',
  steps: [
    { icon: 'edit_note',         label: 'Author',  body: 'You write the deck' },
    { icon: 'edit_square',       label: 'Annotate', body: 'Notes for the agent' },
    { icon: 'auto_fix_high',     label: 'Process', body: 'Agent reads + edits', color: 'accent' },
    { icon: 'check_circle',      label: 'Ship',    body: 'Browser reloads' }
  ],
  reveal: 'per-click'
}), {
  notes: 'N steps joined by arrows. Per-click pulses the next arrow as you walk through the flow.'
});
