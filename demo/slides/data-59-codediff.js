'use strict';

Stage.register(Stage.CodeDiff({
  section: 59,
  title: '59 · CodeDiff',
  fileName: 'src/server.ts',
  language: 'typescript',
  lines: [
    { type: 'context', text: 'export function handle(req: Request) {' },
    { type: 'context', text: '  const id = req.headers.get("x-id");' },
    { type: 'remove',  text: '  const body = JSON.parse(req.body);' },
    { type: 'remove',  text: '  return processSync(id, body);' },
    { type: 'add',     text: '  const body = safeParse(req.body);' },
    { type: 'add',     text: '  if (!body.ok) return error(400, body.reason);' },
    { type: 'add',     text: '  return await processAsync(id, body.value);' },
    { type: 'context', text: '}' }
  ],
  reveal: 'staggered'
}));
