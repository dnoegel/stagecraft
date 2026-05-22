'use strict';

Stage.register(Stage.TeamGrid({
  section: 62,
  title: '62 · The team',
  columns: 3,
  people: [
    {
      name: 'Avery Chen',
      role: 'CEO',
      photo: 'https://picsum.photos/seed/avery/400/400',
      bio: 'Ex-Stripe. Loves type systems.',
      social: { linkedin: '#', twitter: '#', github: '#' }
    },
    {
      name: 'Jordan Park',
      role: 'CTO',
      photo: 'https://picsum.photos/seed/jordan/400/400',
      bio: 'Distributed systems lifer.',
      social: { linkedin: '#', github: '#' }
    },
    {
      name: 'Sam Rivera',
      role: 'Design',
      photo: 'https://picsum.photos/seed/sam/400/400',
      bio: 'Built design systems at three startups.',
      social: { twitter: '#' }
    },
    {
      name: 'Priya Shah',
      role: 'Eng',
      photo: 'https://picsum.photos/seed/priya/400/400',
      bio: 'Compilers, runtimes, and bread.',
      social: { linkedin: '#', github: '#' }
    },
    {
      name: 'Lee Park',
      role: 'PM',
      photo: 'https://picsum.photos/seed/lee/400/400',
      bio: 'Asks the right questions.',
      social: { linkedin: '#' }
    },
    {
      name: 'Alex Kim',
      role: 'GTM',
      photo: 'https://picsum.photos/seed/alex/400/400',
      bio: 'Believes in product-led growth.',
      social: { linkedin: '#', twitter: '#' }
    }
  ],
  reveal: 'staggered'
}));
