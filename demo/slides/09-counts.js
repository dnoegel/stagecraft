'use strict';

Stage.register(Stage.Stats({
  section: 3,
  title: '03 · The 7 families',
  columns: 4,
  blocks: [
    { number: 6,  label: 'Core',     color: 'accent' },
    { number: 6,  label: 'Layout',   color: 'blue'   },
    { number: 5,  label: 'Diagram',  color: 'amber'  },
    { number: 5,  label: 'Chart',    color: 'accent' },
    { number: 10, label: 'Data-viz', color: 'blue'   },
    { number: 10, label: 'Business', color: 'amber'  },
    { number: 8,  label: 'Content',  color: 'accent' },
    { number: 5,  label: 'Cookbook', color: 'red'    }
  ]
}), {
  notes: 'Counts so far. The split is intentionally weighted — Core, Layout, and Content are the workhorses. Diagrams and Charts come out when the message is structural or quantitative.'
});
