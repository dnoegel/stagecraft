'use strict';

Stage.register(Stage.Timeline({
  section: 31,
  title: '31 · Timeline',
  orientation: 'horizontal',
  events: [
    { date: '2021', heading: 'Copilot',  body: 'autocomplete arrives', icon: 'auto_awesome', color: 'blue'   },
    { date: '2022', heading: 'ChatGPT',  body: 'conversation lands',   icon: 'chat',         color: 'amber'  },
    { date: '2024', heading: 'Agents',   body: 'autonomy unlocks',     icon: 'memory',       color: 'accent' },
    { date: '2026', heading: 'Now',      body: 'the loop reshapes',    icon: 'all_inclusive',color: 'accent' }
  ],
  reveal: 'per-click'
}));
