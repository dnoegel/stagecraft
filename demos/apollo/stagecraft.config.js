'use strict';

/**
 * Apollo 11 — One Small Step
 *
 * A 28-slide keynote-grade deck about the mission that put humans on the Moon
 * in July 1969. Painted in mission-control amber on the black of space, with
 * five fully bespoke centerpieces:
 *
 *   - 09 · The countdown (T-10 → LIFT-OFF, real-time digit cycling)
 *   - 10 · Ignition (SVG flame + particles + Saturn V silhouette)
 *   - 13 · Translunar trajectory (animated stroke-dasharray Earth → Moon)
 *   - 17 · 1202 alarm terminal log (streaming amber log lines)
 *   - 19 · GO. (the dramatic moment Bales cleared the alarm)
 *
 * Transitions are biased slow — fade / dissolve dominate. Glitch is reserved
 * for the alarm sequence. Cut is used only where we want a hard cinematic edit.
 */
Stage.deck({
  theme: 'phosphor',
  slides: [
    /* ACT I — THE PROMISE */
    { src: 'slides/00-title.js',          transition: 'fade'     },
    { src: 'slides/01-kennedy.js',        transition: 'dissolve' },
    { src: 'slides/02-distance.js',       transition: 'fade'     },
    { src: 'slides/03-section-crew.js',   transition: 'dissolve' },

    /* ACT II — THE CREW */
    { src: 'slides/04-crew.js',           transition: 'fade'     },
    { src: 'slides/05-saturnv.js',        transition: 'fade'     },
    { src: 'slides/06-armstrong-quote.js', transition: 'dissolve' },

    /* ACT III — THE COUNTDOWN */
    { src: 'slides/07-section-launch.js', transition: 'dissolve' },
    { src: 'slides/08-pad.js',            transition: 'fade'     },
    { src: 'slides/09-countdown.js',      transition: 'cut'      },
    { src: 'slides/10-ignition.js',       transition: 'cut'      },
    { src: 'slides/11-liftoff.js',        transition: 'fade'     },

    /* ACT IV — TRANSLUNAR COAST */
    { src: 'slides/12-section-coast.js',  transition: 'dissolve' },
    { src: 'slides/13-trajectory.js',     transition: 'fade'     },
    { src: 'slides/14-collins-quote.js',  transition: 'dissolve' },

    /* ACT V — THE LANDING */
    { src: 'slides/15-section-descent.js', transition: 'dissolve' },
    { src: 'slides/16-eagle.js',          transition: 'fade'     },
    { src: 'slides/17-alarm.js',          transition: 'glitch'   },
    { src: 'slides/18-luminary.js',       transition: 'fade'     },
    { src: 'slides/19-go.js',             transition: 'cut'      },
    { src: 'slides/20-tranquility.js',    transition: 'dissolve' },
    { src: 'slides/21-agc-stats.js',      transition: 'fade'     },

    /* ACT VI — FIRST STEP */
    { src: 'slides/22-first-step.js',     transition: 'fade'     },
    { src: 'slides/23-one-small-step.js', transition: 'dissolve' },

    /* ACT VII — RETURN */
    { src: 'slides/24-splashdown.js',     transition: 'fade'     },
    { src: 'slides/25-mission-stats.js',  transition: 'fade'     },

    /* ACT VIII — LEGACY */
    { src: 'slides/26-watched.js',        transition: 'dissolve' },
    { src: 'slides/27-program.js',        transition: 'fade'     },
    { src: 'slides/28-manifesto.js',      transition: 'dissolve' },
    { src: 'slides/29-forever.js',        transition: 'fade'     }
  ]
});
