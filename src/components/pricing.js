'use strict';

/**
 * Stage.Pricing — 3-tier (or N-tier) pricing card layout.
 *
 * Usage:
 *   Stage.register(Stage.Pricing({
 *     section: 60,
 *     title: '60 · Pricing',
 *     tiers: [
 *       { name: 'Starter', price: '$0',  period: '/mo',
 *         features: ['1 project', 'Community support'], ctaLabel: 'Start free' },
 *       { name: 'Pro',     price: '$29', period: '/mo', featured: true,
 *         features: ['Unlimited projects', 'Priority support', 'SAML SSO'],
 *         ctaLabel: 'Start trial' },
 *       { name: 'Scale',   price: 'Custom',
 *         features: ['SLA', 'Dedicated CSM', 'On-prem'], ctaLabel: 'Talk to sales' }
 *     ],
 *     reveal: 'staggered'  // 'instant' | 'staggered'
 *   }));
 *
 * Edit paths: tiers[i].name / .price / .period / .features[k] / .ctaLabel
 */

(function (root) {
  const Stage = root.Stage = root.Stage || {};

  Stage.Pricing = function (opts) {
    const tiers = opts.tiers || [];
    const reveal = opts.reveal || 'instant';
    const cols = Math.min(4, Math.max(1, tiers.length));

    const slide = {
      section: opts.section,
      title: opts.title,
      transition: opts.transition,
      render(el) {
        el.innerHTML = `
          <div class="pricing pricing--cols-${cols}" data-stage-key="Pricing">
            ${tiers.map((t, i) => `
              <div class="pricing-tier${t.featured ? ' pricing-tier--featured' : ''}"
                   data-step="${i + 1}"
                   data-stage-key="Pricing/tier[${i}]">
                ${t.featured ? `<div class="pricing-badge">most popular</div>` : ''}
                <div class="pricing-name" data-stage-edit="tiers[${i}].name">${escape(t.name || '')}</div>
                <div class="pricing-figure">
                  <span class="pricing-price" data-stage-edit="tiers[${i}].price">${escape(t.price || '')}</span>
                  ${t.period ? `<span class="pricing-period" data-stage-edit="tiers[${i}].period">${escape(t.period)}</span>` : ''}
                </div>
                <ul class="pricing-features" data-stage-key="Pricing/tier[${i}]/features">
                  ${(t.features || []).map((f, k) => `
                    <li class="pricing-feature" data-stage-key="Pricing/tier[${i}]/feature[${k}]">
                      <span class="pricing-check material-symbols-outlined">check</span>
                      <span data-stage-edit="tiers[${i}].features[${k}]">${escape(f)}</span>
                    </li>
                  `).join('')}
                </ul>
                ${t.ctaLabel ? `
                  <div class="pricing-cta" data-stage-edit="tiers[${i}].ctaLabel">
                    ${escape(t.ctaLabel)}
                    <span class="pricing-cta-arrow material-symbols-outlined">arrow_forward</span>
                  </div>
                ` : ''}
              </div>
            `).join('')}
          </div>
        `;
        if (reveal === 'instant') {
          el.querySelectorAll('.pricing-tier').forEach(n => n.classList.add('in'));
        }
      }
    };

    if (reveal === 'staggered') {
      slide.init = function (el) {
        return Stage.staggerIn(el.querySelectorAll('.pricing-tier'), 180, 200);
      };
      slide.replay = function (el) {
        el.querySelectorAll('.pricing-tier').forEach(n => n.classList.remove('in'));
        return this.init(el);
      };
    }

    return slide;
  };

  function escape(s) {
    return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }
})(typeof window !== 'undefined' ? window : globalThis);
