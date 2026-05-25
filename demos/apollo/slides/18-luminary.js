'use strict';

/**
 * A representative excerpt from Luminary 099 — the AGC flight program that
 * flew on Apollo 11's LM. The complete source is on GitHub
 * (chrislgarry/Apollo-11 mirrors MIT's original printouts).
 *
 * The snippet here is true in spirit to the Luminary executive: the BAILOUT
 * handler triggered when the queue ran out of "vacant cores" (Executive
 * Overflow), which is exactly what produced the 1202 alarm. Labels, opcodes
 * (CA, TC, INHINT, OCT, TS, CADR) and conventions are real AGC assembly.
 *
 * Custom-rendered so we can hand-color the syntax in our amber/cream palette
 * rather than fight Prism with a non-standard language.
 */

const AGC_SRC = [
  '# ALARM 1202 — EXECUTIVE OVERFLOW: NO VACANT CORES',
  '',
  'BAILOUT       CA      BBANK              # save caller bank',
  '              TS      ALMCADR            # record offending address',
  '              CA      TWO                # alarm-type selector',
  '              TS      ITEMP1',
  '              TC      ALARM              # raise program alarm',
  '              OCT     1202               # → flashes on the DSKY',
  '',
  'ALARM         INHINT                     # critical section',
  '              CA      ITEMP1             # alarm code in A',
  '              TS      FAILREG            # latch for display',
  '              TC      POSTJUMP           # …and continue',
  '              CADR    GOPROG2            # restart current job',
  '',
  'POODOO        TC      BAILOUT            # if we ever lose the queue,',
  '              CADR    POODOO             # land anyway. — MARGARET'
];

const OPCODES = new Set(['CA', 'TS', 'TC', 'INHINT', 'RELINT', 'OCT', 'CADR', 'POSTJUMP']);

function highlightAgcLine(line) {
  const escapeHtml = (s) => s.replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
  const ci = line.indexOf('#');
  let main = ci === -1 ? line : line.slice(0, ci);
  let comment = ci === -1 ? '' : line.slice(ci);
  main = escapeHtml(main);
  comment = escapeHtml(comment);
  // Label = uppercase identifier in the very first column.
  main = main.replace(/^([A-Z][A-Z0-9_]+)(\s)/, '<span style="color:#5BC0EB;">$1</span>$2');
  // Opcodes — match anywhere after some whitespace.
  main = main.replace(/(\s)([A-Z][A-Z]+)(\s)/g, (m, a, op, b) => OPCODES.has(op) ? `${a}<span style="color:#FFB454; font-weight:500;">${op}</span>${b}` : m);
  // Highlight the literal "1202" inside OCT lines.
  main = main.replace(/(\b)(1202|1201)(\b)/g, '$1<span style="color:#FFB454; font-weight:600; text-shadow: 0 0 12px rgba(255,180,84,0.55);">$2</span>$3');
  if (comment) {
    comment = comment.replace(/MARGARET/g, '<span style="color:#FFB454; font-weight:600;">MARGARET</span>');
    return main + '<span style="color:#8B8676;">' + comment + '</span>';
  }
  return main || ' ';
}

Stage.register({
  section: 5,
  title: '04 · Luminary 099',
  render(el) {
    el.innerHTML = `
      <div style="display:flex;flex-direction:column;align-items:center;width:100%;gap:0.7rem;">
        <div class="agc-header">Luminary 099 &middot; Apollo Guidance Computer &middot; Lunar Module flight software</div>

        <div style="width: min(900px, 92vw); border:1px solid var(--dim-2); background:#050505;">
          <div style="
            padding: 0.65rem 1.1rem;
            border-bottom: 1px solid var(--dim-2);
            font-family: var(--mono);
            font-size: 0.7rem;
            letter-spacing: 0.32em;
            color: var(--dim);
            text-transform: uppercase;
            display: flex;
            justify-content: space-between;
          ">
            <span>EXECUTIVE.s</span>
            <span style="color: var(--accent);">AGC &middot; Block II</span>
          </div>
          <pre id="agc-pre" style="
            margin: 0;
            padding: 1.3rem 1.5rem;
            font-family: var(--mono);
            font-size: clamp(0.78rem, 1.1vw, 0.98rem);
            line-height: 1.6;
            color: var(--fg);
            letter-spacing: 0.02em;
            overflow-x: auto;
            opacity: 0;
            transition: opacity 800ms ease-out;
          "><code id="agc-code"></code></pre>
        </div>

        <div class="agc-sub">"Land anyway." &mdash; the priority-scheduled executive that kept Eagle flying through two alarms</div>
      </div>
    `;
    const codeEl = el.querySelector('#agc-code');
    codeEl.innerHTML = AGC_SRC.map(highlightAgcLine).join('\n');
  },
  init(el) {
    const pre = el.querySelector('#agc-pre');
    const tid = setTimeout(() => { if (pre) pre.style.opacity = '1'; }, 250);
    return () => clearTimeout(tid);
  },
  replay(el) { this.render(el); return this.init(el); }
}, {
  notes: [
    'Representative AGC assembly in the style of Luminary 099 — the LM flight program. The full source is publicly mirrored on GitHub (chrislgarry/Apollo-11).',
    'Opcodes shown are real AGC Block II instructions: CA (clear and add to A), TS (transfer to storage), TC (transfer control), INHINT (inhibit interrupts), OCT (octal constant), CADR (constant address).',
    'BAILOUT did exactly this: when the executive ran out of "vacant cores" (free job slots), it raised an alarm (1202 if no cores, 1201 if no VAC areas) and rebooted the current job rather than crashing. Margaret Hamilton\'s team at MIT designed it to fail gracefully and restartably — at the time, that was a controversial architectural choice.',
    'The "MARGARET" tribute in the source is not literally in the original 1969 code; it is the gist of why the architecture mattered. Without that priority-scheduling design, the 1202 would have aborted the landing.',
    'AGC specs: 2.048 MHz clock, 4 KB erasable memory, 72 KB rope core ROM, ~145 KSLOC across Luminary (LM) + Colossus (CM).'
  ].join(' ')
});
