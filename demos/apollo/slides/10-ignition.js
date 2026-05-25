'use strict';

/**
 * BESPOKE · Ignition.
 *
 * An SVG Saturn V silhouette in the center of the slide, with a flame plume
 * underneath made of overlapping radial gradients. We use Stage.emitParticle
 * in a high-frequency loop to throw amber/cream sparks downward and outward
 * from the engine bell area, simulating exhaust + ejecta.
 *
 * Cinematic choices:
 *  - The rocket itself does not move — the motion is all flame + particles.
 *    Holds the audience's eye on the engine bells.
 *  - Two layered flame elements (inner + outer) with separate scale animations
 *    via Web Animations API give the plume a flickering, breathing quality.
 *  - Particles emit at ~70ms intervals — fast enough to feel violent, sparse
 *    enough to read individually.
 *  - The label "IGNITION" types in at the top via Stage.typewriter.
 */
function playIgnition(el) {
  const svg = el.querySelector('.ignition-svg');
  const flameInner = el.querySelector('#flame-inner');
  const flameOuter = el.querySelector('#flame-outer');
  const partsG = el.querySelector('#sparks');
  const label = el.querySelector('.ignition-label');

  let cancelled = false;
  const timers = [];
  let interval = null;
  const animations = [];

  // Type "IGNITION SEQUENCE START" at the top.
  const typewriterCleanup = Stage.typewriter(label, 'IGNITION SEQUENCE START', { speed: 70, jitter: 30 });

  // Flame breathing animations.
  if (flameInner.animate) {
    animations.push(flameInner.animate([
      { transform: 'scaleY(0.85) scaleX(1.00)', opacity: 0.85 },
      { transform: 'scaleY(1.15) scaleX(1.05)', opacity: 1.00 },
      { transform: 'scaleY(0.90) scaleX(0.98)', opacity: 0.90 }
    ], { duration: 240, iterations: Infinity, easing: 'ease-in-out' }));
    animations.push(flameOuter.animate([
      { transform: 'scaleY(0.92) scaleX(1.00)', opacity: 0.45 },
      { transform: 'scaleY(1.25) scaleX(1.15)', opacity: 0.75 },
      { transform: 'scaleY(1.05) scaleX(1.08)', opacity: 0.55 }
    ], { duration: 380, iterations: Infinity, easing: 'ease-in-out' }));
  }

  // Particle storm — emit sparks downward and outward from the engine bell area.
  const engineX = 0;        // viewBox center
  const engineY = 100;      // bottom-middle of the rocket
  const spawn = () => {
    if (cancelled) return;
    // Bias particles to fan out downward
    for (let k = 0; k < 2; k++) {
      const startX = engineX + (Math.random() - 0.5) * 26;
      const startY = engineY + Math.random() * 18;
      const endX = startX + (Math.random() - 0.5) * 220;
      const endY = startY + 200 + Math.random() * 180;
      Stage.emitParticle(partsG, startX, startY, endX, endY, 1100 + Math.random() * 500);
    }
  };

  // Slight delay before the flames "catch" — feels more realistic.
  timers.push(setTimeout(() => {
    if (cancelled) return;
    flameInner.style.opacity = '1';
    flameOuter.style.opacity = '0.75';
    spawn();
    interval = setInterval(spawn, 75);
  }, 350));

  return () => {
    cancelled = true;
    if (typewriterCleanup) typewriterCleanup();
    timers.forEach(clearTimeout);
    if (interval) clearInterval(interval);
    animations.forEach(a => { try { a.cancel(); } catch (e) {} });
  };
}

