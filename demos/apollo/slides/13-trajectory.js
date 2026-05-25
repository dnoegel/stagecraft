'use strict';

/**
 * BESPOKE · Translunar trajectory.
 *
 * An SVG canvas with two circles (Earth blue / Moon grey-cream) and a curving
 * dashed path between them, drawn via animated stroke-dashoffset over ~3 seconds.
 * A small triangular "spacecraft" icon then travels along the path via
 * SVG `<animateMotion>` (with a fallback that ticks position along the path).
 *
 * Cinematic choices:
 *  - The path uses a quadratic Bézier curve from Earth (right) toward Moon (left)
 *    so it reads as a graceful arc, not a straight ruler.
 *  - The dashed pattern means the path looks like a series of tick marks
 *    rather than a continuous line — feels more "telemetry plot".
 *  - The spacecraft icon is a small filled triangle pointing in its direction of travel.
 *  - On entry we stagger: Earth fades in → path draws itself → spacecraft begins
 *    to travel → Moon fades in last. Reads as the journey itself.
 *  - Three captions below ("TLI", "COAST", "LOI") fade in matched to the timeline.
 */
function playTrajectory(el) {
  const earth = el.querySelector('#earth');
  const moon  = el.querySelector('#moon');
  const path  = el.querySelector('#traj-path');
  const ship  = el.querySelector('#spacecraft');
  const captions = el.querySelectorAll('.trajectory-caption .stage-caption');

  let cancelled = false;
  const timers = [];
  let rafId = null;

  // Hide everything initially.
  earth.style.opacity = '0';
  moon.style.opacity  = '0';
  ship.style.opacity  = '0';
  captions.forEach(c => c.style.opacity = '0');

  // Configure dash drawing.
  const length = path.getTotalLength();
  path.style.strokeDasharray  = `6 8`;
  path.style.strokeDashoffset = length;

  // Step 1: fade in Earth.
  timers.push(setTimeout(() => {
    if (cancelled) return;
    earth.style.transition = 'opacity 800ms ease-out';
    earth.style.opacity = '1';
  }, 200));

  // Step 2: draw the path.
  timers.push(setTimeout(() => {
    if (cancelled) return;
    path.style.transition = 'stroke-dashoffset 3000ms cubic-bezier(0.4, 0, 0.2, 1)';
    path.style.strokeDashoffset = 0;
  }, 900));

  // Step 3: spacecraft begins its journey along the path.
  timers.push(setTimeout(() => {
    if (cancelled) return;
    ship.style.transition = 'opacity 400ms ease-out';
    ship.style.opacity = '1';
    const startTs = performance.now();
    const dur = 4200; // travel time across the path
    const tick = (t) => {
      if (cancelled) return;
      const p = Math.min(1, (t - startTs) / dur);
      const pt = path.getPointAtLength(p * length);
      // Find heading by sampling a tiny step ahead.
      const ahead = path.getPointAtLength(Math.min(length, p * length + 1));
      const angle = Math.atan2(ahead.y - pt.y, ahead.x - pt.x) * 180 / Math.PI;
      ship.setAttribute('transform', `translate(${pt.x.toFixed(2)}, ${pt.y.toFixed(2)}) rotate(${angle.toFixed(1)})`);
      if (p < 1) {
        rafId = requestAnimationFrame(tick);
      }
    };
    rafId = requestAnimationFrame(tick);
  }, 1500));

  // Step 4: Moon fades in after spacecraft begins to approach.
  timers.push(setTimeout(() => {
    if (cancelled) return;
    moon.style.transition = 'opacity 900ms ease-out';
    moon.style.opacity = '1';
  }, 3800));

  // Captions appear in time with the phases.
  [600, 2200, 4800].forEach((delay, i) => {
    timers.push(setTimeout(() => {
      if (cancelled) return;
      const c = captions[i];
      if (c) {
        c.style.transition = 'opacity 500ms ease-out';
        c.style.opacity = '1';
      }
    }, delay));
  });

  return () => {
    cancelled = true;
    timers.forEach(clearTimeout);
    if (rafId) cancelAnimationFrame(rafId);
  };
}

