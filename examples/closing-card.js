'use strict';

/**
 * Cookbook · Closing Card
 * -----------------------
 * Technique: a staggered-reveal closing slide with a live-rendered QR
 * code, theme-matched, with a graceful URL-text fallback if the CDN
 * dependency fails to load.
 *
 * Dependency:
 *  This slide expects `qrcode-generator` (global `qrcode` function) to be
 *  loaded ahead of it. Add to your index.html:
 *    <script src="https://cdn.jsdelivr.net/npm/qrcode-generator@1.4.4/qrcode.min.js"></script>
 *  The slide expects a URL at `Stage.CLOSING_URL` (set it from your config
 *  or inline before the deck boots).
 *
 * What to copy:
 *  - The fallback-first DOM: the markup ships with the URL rendered as
 *    text inside `#qrFrame`. If the QR library loads, `renderQR` replaces
 *    that content with an inline SVG. If not, the text remains — no
 *    "broken image" state, no error UI.
 *  - String-rewriting the QR library's SVG (`fill="black"` → theme color)
 *    instead of restyling via CSS — `qrcode-generator` emits raw SVG, so
 *    a regex replace is the most direct path to a theme-matched code.
 *  - `Stage.staggerIn(el.querySelectorAll('.stagger > *'), 180)` for a
 *    soft sequential reveal. Pair with `.stagger > *` CSS in your theme
 *    (initial opacity 0; `.in` class triggers transition).
 *  - The `<div class="thanks-underline">` is intentionally empty — pure
 *    CSS decoration to ground the headline.
 */

function renderQR(el) {
  const frame = el.querySelector('#qrFrame');
  if (!frame) return;
  if (typeof qrcode !== 'function') return; // CDN failed — fallback stays
  try {
    const qr = qrcode(0, 'M');
    qr.addData(Stage.CLOSING_URL);
    qr.make();
    const svg = qr.createSvgTag({ cellSize: 6, margin: 2, scalable: true });
    const themed = svg
      .replace(/fill="black"/g, 'fill="#E6E6E6"')
      .replace(/fill="white"/g, 'fill="#0d0d0d"')
      .replace(/<svg /, '<svg style="width:240px;height:240px;display:block;" ');
    frame.innerHTML = themed;
  } catch (e) {
    console.warn('QR render failed', e);
  }
}

Stage.register({
  section: 5,
  title: 'Example · Closing Card',
  render(el) {
    el.innerHTML = `
      <div class="closing-wrap stagger">
        <div class="pre-label blue"><span class="dot"></span>Continue the conversation</div>
        <div class="qr-frame" id="qrFrame">
          <div class="qr-fallback">${Stage.CLOSING_URL}</div>
        </div>
        <div class="thanks">Thank you.</div>
        <div class="thanks-underline"></div>
        <div class="thanks-names">
          <strong>Presenter One</strong>&nbsp;&nbsp;·&nbsp;&nbsp;<strong>Presenter Two</strong>
        </div>
        <div class="thanks-url"><span class="accent-blue">→</span>&nbsp;&nbsp;${Stage.CLOSING_URL}</div>
      </div>
    `;
  },
  init(el) {
    Stage.staggerIn(el.querySelectorAll('.stagger > *'), 180);
    renderQR(el);
  }
});