Stage.register({
  section: 3,
  title: '02 · Ignition',
  render(el) {
    el.innerHTML = `
      <div style="display:flex;flex-direction:column;align-items:center;gap:1.4rem;width:100%;">
        <div class="ignition-label" style="
          font-family: var(--mono);
          font-size: clamp(0.7rem, 1.1vw, 0.85rem);
          letter-spacing: 0.42em;
          color: var(--accent);
          text-shadow: 0 0 14px var(--accent-glow);
          text-transform: uppercase;
          min-height: 1.2em;
        "></div>
        <div class="ignition-wrap">
          <svg class="ignition-svg" viewBox="-150 -260 300 520" preserveAspectRatio="xMidYMid meet">
            <defs>
              <!-- Flame plume gradient: bright amber core fading to deep red. -->
              <radialGradient id="flameGradInner" cx="0" cy="0" r="1">
                <stop offset="0%"  stop-color="#FFF1C9" stop-opacity="1"/>
                <stop offset="35%" stop-color="#FFB454" stop-opacity="0.95"/>
                <stop offset="75%" stop-color="#FF6B30" stop-opacity="0.5"/>
                <stop offset="100%" stop-color="#FF6B30" stop-opacity="0"/>
              </radialGradient>
              <radialGradient id="flameGradOuter" cx="0" cy="0" r="1">
                <stop offset="0%"  stop-color="#FFB454" stop-opacity="0.6"/>
                <stop offset="60%" stop-color="#FF6B30" stop-opacity="0.35"/>
                <stop offset="100%" stop-color="#FF6B30" stop-opacity="0"/>
              </radialGradient>
              <!-- Subtle highlight on the rocket body. -->
              <linearGradient id="bodyGrad" x1="0" x2="1" y1="0" y2="0">
                <stop offset="0%"   stop-color="#1A1A1A"/>
                <stop offset="50%"  stop-color="#3A3A3A"/>
                <stop offset="100%" stop-color="#1A1A1A"/>
              </linearGradient>
            </defs>

            <!-- Outer flame plume (huge, soft, behind everything) -->
            <ellipse id="flame-outer"
              cx="0" cy="170" rx="120" ry="170"
              fill="url(#flameGradOuter)"
              style="transform-origin: 0px 100px; opacity: 0;"></ellipse>

            <!-- Inner flame plume (bright core) -->
            <ellipse id="flame-inner"
              cx="0" cy="135" rx="48" ry="100"
              fill="url(#flameGradInner)"
              style="transform-origin: 0px 100px; opacity: 0;"></ellipse>

            <!-- Sparks layer — Stage.emitParticle appends circles here. -->
            <g id="sparks"></g>

            <!-- Saturn V silhouette: extremely stylised — three-stage stack
                 with engine bell skirt at the base. Simplified for graphic clarity. -->
            <g id="rocket">
              <!-- Conical nose (Launch Escape System + Command Module) -->
              <polygon points="0,-250  -8,-210  8,-210" fill="#E5E2D6"/>
              <!-- LES tower struts -->
              <line x1="0" y1="-250" x2="0" y2="-215" stroke="#8B8676" stroke-width="2"/>
              <!-- Command + Service Module + S-IVB taper -->
              <polygon points="-12,-210 12,-210 14,-180 -14,-180" fill="#E5E2D6"/>
              <rect x="-14" y="-180" width="28" height="40" fill="#E5E2D6"/>
              <polygon points="-14,-140 -22,-110 22,-110 14,-140" fill="url(#bodyGrad)"/>
              <!-- S-II second stage -->
              <rect x="-22" y="-110" width="44" height="90" fill="#E5E2D6"/>
              <rect x="-22" y="-50"  width="44" height="6"  fill="#1A1A1A"/>
              <rect x="-22" y="-90"  width="44" height="6"  fill="#1A1A1A"/>
              <!-- USA + flag stripe area -->
              <text x="0" y="-72" fill="#1A1A1A" font-family="JetBrains Mono, monospace" font-size="9" text-anchor="middle" font-weight="700">USA</text>
              <!-- S-IC first stage (tallest, widest) -->
              <rect x="-30" y="-20" width="60" height="100" fill="#E5E2D6"/>
              <!-- Fins -->
              <polygon points="-30,80 -50,100 -30,100" fill="#3A3A3A"/>
              <polygon points=" 30,80  50,100  30,100" fill="#3A3A3A"/>
              <!-- Black/white roll patterns on first stage -->
              <rect x="-30" y="10"  width="60" height="14" fill="#1A1A1A"/>
              <rect x="-30" y="55"  width="60" height="6"  fill="#1A1A1A"/>
              <!-- Engine skirt (slightly wider at bottom) -->
              <polygon points="-30,80 30,80 36,100 -36,100" fill="#3A3A3A"/>
              <!-- Five F-1 engine bells (4 outer + 1 center) -->
              <g fill="#1A1A1A">
                <rect x="-28" y="100" width="10" height="14"/>
                <rect x="-10" y="100" width="10" height="14"/>
                <rect x="  8" y="100" width="10" height="14"/>
                <rect x=" 18" y="100" width="10" height="14"/>
              </g>
              <!-- Center bell glow -->
              <circle cx="0" cy="106" r="6" fill="#FFB454" opacity="0.8"/>
            </g>
          </svg>
        </div>
      </div>
    `;
  },
  init(el)   { return playIgnition(el); },
  replay(el) { this.render(el); return playIgnition(el); }
}, {
  notes: [
    'BESPOKE IGNITION. The Saturn V silhouette holds still. The flame plume "breathes" via two layered ellipses with separate Web Animations API loops, and SVG particle sparks throw outward at ~75ms intervals.',
    'Presenter cue: this slide is a moment, not a paragraph. Say a single sentence — "All five F-1 engines roar to life, generating 7.6 million pounds of thrust" — and let the visual carry the rest.',
    'Historical: The five F-1 engines ignited at T-8.9 seconds. Hold-down arms released at T-0. The vehicle cleared the tower at T+13 seconds.'
  ].join(' ')
});
