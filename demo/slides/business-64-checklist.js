'use strict';

Stage.register(Stage.Checklist({
  section: 64,
  title: '64 · Pre-launch',
  items: [
    { text: 'Specs reviewed',     done: true },
    { text: 'CI green on main',   done: true,  body: 'all jobs passing for 48h' },
    { text: 'Staging deploy verified', done: true },
    { text: 'Docs updated' },
    { text: 'Comms drafted',      body: 'blog post, changelog, social' },
    { text: 'On-call briefed' }
  ],
  reveal: 'staggered'
}));
