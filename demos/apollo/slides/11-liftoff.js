'use strict';

/**
 * FullImage hero of Saturn V liftoff — the photograph.
 */
Stage.register(Stage.FullImage({
  section: 3,
  title: '02 · Liftoff',
  image: {
    src: 'https://upload.wikimedia.org/wikipedia/commons/1/16/Apollo_11_Launch_-_GPN-2000-000630.jpg',
    alt: 'Apollo 11 launches from Pad 39A, 16 July 1969'
  },
  overlay: {
    position: 'bottom-left',
    headline: '13:32 UTC',
    body: '16 July 1969 · we left the ground'
  }
}), {
  notes: [
    'Hold this slide. The photograph carries it. No talking for at least three seconds.',
    'The Saturn V cleared the tower at T+13 seconds. By T+1 minute it was 5.4 km up and supersonic. First-stage separation at T+2m 41s, altitude 67 km.',
    'Photo: NASA / Wikimedia Commons.'
  ].join(' ')
});
