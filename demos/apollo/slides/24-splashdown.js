'use strict';

/**
 * Splashdown — Pacific Ocean, 24 July 1969.
 */
Stage.register(Stage.ImageText({
  section: 7,
  title: '06 · Splashdown',
  side: 'left',
  image: {
    src: 'https://upload.wikimedia.org/wikipedia/commons/2/28/Splashdown_3.jpg',
    alt: 'Apollo 11 Command Module Columbia in the Pacific after splashdown, 24 July 1969'
  },
  heading: 'Splashdown.',
  body: [
    '24 July 1969. 16:50:35 UTC.',
    'Pacific Ocean, 380 miles southwest of Honolulu.',
    'USS Hornet recovers the crew. Three weeks in quarantine.',
    'Just in case they had brought something back with them.'
  ].join('\n'),
  caption: 'Photo: NASA / Wikimedia Commons',
  reveal: 'staggered'
}), {
  notes: [
    'Columbia reentered the atmosphere at 11 km/s. The plasma sheath blacked out comms for ~4 minutes.',
    'Three main parachutes deployed at 3,000 m. Splashdown 16:50:35 UTC on 24 July 1969.',
    'The crew were recovered by USS Hornet (CVS-12), an Essex-class carrier. President Nixon was aboard to greet them — through the glass of the Mobile Quarantine Facility.',
    'They spent 21 days in quarantine, mostly in a converted Airstream trailer aboard the carrier, then at the Lunar Receiving Laboratory in Houston. No lunar pathogens existed, of course — but that was the point: nobody knew.'
  ].join(' ')
});
