'use strict';

/**
 * 06 · Gallery wall — 4 photos from days 2–3 in Tokyo.
 *
 * Photos (all Unsplash, search-sourced):
 *   1. Ramen bowl — Thomas Marban (@thomasmarban)
 *      https://unsplash.com/photos/ramen-with-green-and-orange-vegetable-on-white-ceramic-bowl-cl5jATw9SrA
 *   2. Tokyo metro / subway — Liam Burnett-Blue (@liamburnettblue)
 *      https://unsplash.com/photos/woman-in-yellow-shirt-and-blue-skirt-standing-on-train-station-Z1xkPF1Lr_4
 *   3. Neon Tokyo street — Jezael Melgoza (@jezar)
 *      https://unsplash.com/photos/cars-passing-by-on-road-during-night-time-alIqAQEdpHw
 *   4. Cherry blossoms — Sora Sagano (@sorasagano)
 *      https://unsplash.com/photos/cherry-blossoms-tFhfPxIIPwQ
 */
Stage.register(Stage.ImageGrid({
  section: 3,
  title: 'gallery wall · days 2-3',
  columns: 2,
  images: [
    {
      src: 'https://images.unsplash.com/photo-1557872943-16a5ac26437e?w=1200&q=80&auto=format&fit=crop',
      alt: 'A steaming bowl of ramen with egg and scallions',
      caption: 'shoyu ramen, 11pm'
    },
    {
      src: 'https://images.unsplash.com/photo-1554797589-7241bb691973?w=1200&q=80&auto=format&fit=crop',
      alt: 'A Tokyo metro platform with a train arriving',
      caption: 'last train, Marunouchi line'
    },
    {
      src: 'https://images.unsplash.com/photo-1554797589-9c25fbafd0a8?w=1200&q=80&auto=format&fit=crop',
      alt: 'Neon-lit Tokyo street with signage in Japanese',
      caption: 'Kabukicho, dripping in signs'
    },
    {
      src: 'https://images.unsplash.com/photo-1522383225653-ed111181a951?w=1200&q=80&auto=format&fit=crop',
      alt: 'Cherry blossoms in full bloom against soft sky',
      caption: 'sakura, second week of April'
    }
  ],
  reveal: 'cascade'
}), {
  notes: 'Pause on the ramen one — the late-night bowl in Shinjuku was the best meal of the trip. Photos: Thomas Marban, Liam Burnett-Blue, Jezael Melgoza, Sora Sagano — all on Unsplash.'
});
