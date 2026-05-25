'use strict';

/**
 * 05 · Asakusa — ImageText with photo credit underneath.
 *
 * Photo: Senso-ji temple in Asakusa — Su San Lee on Unsplash.
 * https://unsplash.com/photos/red-and-white-temple-during-daytime-IUY_3DvM__w
 *
 * We extend the standard ImageText render so the Unsplash credit
 * sits as a small dim caption directly beneath the photo frame.
 */
const asakusa = Stage.ImageText({
  section: 3,
  title: 'Senso-ji, Asakusa',
  image: {
    src: 'https://images.unsplash.com/photo-1492571350019-22de08371fd3?w=1600&q=80&auto=format&fit=crop',
    alt: 'Senso-ji temple in Asakusa with red lanterns and pagoda'
  },
  side: 'left',
  heading: 'Senso-ji, half-empty.',
  body: 'Arrived just before noon, the tour groups already filtering out.\nIncense drifted in long ribbons across the courtyard.\nBought a 100-yen omikuji — drew a "small blessing."\nTied it to the rack and kept walking.',
  caption: 'tied a fortune to a fence in the wind',
  reveal: 'staggered'
});

// Patch render to append a photo-credit caption under the figure.
const originalRender = asakusa.render;
asakusa.render = function (el) {
  originalRender.call(this, el);
  const figure = el.querySelector('.it-figure');
  if (figure) {
    const credit = document.createElement('div');
    credit.className = 'it-photo-credit';
    credit.innerHTML = 'Photo by <a href="https://unsplash.com/@blackodc" target="_blank" rel="noopener">Su San Lee</a> on Unsplash';
    figure.parentNode.insertBefore(credit, figure.nextSibling);
  }
};

Stage.register(asakusa, {
  notes: 'Tell the omikuji story — the moment the fortune slip ripped a little when we tied it. The audience leans in for small physical details. Photo: Su San Lee on Unsplash.'
});
