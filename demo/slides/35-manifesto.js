'use strict';

Stage.register(Stage.Manifesto({
  section: 7,
  title: '07 · We believe',
  intro: 'We believe…',
  declarations: [
    { text: 'Decks should feel alive — animation is the language.',     emphasis: ['alive', 'animation'] },
    { text: 'Components are anchors, not cages.',                       emphasis: ['anchors', 'not cages'] },
    { text: 'The author and the agent share one source of truth.',      emphasis: ['one source of truth'] },
    { text: 'No build step. No framework. No magic.',                   emphasis: ['No build step'] }
  ],
  reveal: 'per-click'
}), {
  notes: 'Manifesto — numbered "we believe..." declarations. Per-click reveal lets each line land before the next. The emphasis spans pick up the accent color.'
});
