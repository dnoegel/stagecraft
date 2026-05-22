#!/usr/bin/env node
'use strict';

/**
 * stagecraft init — scaffold a new stagecraft project in the current directory.
 *
 * Copies the starter/ template + AGENT.md to cwd.
 */

import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';

const HERE = path.dirname(url.fileURLToPath(import.meta.url));
const PKG_ROOT = path.resolve(HERE, '..');
const SRC = path.join(PKG_ROOT, 'starter');
const TARGET = process.cwd();

function copyRecursive(src, dst) {
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    if (!fs.existsSync(dst)) fs.mkdirSync(dst, { recursive: true });
    for (const entry of fs.readdirSync(src)) {
      copyRecursive(path.join(src, entry), path.join(dst, entry));
    }
  } else {
    if (fs.existsSync(dst)) {
      console.log(`  skip (exists): ${path.relative(TARGET, dst)}`);
      return;
    }
    fs.copyFileSync(src, dst);
    console.log(`  + ${path.relative(TARGET, dst)}`);
  }
}

console.log(`[stagecraft] scaffold → ${TARGET}`);
copyRecursive(SRC, TARGET);

// Also copy AGENT.md to project root
const agentMd = path.join(PKG_ROOT, 'AGENT.md');
if (fs.existsSync(agentMd)) {
  const dst = path.join(TARGET, 'AGENT.md');
  if (!fs.existsSync(dst)) {
    fs.copyFileSync(agentMd, dst);
    console.log(`  + AGENT.md`);
  }
}

console.log('\nDone. Next steps:');
console.log('  npx stagecraft serve     # dev server with edit mode');
console.log('  open index.html          # presentation only');
console.log('  read AGENT.md            # the manifesto');
