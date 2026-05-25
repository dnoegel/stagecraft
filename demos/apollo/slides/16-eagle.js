'use strict';

/**
 * Image of the LM (Eagle) photographed from Columbia after undocking. Sets
 * the visual context before the alarm sequence.
 */
Stage.register(Stage.ImageText({
  section: 5,
  title: '04 · Eagle',
  side: 'right',
  image: {
    src: 'https://upload.wikimedia.org/wikipedia/commons/2/25/Apollo_11_CSM_photographed_from_Lunar_Module_%28AS11-37-5445%29.jpg',
    alt: 'Apollo 11 Command Module Columbia, photographed from the Lunar Module Eagle after undocking'
  },
  heading: 'Eagle separates.',
  body: [
    "Two astronauts in a contraption made of foil and dreams.",
    "Three legs, no parachute, no second chance.",
    "Powered descent begins in twelve minutes."
  ].join('\n'),
  caption: 'Photo: NASA / Wikimedia Commons · AS11-37-5445',
  reveal: 'staggered'
}), {
  notes: [
    'The Lunar Module (callsign Eagle) undocked from the Command Module (Columbia) at T+100h 12m on 20 July 1969. Collins remained in Columbia in lunar orbit.',
    'The LM weighed about 15 tonnes fully fueled, of which ~10 tonnes was propellant. The ascent stage alone (the part that came back up) was 4.5 tonnes.',
    'Worth noting: the LM was the only Apollo component that flew exclusively in space — its skin was just 0.3mm of aluminum in places. It could not have survived launch or atmospheric entry. It existed only for the vacuum.',
    'Photo: This is actually Columbia as seen from Eagle (AS11-37-5445), with Earthrise behind. Repurposed here as the establishing shot before the descent.'
  ].join(' ')
});
