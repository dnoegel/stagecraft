'use strict';

Stage.register(Stage.ActivityList({
  section: 5,
  title: '04 · Five that stuck',
  items: [
    { num: '01', name: 'Maniac Mansion',     desc: 'LucasArts before LucasArts. The first SCUMM game. Cousin Ted is in the fridge.' },
    { num: '02', name: 'Boulder Dash',       desc: 'Rockford, diamonds, falling rocks. A puzzle game that taught a generation what an "algorithm" feels like.' },
    { num: "03", name: "Ghosts 'n Goblins",  desc: 'Capcom’s sadism in 6510 assembly. You died in your underpants and started over. Repeatedly.' },
    { num: '04', name: 'Impossible Mission', desc: 'Eight sprites stacked into a single agent. Digitized speech: "Destroy him, my robots!"' },
    { num: '05', name: 'Wizball',            desc: 'Sensible Software at peak weird. Bouncing ball, prismatic palette, SID music carrying the whole thing.' }
  ],
  reveal: 'staggered'
}), {
  notes: 'Pick whichever of these you have a personal memory of and tell that story instead. The list is just a prompt — the magic is the audience nodding along to "Cousin Ted is in the fridge."'
});
