'use strict';

/**
 * Edit operations on stagecraft slide files.
 *
 * - writeSlideNote(root, file, text)     — write @note: comment above Stage.register(
 * - writeElementNote(root, file, key, t) — write @note[stage-key=...]: comment above register
 * - writeInlineEdit(root, file, path, v) — AST-aware: replace string literal at prop path
 * - reorderManifest(root, newOrder)      — rewrite stagecraft.config.js slides array
 * - setManifestTransition(root, idx, t)  — set transition on slide at idx in manifest
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { parse } from '@babel/parser';
import _traverseMod from '@babel/traverse';
import _generateMod from '@babel/generator';
import * as t from '@babel/types';

const traverse = _traverseMod.default || _traverseMod;
const generate = _generateMod.default || _generateMod;

function resolveFile(root, file) {
  // file may already be absolute or relative
  const p = path.isAbsolute(file) ? file : path.resolve(root, file);
  if (!p.startsWith(root)) throw new Error('refused: file outside project root');
  return p;
}

function parseFile(src) {
  return parse(src, {
    sourceType: 'unambiguous',
    plugins: [],
    errorRecovery: false
  });
}

function regenerate(ast, src) {
  // Use retainLines+compact:false to preserve formatting as much as possible
  return generate(ast, { retainLines: false, compact: false, jsescOption: { minimal: true } }, src).code;
}

// ---------------------------------------------------------------------------
// Slide-level note: insert/replace `// @note: ...` immediately above the first
// Stage.register(...) call. Multi-line note becomes consecutive comment lines.
// ---------------------------------------------------------------------------
export async function writeSlideNote(root, file, text) {
  const p = resolveFile(root, file);
  let src = await fs.readFile(p, 'utf8');
  src = removeNoteComments(src, /\/\/\s*@note:\s*[\s\S]*?(?=\n[^/]|\nStage\.register|\nStage\.\w+\()/g);
  src = removeSimpleNoteLines(src);
  const noteLines = String(text).split(/\r?\n/).map(l => `// @note: ${l}`).join('\n');
  // Find first occurrence of "Stage.register(" or "stage.register(" or "Stage.<Cap>(" used as register arg
  const m = src.match(/(^|\n)([ \t]*)(Stage\.register\s*\()/);
  if (!m) {
    // Prepend at top of file (after first comment block if any)
    src = noteLines + '\n' + src;
  } else {
    const indent = m[2];
    const noteWithIndent = noteLines.split('\n').map(l => indent + l).join('\n');
    const insertion = (m[1] === '\n' ? '\n' : '') + noteWithIndent + '\n';
    src = src.slice(0, m.index + (m[1] === '\n' ? 1 : 0))
      + noteWithIndent + '\n'
      + src.slice(m.index + (m[1] === '\n' ? 1 : 0));
  }
  await fs.writeFile(p, src, 'utf8');
}

function removeSimpleNoteLines(src) {
  // Remove standalone "// @note: ..." lines (single-line form)
  return src.split('\n').filter(l => !/^\s*\/\/\s*@note(\[|:)/.test(l)).join('\n');
}

function removeNoteComments(src) {
  // Generic removal of any line starting with // @note ... (covers Level 1 + 2)
  return removeSimpleNoteLines(src);
}

// ---------------------------------------------------------------------------
// Element-pin note: `// @note[stage-key="K"]: text` placed above Stage.register
// ---------------------------------------------------------------------------
export async function writeElementNote(root, file, stageKey, text) {
  const p = resolveFile(root, file);
  let src = await fs.readFile(p, 'utf8');
  // Remove any existing note for this same key
  const escKey = stageKey.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const existingRe = new RegExp(`^\\s*//\\s*@note\\[stage-key=\\"${escKey}\\"\\]:.*$`, 'gm');
  src = src.replace(existingRe, '');
  // Build new note
  const noteLines = String(text).split(/\r?\n/).map((l, i) =>
    i === 0
      ? `// @note[stage-key="${stageKey}"]: ${l}`
      : `// @note[stage-key="${stageKey}"]: ${l}`
  ).join('\n');
  const m = src.match(/(^|\n)([ \t]*)(Stage\.register\s*\()/);
  if (!m) {
    src = noteLines + '\n' + src;
  } else {
    const indent = m[2];
    const noteWithIndent = noteLines.split('\n').map(l => indent + l).join('\n');
    src = src.slice(0, m.index + (m[1] === '\n' ? 1 : 0))
      + noteWithIndent + '\n'
      + src.slice(m.index + (m[1] === '\n' ? 1 : 0));
  }
  // Clean up double blank lines
  src = src.replace(/\n{3,}/g, '\n\n');
  await fs.writeFile(p, src, 'utf8');
}

