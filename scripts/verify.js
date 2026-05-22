#!/usr/bin/env node
'use strict';

/**
 * Stagecraft verification — smoke tests for the dev-server edit operations.
 *
 *   node scripts/verify.js
 *
 * Tests:
 *  - inline edit: change a string prop in a KineticText call, verify file rewrite
 *  - slide note: write & remove
 *  - element note: write
 *  - manifest reorder & transition
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import {
  writeSlideNote,
  writeElementNote,
  writeInlineEdit,
  reorderManifest,
  setManifestTransition
} from '../bin/lib/edit-ops.js';

const ROOT = path.resolve('/tmp/stagecraft-verify');
let pass = 0, fail = 0;

async function setup() {
  await fs.rm(ROOT, { recursive: true, force: true });
  await fs.mkdir(ROOT, { recursive: true });
  await fs.mkdir(path.join(ROOT, 'slides'));

  // A KineticText slide
  await fs.writeFile(path.join(ROOT, 'slides', '00-title.js'), `'use strict';

Stage.register(Stage.KineticText({
  section: 1,
  title: 'Original title',
  pace: 700,
  lines: [
    { text: 'first line', color: 'fg' },
    { text: 'second line', color: 'dim' },
    { text: 'third line', color: 'accent' }
  ]
}));
`);

  // A manifest
  await fs.writeFile(path.join(ROOT, 'stagecraft.config.js'), `'use strict';

Stage.deck({
  theme: 'phosphor',
  slides: [
    { src: 'slides/00-title.js' },
    { src: 'slides/01-second.js', transition: 'fade' },
    { src: 'slides/02-third.js' }
  ]
});
`);
}

function assert(name, cond, detail = '') {
  if (cond) { pass++; console.log(`  ✓ ${name}`); }
  else { fail++; console.log(`  ✗ ${name}${detail ? '\n     ' + detail : ''}`); }
}

async function testInlineEdit() {
  console.log('\n-- inline edit --');
  await writeInlineEdit(ROOT, 'slides/00-title.js', 'lines[1].text', 'second line REWRITTEN');
  const src = await fs.readFile(path.join(ROOT, 'slides', '00-title.js'), 'utf8');
  assert('replaces target string', src.includes('second line REWRITTEN'));
  assert('leaves other lines untouched', src.includes('first line') && src.includes('third line'));
  assert('preserves outer call shape', src.includes('Stage.register(Stage.KineticText('));
}

async function testInlineEditNested() {
  console.log('\n-- inline edit on top-level prop --');
  await writeInlineEdit(ROOT, 'slides/00-title.js', 'title', 'New title');
  const src = await fs.readFile(path.join(ROOT, 'slides', '00-title.js'), 'utf8');
  assert('replaces top-level string', src.includes("'New title'") || src.includes('"New title"'));
}

async function testInlineEditMissing() {
  console.log('\n-- inline edit on missing path --');
  try {
    await writeInlineEdit(ROOT, 'slides/00-title.js', 'doesNotExist.field', 'x');
    assert('rejects unknown path', false);
  } catch (e) {
    assert('rejects unknown path', /no matching/.test(e.message), e.message);
  }
}

async function testSlideNote() {
  console.log('\n-- slide note --');
  await writeSlideNote(ROOT, 'slides/00-title.js', 'this is a test note');
  let src = await fs.readFile(path.join(ROOT, 'slides', '00-title.js'), 'utf8');
  assert('adds @note: comment', /\/\/\s*@note:\s*this is a test note/.test(src));

  // Replace with new note: old one should be removed
  await writeSlideNote(ROOT, 'slides/00-title.js', 'updated note');
  src = await fs.readFile(path.join(ROOT, 'slides', '00-title.js'), 'utf8');
  assert('updates note (removes previous)', !src.includes('this is a test note'));
  assert('updated note present', /\/\/\s*@note:\s*updated note/.test(src));
}

async function testElementNote() {
  console.log('\n-- element-pin note --');
  await writeElementNote(ROOT, 'slides/00-title.js', 'KineticText/line[2]', 'too long');
  const src = await fs.readFile(path.join(ROOT, 'slides', '00-title.js'), 'utf8');
  assert('writes element note', /@note\[stage-key="KineticText\/line\[2\]"\]:\s*too long/.test(src));
}

async function testManifestReorder() {
  console.log('\n-- manifest reorder --');
  // move slide 2 → position 0
  await reorderManifest(ROOT, [2, 0, 1]);
  const src = await fs.readFile(path.join(ROOT, 'stagecraft.config.js'), 'utf8');
  const order = [...src.matchAll(/src:\s*['"](slides\/\d+-[^'"]+)['"]/g)].map(m => m[1]);
  assert('first slide is 02-third', order[0] === 'slides/02-third.js', order.join(' / '));
  assert('keeps 3 slides', order.length === 3);
}

async function testManifestTransition() {
  console.log('\n-- manifest transition --');
  await setManifestTransition(ROOT, 0, 'glitch');
  const src = await fs.readFile(path.join(ROOT, 'stagecraft.config.js'), 'utf8');
  // The first slide should now have transition: "glitch"
  assert('sets transition on first slide', /transition:\s*['"]glitch['"]/.test(src));
}

(async () => {
  console.log('=== stagecraft verify ===');
  await setup();
  await testInlineEdit();
  await testInlineEditNested();
  await testInlineEditMissing();
  await testSlideNote();
  await testElementNote();
  await testManifestReorder();
  await testManifestTransition();
  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail > 0 ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
