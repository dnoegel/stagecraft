'use strict';

Stage.register(Stage.Pricing({
  section: 4,
  title: '04 · Pricing',
  tiers: [
    { name: 'OSS',         price: '$0',  period: 'forever',  features: ['Everything in core', '50 components', '5 themes', 'Edit mode', 'MIT licensed'] },
    { name: 'Pro',         price: '$0',  period: 'forever',  features: ['Same as OSS', 'No really'], featured: true, ctaLabel: 'still $0' },
    { name: 'Enterprise',  price: '$0',  period: 'forever',  features: ['Same as Pro', 'Optional hug from maintainer'] }
  ],
  reveal: 'staggered'
}), {
  notes: 'Pricing cards. The featured tier gets accent border, scale lift, and an optional badge. Use this for SaaS plan slides.'
});
