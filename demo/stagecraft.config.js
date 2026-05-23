'use strict';

/**
 * Demo deck — a coherent presentation about Stagecraft itself.
 *
 * Transitions are intentionally varied across the deck so the picker's
 * 15 options each get demonstrated at least once. Sections are introduced
 * via SectionCard with the same `dissolve` transition for visual rhythm.
 */
Stage.deck({
  theme: "paper",
  slides: [/* 01 · Intro */
  {
    src: 'slides/00-title.js',
    transition: 'glitch'
  }, {
    src: 'slides/01-hook.js',
    transition: 'fade'
  }, {
    src: 'slides/02-thesis.js',
    transition: 'zoom-in'
  }, /* 02 · How it works */
  {
    src: 'slides/03-section-how.js',
    transition: 'dissolve'
  }, {
    src: 'slides/04-layers.js',
    transition: 'slide'
  }, {
    src: 'slides/05-anatomy.js',
    transition: 'typewriter'
  }, {
    src: 'slides/06-steps.js',
    transition: 'flip'
  }, /* 03 · The catalog */
  {
    src: 'slides/07-section-catalog.js',
    transition: 'dissolve'
  }, {
    src: 'slides/08-fifty.js',
    transition: 'zoom-in'
  }, {
    src: 'slides/09-counts.js',
    transition: 'shutter'
  }, {
    src: 'slides/10-vs.js',
    transition: 'flip'
  }, /* 04 · Showcase */
  {
    src: 'slides/11-section-show.js',
    transition: 'dissolve'
  }, {
    src: 'slides/12-quote.js',
    transition: 'iris'
  }, {
    src: 'slides/13-bento.js',
    transition: 'wipe'
  }, {
    src: 'slides/14-timeline.js',
    transition: 'slide'
  }, {
    src: 'slides/15-cycle.js',
    transition: 'iris'
  }, {
    src: 'slides/16-funnel.js',
    transition: 'fade'
  }, {
    src: 'slides/17-matrix.js',
    transition: 'shutter'
  }, {
    src: 'slides/18-barchart.js',
    transition: 'fade'
  }, {
    src: 'slides/19-progress.js',
    transition: 'push'
  }, {
    src: 'slides/20-processflow.js',
    transition: 'push'
  }, {
    src: 'slides/21-kpi.js',
    transition: 'zoom-in'
  }, {
    src: 'slides/22-codeblock.js',
    transition: 'typewriter'
  }, {
    src: 'slides/23-pricing.js',
    transition: 'push'
  }, {
    src: 'slides/24-heatmap.js',
    transition: 'dissolve'
  }, /* 05 · Edit mode */
  {
    src: 'slides/25-section-edit.js',
    transition: 'dissolve'
  }, {
    src: 'slides/26-toggle.js',
    transition: 'typewriter'
  }, {
    src: 'slides/27-loop.js',
    transition: 'slide'
  }, {
    src: 'slides/28-features.js',
    transition: 'slide'
  }, {
    src: 'slides/29-shortcuts.js',
    transition: 'fade'
  }, /* 06 · Presenter */
  {
    src: 'slides/30-section-presenter.js',
    transition: 'dissolve'
  }, {
    src: 'slides/31-multi.js',
    transition: 'flip'
  }, {
    src: 'slides/32-anatomy-pres.js',
    transition: 'slide'
  }, /* 07 · Themes */
  {
    src: 'slides/33-section-themes.js',
    transition: 'dissolve'
  }, {
    src: 'slides/34-themes-pillars.js',
    transition: 'slide'
  }, {
    src: 'slides/35-shopware.js',
    transition: 'iris'
  }, /* 08 · Outro */
  {
    src: 'slides/36-section-outro.js',
    transition: 'dissolve'
  }, {
    src: 'slides/37-final.js',
    transition: 'zoom-in'
  }, {
    src: 'slides/38-cta.js',
    transition: 'shatter'
  }, {
    src: 'slides/39-thanks.js',
    transition: 'glitch'
  }]
});