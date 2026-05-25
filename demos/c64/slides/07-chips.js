'use strict';

Stage.register(Stage.Pillars({
  section: 3,
  title: '03 · Three chips',
  intro: 'A whole generation grew up on this trio:',
  pillars: [
    {
      icon: 'graphic_eq',
      heading: 'SID 6581',
      body: '3-voice synthesizer with filters, ring-mod, and envelopes. Bob Yannes built a synth and put it in a home computer.'
    },
    {
      icon: 'monitor',
      heading: 'VIC-II',
      body: '320x200 pixels, 16 colors, 8 hardware sprites, raster interrupts. The reason a $595 machine had arcade-quality graphics.'
    },
    {
      icon: 'memory',
      heading: '6510 CPU',
      body: 'MOS 6502 with a bank-switching I/O port. Around one million instructions per second. Just enough — and exactly the right kind of "just enough."'
    }
  ],
  reveal: 'staggered'
}), {
  notes: 'SID is the legend — chiptune as a genre exists because of this chip. VIC-II made sprites cheap. The 6510 is a 6502 with a memory-mapping trick that let BASIC and the kernel share the address space. Three chips. One revolution.'
});
