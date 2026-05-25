'use strict';

/**
 * Manifesto-style declarations — three lines that articulate the legacy.
 */
Stage.register(Stage.Manifesto({
  section: 8,
  title: '07 · Legacy',
  intro: 'We chose to go because—',
  declarations: [
    { text: 'It was the hardest thing we knew how to do.',         emphasis: ['hardest'] },
    { text: 'We believed it was possible before it was possible.', emphasis: ['believed', 'possible'] },
    { text: 'Now we know what 400,000 humans can do together.',    emphasis: ['400,000', 'together'] }
  ],
  reveal: 'per-click'
}), {
  notes: [
    'Three declarations, revealed per-click. Use clicks deliberately — say each line out loud yourself, then click.',
    '"400,000 humans": the Apollo program at its peak employed approximately 400,000 people across NASA, contractors, and subcontractors. Grumman built the LM. North American Aviation built the CSM. Boeing built the Saturn V first stage. IBM built the instrument unit. MIT wrote the software. Heat shields from Avco. Suits from ILC Dover. The list is enormous.',
    'The point of this slide: the moonshot was not the work of two men in spacesuits. It was the work of an entire civilization deciding to do one thing well.'
  ].join(' ')
});