Stage.register({
  section: 4,
  title: '03 · Trajectory',
  render(el) {
    el.innerHTML = `
      <div class="trajectory-wrap">
        <svg class="trajectory-svg" viewBox="0 0 1000 360" preserveAspectRatio="xMidYMid meet">
          <defs>
            <radialGradient id="earthGrad" cx="0.35" cy="0.35" r="0.7">
              <stop offset="0%"  stop-color="#9BD9FF"/>
              <stop offset="60%" stop-color="#5BC0EB"/>
              <stop offset="100%" stop-color="#1E5B7A"/>
            </radialGradient>
            <radialGradient id="moonGrad" cx="0.35" cy="0.35" r="0.7">
              <stop offset="0%"  stop-color="#F0EEE3"/>
              <stop offset="60%" stop-color="#B8B49E"/>
              <stop offset="100%" stop-color="#4A4538"/>
            </radialGradient>
          </defs>

          <!-- The curving translunar path, from Earth (right) to Moon (left). -->
          <path id="traj-path"
                d="M 870 200 Q 600 60 130 165"
                fill="none"
                stroke="#FFB454"
                stroke-width="1.4"
                stroke-linecap="round"/>

          <!-- Earth -->
          <g id="earth">
            <circle cx="870" cy="200" r="58" fill="url(#earthGrad)"/>
            <text x="870" y="295" fill="#5BC0EB" font-family="JetBrains Mono, monospace" font-size="11" text-anchor="middle" letter-spacing="3">EARTH</text>
          </g>

          <!-- Moon -->
          <g id="moon">
            <circle cx="130" cy="165" r="32" fill="url(#moonGrad)"/>
            <!-- A few craters as small dark disks -->
            <circle cx="118" cy="158" r="3" fill="rgba(0,0,0,0.25)"/>
            <circle cx="138" cy="175" r="4" fill="rgba(0,0,0,0.25)"/>
            <circle cx="125" cy="175" r="2" fill="rgba(0,0,0,0.25)"/>
            <text x="130" y="225" fill="#F0EEE3" font-family="JetBrains Mono, monospace" font-size="11" text-anchor="middle" letter-spacing="3">MOON</text>
          </g>

          <!-- Spacecraft icon: a small amber triangle. Moves along the path. -->
          <g id="spacecraft">
            <polygon points="-7,-4 7,0 -7,4" fill="#FFB454" stroke="#F0EEE3" stroke-width="0.6"/>
            <circle r="2.5" cx="-2" cy="0" fill="#5BC0EB"/>
          </g>
        </svg>

        <div class="trajectory-caption">
          <span class="stage-caption">T+2h 44m &middot; <span class="accent">TRANS-LUNAR INJECTION</span></span>
          &nbsp;&middot;&nbsp;
          <span class="stage-caption">~76h &middot; <span class="accent">TRANSLUNAR COAST</span></span>
          &nbsp;&middot;&nbsp;
          <span class="stage-caption">T+75h 50m &middot; <span class="accent">LUNAR ORBIT INSERTION</span></span>
        </div>
      </div>
    `;
  },
  init(el)   { return playTrajectory(el); },
  replay(el) { this.render(el); return playTrajectory(el); }
}, {
  notes: [
    'BESPOKE TRAJECTORY. Earth fades in first (right edge), the dashed amber path draws itself across the screen via stroke-dashoffset (~3 seconds), the spacecraft icon follows the path with proper heading angle, and the Moon fades in as the spacecraft arrives.',
    'Three captions appear in time with the phases: TLI (Trans-Lunar Injection), the long coast, and LOI (Lunar Orbit Insertion).',
    'Historical: the burn was performed by the S-IVB third stage at T+2h 44m. The vehicle accelerated from low-Earth orbit velocity (~7.8 km/s) to ~10.83 km/s — just under Earth escape. The trajectory was a "free return" — if no further maneuvers were performed, lunar gravity would slingshot them back to Earth.'
  ].join(' ')
});
