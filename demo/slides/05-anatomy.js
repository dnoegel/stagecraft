'use strict';

Stage.register(Stage.CodeBlock({
  section: 2,
  title: '02 · A slide is a file',
  language: 'javascript',
  fileName: 'slides/02-thesis.js',
  code: `Stage.register(Stage.Statement({
  section: 1,
  text: 'A drawing board for creative directors.',
  emphasis: ['drawing board']
}), {
  notes: 'Land the punch on "drawing board".'
});`,
  reveal: 'typewriter'
}), {
  notes: 'Every slide is a tiny JS file that calls Stage.register. The first argument is the slide; the second is metadata like speaker notes. The factory functions (Stage.Statement, Stage.KineticText, etc.) save you boilerplate.'
});
