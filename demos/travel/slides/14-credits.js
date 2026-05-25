'use strict';

/**
 * 14 · Thanks + photo credits.
 *
 * Bespoke slide. KineticText-style intro line ("thanks for reading.")
 * staggers in, followed by a tidy list of all Unsplash photographers
 * used in the deck, each as a clickable attribution line.
 *
 * The Unsplash license requires per-photo credit + link; this slide
 * is the on-deck home for that, in addition to the per-slide notes.
 */
Stage.register({
  section: 7,
  title: 'thanks · credits',
  render(el) {
    el.innerHTML = `
      <div class="travel-credits" style="
        max-width: min(880px, 86vw);
        margin: 0 auto;
        text-align: left;
      ">
        <div class="cr-intro" style="
          font-family: var(--display);
          font-style: italic;
          font-weight: 500;
          font-size: clamp(2.4rem, 5vw, 4.2rem);
          line-height: 1.08;
          color: var(--fg);
          letter-spacing: -0.015em;
          margin-bottom: 0.4em;
          opacity: 0;
          transform: translateY(8px);
          transition: opacity 700ms ease, transform 700ms ease;
        ">
          Thanks for reading.
        </div>

        <div class="cr-sub" style="
          font-family: var(--hand);
          font-size: 1.65rem;
          color: var(--accent);
          margin-bottom: 2.2rem;
          opacity: 0;
          transform: translateY(6px);
          transition: opacity 700ms ease, transform 700ms ease;
        ">
          all photos by people more talented than me &mdash;
        </div>

        <ul class="cr-list" style="
          list-style: none;
          padding: 0;
          margin: 0;
          font-family: var(--body);
          font-weight: 300;
          color: var(--fg);
          font-size: 1.05rem;
          line-height: 1.7;
          display: grid;
          grid-template-columns: 1fr;
          gap: 0.35rem;
        ">
          <li class="cr-row"><span class="cr-tag">shibuya crossing</span><span class="cr-by">Photo by <a href="https://unsplash.com/@jezar" target="_blank" rel="noopener">Jezael Melgoza</a> on <a href="https://unsplash.com" target="_blank" rel="noopener">Unsplash</a></span></li>
          <li class="cr-row"><span class="cr-tag">senso-ji</span><span class="cr-by">Photo by <a href="https://unsplash.com/@blackodc" target="_blank" rel="noopener">Su San Lee</a> on <a href="https://unsplash.com" target="_blank" rel="noopener">Unsplash</a></span></li>
          <li class="cr-row"><span class="cr-tag">ramen, 11pm</span><span class="cr-by">Photo by <a href="https://unsplash.com/@thomasmarban" target="_blank" rel="noopener">Thomas Marban</a> on <a href="https://unsplash.com" target="_blank" rel="noopener">Unsplash</a></span></li>
          <li class="cr-row"><span class="cr-tag">marunouchi line</span><span class="cr-by">Photo by <a href="https://unsplash.com/@liamburnettblue" target="_blank" rel="noopener">Liam Burnett-Blue</a> on <a href="https://unsplash.com" target="_blank" rel="noopener">Unsplash</a></span></li>
          <li class="cr-row"><span class="cr-tag">kabukicho neon</span><span class="cr-by">Photo by <a href="https://unsplash.com/@jezar" target="_blank" rel="noopener">Jezael Melgoza</a> on <a href="https://unsplash.com" target="_blank" rel="noopener">Unsplash</a></span></li>
          <li class="cr-row"><span class="cr-tag">sakura, april</span><span class="cr-by">Photo by <a href="https://unsplash.com/@sorasagano" target="_blank" rel="noopener">Sora Sagano</a> on <a href="https://unsplash.com" target="_blank" rel="noopener">Unsplash</a></span></li>
          <li class="cr-row"><span class="cr-tag">ryoan-ji garden</span><span class="cr-by">Photo by <a href="https://unsplash.com/@nullnumeric" target="_blank" rel="noopener">Tianshu Liu</a> on <a href="https://unsplash.com" target="_blank" rel="noopener">Unsplash</a></span></li>
        </ul>

        <div class="cr-foot" style="
          margin-top: 2.4rem;
          font-family: var(--hand);
          font-size: 1.5rem;
          color: var(--blue);
          letter-spacing: 0.02em;
          opacity: 0;
          transform: translateY(6px);
          transition: opacity 700ms ease, transform 700ms ease;
        ">
          &mdash; D. &middot; somewhere over the Pacific
        </div>
      </div>
    `;

    // Style the rows inline so this works without touching theme.css.
    el.querySelectorAll('.cr-row').forEach(row => {
      row.style.display = 'grid';
      row.style.gridTemplateColumns = '220px 1fr';
      row.style.gap = '1.2rem';
      row.style.alignItems = 'baseline';
      row.style.opacity = '0';
      row.style.transform = 'translateY(6px)';
      row.style.transition = 'opacity 600ms ease, transform 600ms ease';
      row.style.paddingBlock = '0.18rem';
      row.style.borderTop = '1px dotted var(--dim-2)';
    });
    el.querySelectorAll('.cr-tag').forEach(t => {
      t.style.fontFamily = 'var(--hand)';
      t.style.fontSize = '1.25rem';
      t.style.color = 'var(--accent)';
      t.style.letterSpacing = '0.02em';
    });
    el.querySelectorAll('.cr-by').forEach(b => {
      b.style.color = 'var(--fg)';
      b.style.opacity = '0.85';
    });
    el.querySelectorAll('.cr-by a').forEach(a => {
      a.style.color = 'var(--blue)';
      a.style.textDecoration = 'underline dotted';
      a.style.textUnderlineOffset = '2px';
    });
  },
  init(el) {
    const intro = el.querySelector('.cr-intro');
    const sub   = el.querySelector('.cr-sub');
    const rows  = el.querySelectorAll('.cr-row');
    const foot  = el.querySelector('.cr-foot');
    const timers = [];

    const reveal = (node, delay) => timers.push(setTimeout(() => {
      if (!node) return;
      node.style.opacity = '1';
      node.style.transform = 'translateY(0)';
    }, delay));

    reveal(intro, 150);
    reveal(sub,   600);
    rows.forEach((r, i) => reveal(r, 1000 + i * 140));
    reveal(foot,  1000 + rows.length * 140 + 400);

    return () => timers.forEach(clearTimeout);
  },
  replay(el) {
    el.querySelectorAll('.cr-intro, .cr-sub, .cr-row, .cr-foot').forEach(n => {
      n.style.opacity = '0';
      n.style.transform = 'translateY(6px)';
    });
    return this.init(el);
  }
}, {
  notes: 'Closing slide. Thank the audience, then give Unsplash and each photographer real credit. The Unsplash license requires per-photo attribution — this slide is the on-deck home for that.'
});
