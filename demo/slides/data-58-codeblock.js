'use strict';

Stage.register(Stage.CodeBlock({
  section: 58,
  title: '58 · CodeBlock',
  fileName: 'src/agent.ts',
  language: 'typescript',
  code: [
    'export async function agent(input: string) {',
    '  let state = { input, log: [] };',
    '  while (!done(state)) {',
    '    const step = await plan(state);',
    '    state = await execute(state, step);',
    '  }',
    '  return state.output;',
    '}'
  ].join('\n'),
  highlight: [4, 5],
  reveal: 'typewriter'
}));
