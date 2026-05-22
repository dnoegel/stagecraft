'use strict';

Stage.register(Stage.Pricing({
  section: 60,
  title: '60 · Pricing',
  tiers: [
    {
      name: 'Starter',
      price: '$0',
      period: '/mo',
      features: ['1 project', 'Community support', 'Up to 3 collaborators'],
      ctaLabel: 'Start free'
    },
    {
      name: 'Pro',
      price: '$29',
      period: '/mo',
      featured: true,
      features: ['Unlimited projects', 'Priority support', 'SAML SSO', 'Audit log'],
      ctaLabel: 'Start trial'
    },
    {
      name: 'Scale',
      price: 'Custom',
      features: ['SLA backed', 'Dedicated CSM', 'On-prem deploy', 'Custom contracts'],
      ctaLabel: 'Talk to sales'
    }
  ],
  reveal: 'staggered'
}));
