'use strict';

/**
 * BESPOKE · 1202 Program Alarm.
 *
 * The most dramatic 60 seconds of the descent: the AGC began throwing 1202
 * (and later 1201) executive overflow alarms because the rendezvous radar
 * was inadvertently feeding it spurious data. In real time, on a 4 KB
 * computer, the AGC was rebooting its job queue and discarding lower-priority
 * tasks — exactly as designed.
 *
 * This slide streams the dialogue between Eagle and Houston as amber log lines,
 * using the technique from examples/terminal-log.js: a data-driven array of
 * {ts, src, msg, kind} rows, rendered through a single helper, with carefully
 * paced delays. The final line glows in amber for the GO decision.
 */
function playAlarmLog(el) {
  const body = el.querySelector('.alarm-body');
  body.innerHTML = '';

  let cancelled = false;
  const timers = [];

  // Each entry: { ts, src, msg, kind }. kind ∈ {normal, alarm, go}
  const lines = [
    { ts: '102:38:22', src: 'EAGLE',   msg: 'PROGRAM ALARM.', kind: 'alarm' },
    { ts: '102:38:24', src: 'EAGLE',   msg: 'It is a 1202.',  kind: 'alarm' },
    { ts: '102:38:26', src: 'EAGLE',   msg: 'Give us a reading on the 1202 program alarm.', kind: 'normal' },
    { ts: '102:38:30', src: 'HOUSTON', msg: '... stand by.',  kind: 'normal' },
    { ts: '102:38:32', src: 'HOUSTON', msg: '(FIDO — what is a 1202?)', kind: 'normal' },
    { ts: '102:38:38', src: 'BALES',   msg: 'Executive overflow — no vacant cores. We are GO on that alarm.', kind: 'normal' },
    { ts: '102:38:42', src: 'HOUSTON', msg: 'Roger, we got &mdash; we are GO on that alarm.', kind: 'normal' },
    { ts: '102:42:18', src: 'EAGLE',   msg: 'PROGRAM ALARM.', kind: 'alarm' },
    { ts: '102:42:19', src: 'EAGLE',   msg: '1201.',           kind: 'alarm' },
    { ts: '102:42:23', src: 'HOUSTON', msg: 'Roger, 1201 alarm. We are GO. Same type. We are GO.', kind: 'go' }
  ];

  const renderLine = (line, delay) => {
    timers.push(setTimeout(() => {
      if (cancelled) return;
      const node = document.createElement('div');
      node.className = `alarm-line ${line.kind}`;
      node.innerHTML = `<span class="ts">${line.ts}</span><span class="src">${line.src}</span>${line.msg}`;
      body.appendChild(node);
      requestAnimationFrame(() => { node.style.opacity = '1'; });
    }, delay));
  };

  // Schedule each line. The first two ("PROGRAM ALARM" / "1202") land fast and hot.
  // The first 1201 alarm gets an extra-long pre-gap to recreate the tension.
  let t = 400;
  lines.forEach((line, i) => {
    renderLine(line, t);
    if (i === 6) t += 1600;        // tension gap before the second alarm
    else if (line.kind === 'alarm') t += 600;
    else t += 900;
  });

  return () => {
    cancelled = true;
    timers.forEach(clearTimeout);
  };
}

Stage.register({
  section: 5,
  title: '04 · 1202',
  render(el) {
    el.innerHTML = `
      <div class="alarm-terminal">
        <div class="alarm-head">
          <span>AGC TRANSMISSION LOG &middot; Mission Elapsed Time (hh:mm:ss since liftoff)</span>
          <span class="blink">&middot; LIVE</span>
        </div>
        <div class="alarm-body"></div>
      </div>
    `;
  },
  init(el)   { return playAlarmLog(el); },
  replay(el) { this.render(el); return playAlarmLog(el); }
}, {
  notes: [
    'BESPOKE TERMINAL LOG. Streams the real Apollo 11 descent dialogue starting at GET 102:38:22 — the moment Armstrong reported "PROGRAM ALARM".',
    'The alarms (1202 and later 1201) were "Executive Overflow — No Vacant Cores" — the AGC ran out of room to schedule a new task. The cause was the rendezvous radar inadvertently left on, flooding the computer with interrupts. The AGC handled it as designed: it shed lower-priority tasks and kept the descent program running.',
    'Steve Bales, the 26-year-old guidance officer in Houston, made the GO call within seconds. Margaret Hamilton and the MIT Instrumentation Lab team had designed the AGC to fail this way — gracefully, restartably. They had argued for that priority-scheduled architecture against management resistance. Without it, the landing would have been aborted.',
    'Presenter cue: do not narrate while the lines are streaming. Let the audience read them. Pause two full beats after the final GO line lands.',
    'Dialogue is paraphrased to fit the time/space — the actual transcript is more terse and includes call signs. Steve Bales\'s line is the gist of what he said over the loop to Charlie Duke (CAPCOM), who relayed it to the crew.'
  ].join(' ')
});
