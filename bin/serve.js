#!/usr/bin/env node
'use strict';

/**
 * stagecraft serve — local dev server with hot reload + edit-mode API.
 *
 * Serves the project directory over HTTP, opens a WebSocket on
 * /stagecraft for the browser to talk to. Endpoints:
 *
 *   POST /api/note/slide          { file, text }
 *   POST /api/note/element        { file, stageKey, text }
 *   POST /api/edit/inline         { file, propPath, value }
 *   POST /api/manifest/reorder    { newOrder: [oldIdx, ...] }
 *   POST /api/manifest/transition { idx, transition }
 *
 * Watches all source files; broadcasts granular reload events.
 */

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';
import { WebSocketServer } from 'ws';
import chokidar from 'chokidar';
import mime from 'mime-types';

import { writeSlideNote, writeElementNote, writeInlineEdit, reorderManifest, setManifestTransition } from './lib/edit-ops.js';

// --- args ---
const args = process.argv.slice(2);
let rootArg = '.';
let port = 3000;
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--root') rootArg = args[++i];
  else if (args[i] === '--port') port = parseInt(args[++i], 10);
}
const ROOT = path.resolve(rootArg);

if (!fs.existsSync(ROOT)) {
  console.error(`[stagecraft] root directory not found: ${ROOT}`);
  process.exit(1);
}

console.log(`[stagecraft] serving ${ROOT}`);

// --- HTTP server ---
const server = http.createServer(async (req, res) => {
  try {
    const parsed = url.parse(req.url, true);
    if (req.method === 'POST' && parsed.pathname.startsWith('/api/')) {
      return handleApi(req, res, parsed);
    }
    return serveStatic(req, res, parsed);
  } catch (e) {
    console.error('[stagecraft] error', e);
    res.statusCode = 500;
    res.end('Internal error');
  }
});

// --- WebSocket ---
const wss = new WebSocketServer({ noServer: true });
const clients = new Set();

server.on('upgrade', (req, socket, head) => {
  if (req.url !== '/stagecraft') {
    socket.destroy();
    return;
  }
  // Refuse non-loopback
  const addr = req.socket.remoteAddress;
  if (!isLoopback(addr)) {
    socket.destroy();
    return;
  }
  wss.handleUpgrade(req, socket, head, ws => {
    clients.add(ws);
    ws.on('close', () => clients.delete(ws));
    ws.send(JSON.stringify({ type: 'hello' }));
  });
});

function broadcast(msg) {
  const s = JSON.stringify(msg);
  clients.forEach(c => { if (c.readyState === 1) c.send(s); });
}

// --- File watching ---
const watcher = chokidar.watch(['slides/**/*.js', 'stagecraft.config.js', 'index.html', '../themes/**/*.css'], {
  cwd: ROOT,
  ignored: /node_modules/,
  ignoreInitial: true
});
watcher.on('all', (event, filePath) => {
  const ext = path.extname(filePath);
  let target = 'slide';
  if (filePath.endsWith('stagecraft.config.js')) target = 'manifest';
  else if (ext === '.css') target = 'theme-css';
  else if (filePath.includes('themes/') && ext === '.js') target = 'theme-js';
  console.log(`[stagecraft] ${event}: ${filePath} → reload ${target}`);
  broadcast({ type: 'reload', target, file: filePath });
});

// --- Static file serving ---
function serveStatic(req, res, parsed) {
  let p = decodeURIComponent(parsed.pathname);
  if (p === '/') p = '/index.html';

  // First try project root
  let full = safeJoin(ROOT, p);

  // If not found, try the stagecraft package root (so /src/engine.js works
  // for the starter without npm install in dev)
  if (!full || !fs.existsSync(full)) {
    const pkgRoot = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), '..');
    const pkgPath = safeJoin(pkgRoot, p);
    if (pkgPath && fs.existsSync(pkgPath)) full = pkgPath;
  }

  if (!full || !fs.existsSync(full)) {
    res.statusCode = 404;
    res.end('Not found: ' + p);
    return;
  }
  const stat = fs.statSync(full);
  if (stat.isDirectory()) {
    full = path.join(full, 'index.html');
    if (!fs.existsSync(full)) { res.statusCode = 404; res.end(); return; }
  }
  const type = mime.lookup(full) || 'application/octet-stream';
  res.setHeader('Content-Type', type);
  res.setHeader('Cache-Control', 'no-store');
  fs.createReadStream(full).pipe(res);
}

function safeJoin(root, p) {
  const resolved = path.resolve(root, '.' + p);
  if (!resolved.startsWith(root)) return null;
  return resolved;
}

function isLoopback(addr) {
  return addr === '127.0.0.1' || addr === '::1' || addr === '::ffff:127.0.0.1';
}

// --- API handlers ---
async function handleApi(req, res, parsed) {
  const body = await readBody(req);
  let data;
  try { data = JSON.parse(body); } catch (e) {
    return sendJson(res, 400, { error: 'invalid JSON' });
  }
  try {
    switch (parsed.pathname) {
      case '/api/note/slide':
        await writeSlideNote(ROOT, data.file, data.text);
        return sendJson(res, 200, { ok: true });
      case '/api/note/element':
        await writeElementNote(ROOT, data.file, data.stageKey, data.text);
        return sendJson(res, 200, { ok: true });
      case '/api/edit/inline':
        await writeInlineEdit(ROOT, data.file, data.propPath, data.value);
        return sendJson(res, 200, { ok: true });
      case '/api/manifest/reorder':
        await reorderManifest(ROOT, data.newOrder);
        return sendJson(res, 200, { ok: true });
      case '/api/manifest/transition':
        await setManifestTransition(ROOT, data.idx, data.transition);
        return sendJson(res, 200, { ok: true });
      default:
        return sendJson(res, 404, { error: 'unknown endpoint' });
    }
  } catch (e) {
    console.error('[stagecraft] api error', e);
    return sendJson(res, 500, { error: e.message });
  }
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let chunks = '';
    req.on('data', c => chunks += c);
    req.on('end', () => resolve(chunks));
    req.on('error', reject);
  });
}

function sendJson(res, status, obj) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(obj));
}

// --- Start ---
server.listen(port, '127.0.0.1', () => {
  console.log(`[stagecraft] http://localhost:${port}`);
  console.log(`[stagecraft] websocket  ws://localhost:${port}/stagecraft`);
});
