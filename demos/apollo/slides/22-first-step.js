'use strict';

/**
 * The Aldrin visor reflection — arguably the most famous photograph ever taken.
 */
Stage.register(Stage.FullImage({
  section: 6,
  title: '05 · First step',
  image: {
    src: 'https://upload.wikimedia.org/wikipedia/commons/9/98/Aldrin_Apollo_11_original.jpg',
    alt: 'Buzz Aldrin on the lunar surface, photographed by Neil Armstrong. The photographer is visible in the gold visor reflection.'
  },
  overlay: {
    position: 'bottom-left',
    headline: '20:17 UTC · 20 July 1969',
    body: 'Buzz Aldrin · Sea of Tranquility · photographed by Armstrong'
  }
}), {
  notes: [
    'AS11-40-5903. Photographed by Neil Armstrong with a Hasselblad 500EL using a 60mm Zeiss lens. The photographer (Armstrong, the LM, and the Earth) is visible in Aldrin\'s gold-coated visor.',
    'Aldrin is wearing the Portable Life Support System (PLSS) backpack. The reddish-brown patch on his right shoulder is the OPS — Oxygen Purge System, a 30-minute emergency reserve.',
    'Total time on the lunar surface: 21 hours 36 minutes. Total time walking outside the LM: 2 hours 31 minutes.',
    'Hold this slide. Hold it long. Photo: NASA / Wikimedia Commons.'
  ].join(' ')
});
