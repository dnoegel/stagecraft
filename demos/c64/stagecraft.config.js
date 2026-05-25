'use strict';

/**
 * C64 deck — Eight bits that changed everything.
 *
 * A 15-slide history-and-vibe tour of the Commodore 64, painted in its
 * original startup-screen palette. The theme is phosphor with a C64 override
 * (see theme.css).
 */
Stage.deck({
  theme: 'phosphor',
  slides: [
    /* 01 · Intro */
    { src: 'slides/00-title.js',         transition: 'fade'       },
    { src: 'slides/01-ready.js',         transition: 'cut'        },

    /* 02 · Born 1982 */
    { src: 'slides/02-section-born.js',  transition: 'dissolve'   },
    { src: 'slides/03-jan-1982.js',      transition: 'fade'       },
    { src: 'slides/04-price.js',         transition: 'zoom-in'    },
    { src: 'slides/05-stats.js',         transition: 'shutter'    },

    /* 03 · The chips that made it */
    { src: 'slides/06-section-chips.js', transition: 'dissolve'   },
    { src: 'slides/07-chips.js',         transition: 'slide'      },

    /* 04 · Best-seller + games */
    { src: 'slides/08-bestseller.js',    transition: 'fade'       },
    { src: 'slides/09-section-games.js', transition: 'dissolve'   },
    { src: 'slides/10-games.js',         transition: 'slide'      },

    /* 05 · Legacy */
    { src: 'slides/11-demoscene.js',     transition: 'glitch'     },
    { src: 'slides/12-legacy.js',        transition: 'fade'       },
    { src: 'slides/13-shift.js',         transition: 'wipe'       },

    /* 06 · Closing */
    { src: 'slides/14-run64.js',         transition: 'typewriter' }
  ]
});
