'use strict';

Stage.register(Stage.CodeBlock({
  section: 4,
  title: '04 · CodeBlock',
  language: 'javascript',
  fileName: 'slides/06-step-model.js',
  code: `Stage.register({
  section: 2,
  title: 'reveal each',
  steps: 3,
  render(el) {
    el.innerHTML = \`
      <ul>
        <li data-step="1">First insight</li>
        <li data-step="2">Second insight</li>
        <li data-step="3">Third insight</li>
      </ul>\`;
  },
  onStep: Stage.revealByDataStep
});`,
  reveal: 'typewriter',
  highlight: [4, 12]
}), {
  notes: 'CodeBlock with typewriter reveal — characters land one by one. Use this when the code IS the message.'
});