// ---------------------------------------------------------------------------
// Inline edit: parse the file, find the Stage.<Component>({...}) call argument
// (the props object), navigate the propPath, replace the string literal.
//
// propPath examples:
//   "lines[0].text"
//   "items[2].name"
//   "title"
//   "left.items[1]"
// ---------------------------------------------------------------------------
export async function writeInlineEdit(root, file, propPath, value) {
  const p = resolveFile(root, file);
  const src = await fs.readFile(p, 'utf8');
  const ast = parseFile(src);

  const tokens = parsePropPath(propPath);
  let updated = false;
  let error = null;

  traverse(ast, {
    CallExpression(pathNode) {
      if (updated) return;
      const callee = pathNode.node.callee;
      // Match Stage.register(Stage.X({...})) or Stage.X({...}) directly
      // We want to find the deepest ObjectExpression that's an argument to
      // a Stage.<Component>(...) call or the argument of Stage.register({...})
      const targetObj = findPropsObject(pathNode.node);
      if (!targetObj) return;

      // Try to navigate the propPath
      try {
        const node = navigatePath(targetObj, tokens);
        if (!node) return;
        if (!t.isStringLiteral(node) && !t.isTemplateLiteral(node)) {
          error = new Error(`prop path "${propPath}" does not resolve to a string literal (got ${node.type})`);
          return;
        }
        if (t.isTemplateLiteral(node) && (node.expressions.length > 0 || node.quasis.length !== 1)) {
          error = new Error(`prop path "${propPath}" is an interpolated template literal — cannot inline-edit`);
          return;
        }
        // Replace the value
        if (t.isStringLiteral(node)) {
          node.value = String(value);
        } else {
          // single-quasi template literal
          node.quasis[0].value.raw = String(value);
          node.quasis[0].value.cooked = String(value);
        }
        updated = true;
      } catch (e) {
        // path doesn't apply here, continue to next call
      }
    }
  });

  if (error) throw error;
  if (!updated) throw new Error(`no matching call/prop path "${propPath}" found in ${file}`);

  const out = regenerate(ast, src);
  await fs.writeFile(p, out, 'utf8');
}

function findPropsObject(callNode) {
  // Common shapes:
  //   Stage.register({...})           → args[0] is the obj
  //   Stage.register(Stage.X({...}))  → args[0].arguments[0] is the obj
  //   Stage.X({...})                  → args[0] is the obj  (when matched independently)
  const callee = callNode.callee;
  if (!t.isMemberExpression(callee)) return null;
  const obj = callee.object;
  const prop = callee.property;
  if (!t.isIdentifier(obj) || obj.name !== 'Stage') return null;
  if (!t.isIdentifier(prop)) return null;

  // Stage.register(...)
  if (prop.name === 'register') {
    const arg = callNode.arguments[0];
    if (!arg) return null;
    if (t.isObjectExpression(arg)) return arg;
    if (t.isCallExpression(arg)) {
      // nested Stage.X({...}) — recurse
      return findPropsObject(arg);
    }
    return null;
  }
  // Stage.X(...) where X starts with an uppercase
  if (/^[A-Z]/.test(prop.name)) {
    const arg = callNode.arguments[0];
    if (arg && t.isObjectExpression(arg)) return arg;
  }
  return null;
}

function parsePropPath(p) {
  // 'a.b[2].c' → ['a', 'b', 2, 'c']
  const tokens = [];
  const re = /([a-zA-Z_$][\w$]*)|\[(\d+)\]/g;
  let m;
  while ((m = re.exec(p)) !== null) {
    if (m[1] !== undefined) tokens.push(m[1]);
    else tokens.push(Number(m[2]));
  }
  return tokens;
}

function navigatePath(node, tokens) {
  let cur = node;
  for (const tok of tokens) {
    if (typeof tok === 'string') {
      if (!t.isObjectExpression(cur)) return null;
      const prop = cur.properties.find(p =>
        (t.isObjectProperty(p) || t.isObjectMethod(p)) &&
        ((t.isIdentifier(p.key) && p.key.name === tok) ||
         (t.isStringLiteral(p.key) && p.key.value === tok))
      );
      if (!prop || !t.isObjectProperty(prop)) return null;
      cur = prop.value;
    } else {
      if (!t.isArrayExpression(cur)) return null;
      if (tok < 0 || tok >= cur.elements.length) return null;
      cur = cur.elements[tok];
    }
  }
  return cur;
}

// ---------------------------------------------------------------------------
// Manifest operations
// ---------------------------------------------------------------------------

async function readManifest(root) {
  const p = path.resolve(root, 'stagecraft.config.js');
  return { path: p, src: await fs.readFile(p, 'utf8') };
}

async function rewriteManifest(p, src, mutator) {
  const ast = parseFile(src);
  let updated = false;
  traverse(ast, {
    CallExpression(pathNode) {
      const callee = pathNode.node.callee;
      if (!t.isMemberExpression(callee)) return;
      if (!t.isIdentifier(callee.object, { name: 'Stage' })) return;
      if (!t.isIdentifier(callee.property, { name: 'deck' })) return;
      const arg = pathNode.node.arguments[0];
      if (!arg || !t.isObjectExpression(arg)) return;
      const slidesProp = arg.properties.find(p =>
        t.isObjectProperty(p) && t.isIdentifier(p.key, { name: 'slides' })
      );
      if (!slidesProp || !t.isArrayExpression(slidesProp.value)) return;
      mutator(slidesProp.value);
      updated = true;
    }
  });
  if (!updated) throw new Error('no Stage.deck({ slides: [...] }) call found in manifest');
  await fs.writeFile(p, regenerate(ast, src), 'utf8');
}

export async function reorderManifest(root, newOrder) {
  const { path: p, src } = await readManifest(root);
  await rewriteManifest(p, src, arr => {
    const original = arr.elements.slice();
    arr.elements = newOrder.map(i => original[i]).filter(Boolean);
  });
}

export async function setManifestTransition(root, idx, transition) {
  const { path: p, src } = await readManifest(root);
  await rewriteManifest(p, src, arr => {
    const target = arr.elements[idx];
    if (!target || !t.isObjectExpression(target)) {
      throw new Error('manifest entry at ' + idx + ' is not an object');
    }
    const existing = target.properties.find(pr =>
      t.isObjectProperty(pr) && t.isIdentifier(pr.key, { name: 'transition' })
    );
    const valueNode = t.stringLiteral(String(transition));
    if (existing) existing.value = valueNode;
    else target.properties.push(t.objectProperty(t.identifier('transition'), valueNode));
  });
}
