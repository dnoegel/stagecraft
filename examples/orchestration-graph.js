'use strict';

/**
 * Cookbook · Orchestration Graph
 * ------------------------------
 * Technique: SVG hex graph with a center node and N satellites,
 * pulses + particles flowing inward.
 *
 * What to copy:
 *  - Polar-to-cartesian satellite layout: place N items on a circle
 *    by mapping each `angle` (degrees) to (cos, sin) * R.
 *  - The `document.createElementNS('http://www.w3.org/2000/svg', ...)`
 *    pattern — needed for SVG nodes; plain createElement won't render.
 *  - Staggered fade-in with per-item `setTimeout` offsets — gives
 *    the graph a "build itself" feel rather than popping in.
 *  - `Stage.emitParticle(parent, x1, y1, x2, y2, dur)` flowing
 *    satellite → center; combine with a transient `.active` class on
 *    the source node for a synchronized pulse.
 *  - Combined cleanup: track both setInterval AND setTimeout in one
 *    `intervals` array — `clearTimeout`/`clearInterval` are interchangeable
 *    in browsers for IDs from either, so a single cleanup loop works.
 */

function playOrchestrationGraph(el) {
  const nodesG = el.querySelector('#nodes');
  const edgesG = el.querySelector('#edges');
  const particlesG = el.querySelector('#particles');
  if (!nodesG) return () => {};
  nodesG.innerHTML = '';
  edgesG.innerHTML = '';
  particlesG.innerHTML = '';

  const satellites = [
    { id: 'n1', label: 'Node 1', angle: -90 },
    { id: 'n2', label: 'Node 2', angle: -30 },
    { id: 'n3', label: 'Node 3', angle:  30 },
    { id: 'n4', label: 'Node 4', angle:  90 },
    { id: 'n5', label: 'Node 5', angle: 150 },
    { id: 'n6', label: 'Node 6', angle: -150 },
  ];
  const R = 150;
  const nodeR = 40;

  const positions = { center: { x: 0, y: 0 } };
  satellites.forEach(s => {
    const rad = s.angle * Math.PI / 180;
    positions[s.id] = { x: Math.cos(rad) * R, y: Math.sin(rad) * R };
  });

  // edges
  satellites.forEach(s => {
    const p = positions[s.id];
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('class', 'edge');
    line.setAttribute('x1', 0);
    line.setAttribute('y1', 0);
    line.setAttribute('x2', p.x);
    line.setAttribute('y2', p.y);
    edgesG.appendChild(line);
  });

  // satellites
  satellites.forEach(s => {
    const p = positions[s.id];
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('transform', `translate(${p.x}, ${p.y})`);
    g.setAttribute('data-id', s.id);

    const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    c.setAttribute('class', 'node-circle');
    c.setAttribute('r', nodeR);
    g.appendChild(c);

    const t = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    t.setAttribute('class', 'node-label');
    t.textContent = s.label;
    g.appendChild(t);

    nodesG.appendChild(g);
  });

  // center node
  {
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    c.setAttribute('class', 'node-circle center');
    c.setAttribute('r', 52);
    g.appendChild(c);
    const t = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    t.setAttribute('class', 'node-label center');
    t.textContent = 'CORE';
    g.appendChild(t);
    nodesG.appendChild(g);
  }

  let cancelled = false;
  const intervals = [];

  // fade-in nodes + edges
  nodesG.querySelectorAll('g').forEach((n, i) => {
    n.style.opacity = '0';
    n.style.transition = 'opacity 500ms ease-out';
    setTimeout(() => { if (!cancelled) n.style.opacity = '1'; }, 200 + i * 120);
  });
  edgesG.querySelectorAll('line').forEach((e, i) => {
    e.style.opacity = '0';
    e.style.transition = 'opacity 700ms ease-out';
    setTimeout(() => { if (!cancelled) e.style.opacity = '1'; }, 600 + i * 80);
  });

  // particles flow inward (satellite → center)
  let pulseIdx = 0;
  const pulse = () => {
    if (cancelled) return;
    const s = satellites[pulseIdx % satellites.length];
    const nodeG = nodesG.querySelector(`[data-id="${s.id}"]`);
    const circle = nodeG?.querySelector('.node-circle');
    if (circle) {
      circle.classList.add('active');
      setTimeout(() => circle.classList.remove('active'), 700);
    }
    const p = positions[s.id];
    Stage.emitParticle(particlesG, p.x, p.y, 0, 0, 1100);
    pulseIdx++;
  };
  const startT = setTimeout(() => {
    pulse();
    intervals.push(setInterval(pulse, 900));
  }, 1400);
  intervals.push(startT);

  return () => {
    cancelled = true;
    intervals.forEach(clearTimeout);
    intervals.forEach(clearInterval);
  };
}

Stage.register({
  section: 2,
  title: 'Example · Orchestration Graph',
  render(el) {
    el.innerHTML = `
      <div class="graph-wrap">
        <svg class="graph-svg" viewBox="-200 -200 400 400">
          <g class="edges" id="edges"></g>
          <g class="particles" id="particles"></g>
          <g class="nodes" id="nodes"></g>
        </svg>
        <div class="graph-caption">The core coordinates <span style="color:var(--accent)">node 1 · node 2 · node 3 · …</span></div>
      </div>
    `;
  },
  init(el) { return playOrchestrationGraph(el); },
  replay(el) { return playOrchestrationGraph(el); }
});
