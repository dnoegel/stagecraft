'use strict';

/**
 * Tokyo · April 2026 — a 7-day travel diary.
 *
 * Image-heavy, magazine-feel. Built on the Paper theme with warm cream
 * tokens, Cormorant Garamond serif display, and a Caveat handwritten
 * accent. All photographs are Unsplash; attribution lives in each slide.
 */
Stage.deck({
  theme: 'paper',
  slides: [
    /* Opening beat */
    { src: 'slides/00-title.js',            transition: 'fade' },

    /* Day 1 — arrival */
    { src: 'slides/01-day1.js',             transition: 'dissolve' },
    { src: 'slides/02-shibuya.js',          transition: 'iris' },
    { src: 'slides/03-night-quote.js',      transition: 'fade' },

    /* Day 2 — Asakusa */
    { src: 'slides/04-day2.js',             transition: 'dissolve' },
    { src: 'slides/05-asakusa.js',          transition: 'slide' },

    /* Day 3 — gallery wall */
    { src: 'slides/06-gallery.js',          transition: 'wipe' },

    /* Day 4 — Kyoto detour */
    { src: 'slides/07-day4.js',             transition: 'dissolve' },
    { src: 'slides/08-passengers.js',       transition: 'zoom-in' },

    /* Day 5/6 — garden reflection */
    { src: 'slides/09-garden.js',           transition: 'fade' },

    /* Day 7 — departure */
    { src: 'slides/10-day7.js',             transition: 'dissolve' },
    { src: 'slides/11-leaving-quote.js',    transition: 'fade' },
    { src: 'slides/12-goodbye.js',          transition: 'dissolve' },

    /* Closing */
    { src: 'slides/13-eastern-capital.js',  transition: 'iris' },
    { src: 'slides/14-credits.js',          transition: 'fade' }
  ]
});
