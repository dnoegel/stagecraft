'use strict';

/**
 * 02 · Shibuya at night — full-bleed hero.
 *
 * Photo: Shibuya crossing at night — Jezael Melgoza on Unsplash.
 * https://unsplash.com/photos/people-walking-on-pedestrian-lane-during-night-time-layMbSJ3YOE
 *
 * We extend FullImage with a small on-slide photo credit so the
 * Unsplash attribution is visible even without speaker notes.
 */
const shibuya = Stage.FullImage({
  section: 2,
  title: 'Shibuya · midnight',
  image: {
    src: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=1920&q=80&auto=format&fit=crop',
    alt: 'Shibuya crossing at night, neon-lit, crowds in motion'
  },
  overlay: {
    position: 'bottom-left',
    headline: 'Shibuya.',
    body: 'Midnight, raining a little.'
  }
});

const baseInit = shibuya.init;
shibuya.init = function (el) {
  // Add a tiny photographer credit chip in the bottom-right.
  const credit = document.createElement('div');
  credit.className = 'photo-credit';
  credit.style.position = 'absolute';
  credit.style.right = '1.4rem';
  credit.style.bottom = '1rem';
  credit.style.color = '#FFFFFF';
  credit.style.opacity = '0.65';
  credit.style.zIndex = '5';
  credit.innerHTML = 'Photo by <a href="https://unsplash.com/@jezar" target="_blank" rel="noopener">Jezael Melgoza</a> on Unsplash';
  el.appendChild(credit);
  return baseInit.call(this, el);
};

Stage.register(shibuya, {
  notes: 'Talk over the photo. The neon, the crowds, the way nobody in Tokyo seems to walk slowly. Note that this is one of the busiest pedestrian crossings on the planet — supposedly up to 3,000 people cross at once during peak. Photo: Jezael Melgoza on Unsplash (https://unsplash.com/@jezar).'
});
