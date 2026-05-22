#!/usr/bin/env node
'use strict';

/**
 * stagecraft — dispatcher CLI.
 *   stagecraft init     scaffold a new project
 *   stagecraft serve    start dev server with edit mode
 */

import { spawn } from 'node:child_process';
import path from 'node:path';
import url from 'node:url';

const cmd = process.argv[2];
const rest = process.argv.slice(3);
const HERE = path.dirname(url.fileURLToPath(import.meta.url));

function run(script) {
  const child = spawn('node', [path.join(HERE, script), ...rest], { stdio: 'inherit' });
  child.on('exit', code => process.exit(code ?? 0));
}

switch (cmd) {
  case 'init':  run('init.js'); break;
  case 'serve': run('serve.js'); break;
  case '--help':
  case '-h':
  case undefined:
    console.log(`Stagecraft — cinematic, agent-authored presentations.

Usage:
  stagecraft init             scaffold a new project in the current dir
  stagecraft serve [--port N] [--root DIR]  start dev server with edit mode

Without the dev server, open index.html in a browser to present.`);
    break;
  default:
    console.error(`Unknown command: ${cmd}`);
    process.exit(1);
}
