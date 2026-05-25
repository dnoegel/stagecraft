'use strict';

/**
 * 09 · Quiet garden, reflective text — ImageText, image on right.
 *
 * Photo: Japanese zen garden — Tianshu Liu on Unsplash.
 * https://unsplash.com/photos/green-trees-near-body-of-water-during-daytime-bra9PUtPP90
 */
const garden = Stage.ImageText({
  section: 5,
  title: 'a garden in Kyoto',
  image: {
    src: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=1600&q=80&auto=format&fit=crop',
    alt: 'A serene Japanese garden with raked gravel, stones, and moss'
  },
  side: 'right',
  heading: 'On the quiet at Ryoan-ji.',
  body: 'Fifteen stones, and you cannot see all of them from any one place.\nThe whole point, supposedly, is the stone you cannot see.\nI sat on the wood deck for forty minutes without checking my phone.\nThat felt like an achievement, which made me embarrassed.',
  caption: 'forty minutes, no phone',
  reveal: 'staggered'
});

const originalRender = garden.render;
garden.render = function (el) {
  originalRender.call(this, el);
  const figure = el.querySelector('.it-figure');
  if (figure) {
    const credit = document.createElement('div');
    credit.className = 'it-photo-credit';
    credit.innerHTML = 'Photo by <a href="https://unsplash.com/@nullnumeric" target="_blank" rel="noopener">Tianshu Liu</a> on Unsplash';
    figure.parentNode.insertBefore(credit, figure.nextSibling);
  }
};

Stage.register(garden, {
  notes: 'Reflective beat. The pace slows here on purpose. Talk about the deliberate restraint of the garden — and how strange it is to feel proud of being still. Photo: Tianshu Liu on Unsplash.'
});
