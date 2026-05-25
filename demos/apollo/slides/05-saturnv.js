'use strict';

/**
 * Saturn V — the rocket. ImageText: image left, text right.
 * Source photo: Apollo 11 launch (S-IC ignition + initial climb).
 */
Stage.register(Stage.ImageText({
  section: 2,
  title: '02 · Saturn V',
  side: 'left',
  image: {
    src: 'https://upload.wikimedia.org/wikipedia/commons/1/16/Apollo_11_Launch_-_GPN-2000-000630.jpg',
    alt: 'Apollo 11 Saturn V launching from Pad 39A, Kennedy Space Center, 16 July 1969'
  },
  heading: 'A skyscraper that flew.',
  body: [
    '363 feet tall — taller than the Statue of Liberty including its pedestal.',
    'Three stages, 6.5 million pounds fully fueled.',
    'Five F-1 engines at the base, burning 15 tonnes of kerosene per second.',
    'Designed under Wernher von Braun. Never lost a crew.'
  ].join('\n'),
  caption: 'Photo: NASA / Wikimedia Commons',
  reveal: 'staggered'
}), {
  notes: [
    'The Saturn V remains the tallest, heaviest, and most powerful rocket ever to fly humans. 13 launched between 1967 and 1973. 12 successful, 1 partially successful (Apollo 6, uncrewed test).',
    'Three stages: S-IC (kerosene/LOX, 5× F-1), S-II (LH2/LOX, 5× J-2), S-IVB (LH2/LOX, 1× J-2 — restartable for translunar injection).',
    'The F-1 engine is still the most powerful single-chamber liquid-fuel rocket engine ever flown. SpaceX Raptor and BE-4 are individually smaller but flown in larger clusters.',
    'Wernher von Braun led the design at Marshall Space Flight Center in Huntsville, Alabama. His past at Peenemünde (V-2) remains the moral knot of the program.'
  ].join(' ')
});
