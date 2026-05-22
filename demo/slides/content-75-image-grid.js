'use strict';

Stage.register(Stage.ImageGrid({
  section: 75,
  title: '75 · ImageGrid',
  columns: 3,
  images: [
    { src: 'https://picsum.photos/seed/grid-a/800/520', alt: 'team offsite',  caption: 'team offsite' },
    { src: 'https://picsum.photos/seed/grid-b/800/520', alt: 'staging burn', caption: 'staging burn' },
    { src: 'https://picsum.photos/seed/grid-c/800/520', alt: 'ship night',   caption: '4 a.m. ship' },
    { src: 'https://picsum.photos/seed/grid-d/800/520', alt: 'whiteboard',   caption: 'the whiteboard' },
    { src: 'https://picsum.photos/seed/grid-e/800/520', alt: 'pairing',      caption: 'pairing' },
    { src: 'https://picsum.photos/seed/grid-f/800/520', alt: 'demo day',     caption: 'demo day' }
  ],
  reveal: 'cascade'
}));
