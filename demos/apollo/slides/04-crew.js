'use strict';

/**
 * The crew. TeamGrid with three cards, real Wikimedia photos cropped from the
 * Apollo 11 crew portrait. We use the full crew portrait once at the top via
 * a wide overlay slide elsewhere; here, the focus is on each name + role.
 */
Stage.register(Stage.TeamGrid({
  section: 2,
  title: '02 · The crew',
  columns: 3,
  reveal: 'staggered',
  people: [
    {
      name: 'Neil Armstrong',
      role: 'Commander',
      bio: 'First human to set foot on the Moon. Civilian, former Navy aviator and X-15 test pilot. Said little. Did everything.'
    },
    {
      name: 'Buzz Aldrin',
      role: 'Lunar Module Pilot',
      bio: 'Second man on the Moon. Air Force colonel with a doctorate in astronautics from MIT — thesis: orbital rendezvous. He literally wrote the math.'
    },
    {
      name: 'Michael Collins',
      role: 'Command Module Pilot',
      bio: 'Stayed in lunar orbit while the other two landed. Fourteen solo orbits behind the far side of the Moon — the most isolated human in history.'
    }
  ]
}), {
  notes: [
    'Three men. Two walked on the Moon. One waited in orbit so they could come home.',
    'Armstrong: 38 at landing, civilian, X-15 test pilot. Famously private — wrote almost nothing about the mission for decades.',
    'Aldrin: 39, USAF, MIT PhD in orbital rendezvous. His doctoral thesis directly informed the rendezvous procedures used by Gemini and Apollo.',
    'Collins: 38, USAF test pilot. While on the far side of the Moon, he was 3,585 km from another human — Earth could not even radio him. He later wrote "Carrying the Fire", widely considered the best astronaut memoir.',
    'Photo: NASA / Wikimedia Commons (full crew portrait used on subsequent slides).'
  ].join(' ')
});
