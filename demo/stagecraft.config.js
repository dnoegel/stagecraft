'use strict';

Stage.deck({
  theme: 'phosphor',
  slides: [
    { src: 'slides/00-title.js' },
    { src: 'slides/01-section.js',     transition: 'glitch' },

    // Original 6 components
    { src: 'slides/02-activities.js',  transition: 'slide' },
    { src: 'slides/03-compare.js',     transition: 'dissolve' },
    { src: 'slides/04-counter.js',     transition: 'fade' },
    { src: 'slides/05-shift.js',       transition: 'flip' },
    { src: 'slides/06-custom.js',      transition: 'shatter' },

    // Layout family (6)
    { src: 'slides/layout-20-image-text.js',  transition: 'push' },
    { src: 'slides/layout-21-full-image.js',  transition: 'iris' },
    { src: 'slides/layout-22-quote.js',       transition: 'zoom-in' },
    { src: 'slides/layout-23-big-number.js',  transition: 'zoom-out' },
    { src: 'slides/layout-24-stats.js',       transition: 'dissolve' },
    { src: 'slides/layout-25-bento.js',       transition: 'wipe' },

    // Diagram family (5)
    { src: 'slides/diagram-30-pillars.js',    transition: 'fade' },
    { src: 'slides/diagram-31-timeline.js',   transition: 'slide' },
    { src: 'slides/diagram-32-pyramid.js',    transition: 'dissolve' },
    { src: 'slides/diagram-33-cycle.js',      transition: 'iris' },
    { src: 'slides/diagram-34-funnel.js',     transition: 'wipe' },

    // Chart family (5)
    { src: 'slides/chart-40-matrix.js',       transition: 'shutter' },
    { src: 'slides/chart-41-barchart.js',     transition: 'fade' },
    { src: 'slides/chart-42-progress.js',     transition: 'typewriter' },
    { src: 'slides/chart-43-processflow.js',  transition: 'push' },
    { src: 'slides/chart-44-venn.js',         transition: 'iris' },

    { src: 'slides/07-thanks.js',      transition: 'zoom-in' }
  ]
});
