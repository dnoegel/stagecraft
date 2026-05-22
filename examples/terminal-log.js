'use strict';

/**
 * Cookbook · Terminal Log
 * -----------------------
 * Technique: streaming colored log lines that build a small narrative —
 * a stream of "successful" output, a long pause, then a contrasting
 * realization line and a final highlighted reveal.
 *
 * What to copy:
 *  - The data-driven log model: an array of `{lvl, src, msg}` rows
 *    rendered by a single `renderLine(line, delay)` helper. Keeps
 *    the timing logic separate from the content.
 *  - Linear schedule with `200 + i * 280` — predictable cadence
 *    that still reads as "live". Pair with a longer gap (1400ms)
 *    before the punchline so the audience has time to catch up.
 *  - The three "phases": (1) loop of normal lines, (2) interjection
 *    in a different color/class, (3) final emphasis line with a caret.
 *  - The `node.style.opacity = '1'` inside `requestAnimationFrame`
 *    after appending — guarantees the transition runs from 0 → 1.
 *  - The terminal chrome (3 dots + title bar) is just static HTML —
 *    the only animated region is `#termBody`.
 */

function playTerminalLog(el) {
  const body = el.querySelector('#termBody');
  body.innerHTML = '';
  let cancelled = false;
  const timers = [];

  const lines = [
    { lvl: 'INFO', src: 'agent.run',       msg: 'task=do_thing start' },
    { lvl: 'INFO', src: 'tool.step.one',   msg: 'OK — step one finished' },
    { lvl: 'INFO', src: 'tool.step.two',   msg: 'OK — step two finished (id=abc123)' },
    { lvl: 'INFO', src: 'agent.observe',   msg: 'no errors detected' },
    { lvl: 'INFO', src: 'tool.step.three', msg: 'OK — step three finished' },
    { lvl: 'INFO', src: 'agent.check',     msg: 'OK — 0 / 0 checks failed' },
    { lvl: 'INFO', src: 'agent.run',       msg: 'task=do_thing complete' },
    { lvl: 'INFO', src: 'agent.run',       msg: 'task=announce start' },
    { lvl: 'WARN', src: 'tool.notify',     msg: 'OK — posted notification "all good"' },
  ];

  const renderLine = (line, delay) => {
    timers.push(setTimeout(() => {
      if (cancelled) return;
      const ts = new Date(Date.now() - (lines.length - timers.length) * 1700);
      const tstr = ts.toISOString().slice(11, 19);
      const node = document.createElement('span');
      node.className = `log-line ${line.lvl.toLowerCase()}`;
      node.innerHTML = `<span class="ts">${tstr}</span><span class="lvl">${line.lvl}</span>[<span class="src">${line.src}</span>] ${line.msg}`;
      body.appendChild(node);
      requestAnimationFrame(() => {
        node.style.transition = 'opacity 250ms ease-out';
        node.style.opacity = '1';
      });
    }, delay));
  };

  lines.forEach((l, i) => renderLine(l, 200 + i * 280));

  // long pause… then human-style realization in a contrasting color
  timers.push(setTimeout(() => {
    if (cancelled) return;
    const node = document.createElement('span');
    node.className = 'log-line human';
    node.innerHTML = `<br>// wait — "0 / 0 checks failed" because 0 checks exist.`;
    body.appendChild(node);
    requestAnimationFrame(() => {
      node.style.transition = 'opacity 600ms ease-out';
      node.style.opacity = '1';
    });
  }, 200 + lines.length * 280 + 1400));

  // final emphasized reveal
  timers.push(setTimeout(() => {
    if (cancelled) return;
    const node = document.createElement('span');
    node.className = 'log-line error';
    node.innerHTML = `<span class="ts">··:··:··</span><span class="lvl">ERROR</span>[<span class="src">coverage</span>] no checks for src/feature/ — agent never wrote any<span class="caret" style="margin-left:0.3em"></span>`;
    body.appendChild(node);
    requestAnimationFrame(() => {
      node.style.transition = 'opacity 400ms ease-out';
      node.style.opacity = '1';
    });
  }, 200 + lines.length * 280 + 2700));

  return () => {
    cancelled = true;
    timers.forEach(clearTimeout);
  };
}

Stage.register({
  section: 3,
  title: 'Example · Terminal Log',
  render(el) {
    el.innerHTML = `
      <div class="terminal">
        <div class="terminal-head">
          <span class="tdot"></span><span class="tdot"></span><span class="tdot"></span>
          <span class="ttitle">user@host ~/project — agent.do_thing()</span>
        </div>
        <div class="terminal-body" id="termBody"></div>
      </div>
    `;
  },
  init(el) { return playTerminalLog(el); },
  replay(el) { return playTerminalLog(el); }
});
