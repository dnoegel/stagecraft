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

    // Content / typography family (8)
    { src: 'slides/content-70-statement.js',  transition: 'fade' },
    { src: 'slides/content-71-qanda.js',      transition: 'dissolve' },
    { src: 'slides/content-72-manifesto.js',  transition: 'slide' },
    { src: 'slides/content-73-punchline.js',  transition: 'zoom-in' },
    { src: 'slides/content-74-definition.js', transition: 'typewriter' },
    { src: 'slides/content-75-image-grid.js', transition: 'wipe' },
    { src: 'slides/content-76-spotlight.js',  transition: 'iris' },
    { src: 'slides/content-77-marquee.js',    transition: 'push' },

    // Business / marketing family (10)
    { src: 'slides/business-60-pricing.js',       transition: 'fade' },
    { src: 'slides/business-61-testimonial.js',   transition: 'dissolve' },
    { src: 'slides/business-62-team.js',          transition: 'slide' },
    { src: 'slides/business-63-agenda.js',        transition: 'push' },
    { src: 'slides/business-64-checklist.js',     transition: 'wipe' },
    { src: 'slides/business-65-steps.js',         transition: 'fade' },
    { src: 'slides/business-66-cta.js',           transition: 'zoom-in' },
    { src: 'slides/business-67-callout.js',       transition: 'slide' },
    { src: 'slides/business-68-tip.js',           transition: 'fade' },
    { src: 'slides/business-69-before-after.js',  transition: 'iris' },

    // Data-visualization family (10)
    { src: 'slides/data-50-kpi.js',        transition: 'fade' },
    { src: 'slides/data-51-donut.js',      transition: 'iris' },
    { src: 'slides/data-52-line.js',       transition: 'wipe' },
    { src: 'slides/data-53-gauge.js',      transition: 'dissolve' },
    { src: 'slides/data-54-sparkline.js',  transition: 'slide' },
    { src: 'slides/data-55-heatmap.js',    transition: 'shutter' },
    { src: 'slides/data-56-roadmap.js',    transition: 'push' },
    { src: 'slides/data-57-swot.js',       transition: 'fade' },
    { src: 'slides/data-58-codeblock.js',  transition: 'typewriter' },
    { src: 'slides/data-59-codediff.js',   transition: 'dissolve' },

    { src: 'slides/07-thanks.js',      transition: 'zoom-in' }
  ]
});
