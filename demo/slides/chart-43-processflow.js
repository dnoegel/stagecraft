'use strict';

Stage.register(Stage.ProcessFlow({
  section: 3,
  title: '03 · the loop',
  orientation: 'horizontal',
  steps: [
    { icon: 'edit_note',     label: 'Draft',  body: 'frame the intent',  color: 'accent' },
    { icon: 'visibility',    label: 'Review', body: 'read the diff',     color: 'blue'   },
    { icon: 'science',       label: 'Verify', body: 'run the evidence',  color: 'amber'  },
    { icon: 'rocket_launch', label: 'Ship',   body: 'land the change'                    }
  ],
  reveal: 'per-click'
}));
