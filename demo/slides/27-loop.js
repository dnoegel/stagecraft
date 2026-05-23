'use strict';

Stage.register(Stage.ProcessFlow({
  section: 5,
  title: '05 · The collaboration loop',
  orientation: 'horizontal',
  steps: [
    { icon: 'edit_note',     label: 'You annotate', body: '@note: tighten this' },
    { icon: 'description',   label: 'Saved to source', body: 'as a JS comment' },
    { icon: 'auto_fix_high', label: 'Agent processes', body: 'reads + edits + deletes', color: 'accent' },
    { icon: 'refresh',       label: 'Hot reload', body: 'browser updates' }
  ],
  reveal: 'per-click'
}), {
  notes: 'The unique loop. Annotations live as @note: comments inside slide files. Agents grep, read, fix, delete. Absence of notes means everything has been addressed.'
});
