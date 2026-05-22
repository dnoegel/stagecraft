'use strict';

Stage.deck({
  theme: 'phosphor',
  slides: [
    { src: 'slides/00-title.js' },
    { src: 'slides/01-section.js',  transition: 'fade' },
    { src: 'slides/02-activities.js', transition: 'slide' },
    { src: 'slides/03-compare.js', transition: 'dissolve' },
    { src: 'slides/04-counter.js', transition: 'fade' },
    { src: 'slides/05-shift.js', transition: 'glitch' },
    { src: 'slides/06-custom.js', transition: 'wipe' },
    { src: 'slides/07-thanks.js', transition: 'fade' }
  ]
});
