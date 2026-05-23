'use strict';

Stage.register(Stage.Progress({
  section: 4,
  title: '04 · Progress',
  items: [
    { label: 'Engine',         value: 100 },
    { label: 'Components',     value: 100 },
    { label: 'Themes',         value: 100, color: 'accent' },
    { label: 'Edit mode',      value: 100 },
    { label: 'Presenter view', value: 100 },
    { label: 'PDF export',     value: 100, color: 'amber' },
    { label: 'Pure happiness', value: 95,  color: 'accent' }
  ],
  reveal: 'animated'
}), {
  notes: 'Stacked progress bars. Each fills from 0 to value on entry. Great for status updates.'
});
