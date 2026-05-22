'use strict';

/**
 * Stage.TeamGrid — grid of people cards with photo, name, role, bio, socials.
 *
 * Usage:
 *   Stage.register(Stage.TeamGrid({
 *     section: 62,
 *     title: '62 · The team',
 *     columns: 3,
 *     people: [
 *       { name: 'Avery Chen', role: 'CEO',
 *         photo: 'https://picsum.photos/seed/avery/400/400',
 *         bio: 'Ex-Stripe. Loves type systems.',
 *         social: { linkedin: '#', twitter: '#', github: '#' } }
 *     ],
 *     reveal: 'staggered'   // 'instant' | 'staggered'
 *   }));
 *
 * Edit paths: people[i].name / .role / .bio
 */

(function (root) {
  const Stage = root.Stage = root.Stage || {};

  const SOCIAL_ICONS = {
    linkedin: 'work',
    twitter: 'alternate_email',
    github: 'code'
  };

  Stage.TeamGrid = function (opts) {
    const people = opts.people || [];
    const reveal = opts.reveal || 'instant';
    const columns = Math.min(4, Math.max(2, opts.columns || 3));

    const slide = {
      section: opts.section,
      title: opts.title,
      transition: opts.transition,
      render(el) {
        el.innerHTML = `
          <div class="team-grid team-grid--cols-${columns}" data-stage-key="TeamGrid">
            ${people.map((p, i) => `
              <div class="team-card" data-step="${i + 1}" data-stage-key="TeamGrid/person[${i}]">
                <div class="team-photo-wrap">
                  ${p.photo
                    ? `<img class="team-photo" src="${escape(p.photo)}" alt="${escape(p.name || '')}">`
                    : `<span class="team-photo team-photo--placeholder material-symbols-outlined">person</span>`}
                </div>
                <div class="team-name" data-stage-edit="people[${i}].name">${escape(p.name || '')}</div>
                <div class="team-role" data-stage-edit="people[${i}].role">${escape(p.role || '')}</div>
                ${p.bio ? `<div class="team-bio" data-stage-edit="people[${i}].bio">${escape(p.bio)}</div>` : ''}
                ${p.social ? `
                  <div class="team-social" data-stage-key="TeamGrid/person[${i}]/social">
                    ${Object.entries(p.social).filter(([, v]) => v).map(([k]) => `
                      <span class="team-social-icon material-symbols-outlined" title="${escape(k)}">${SOCIAL_ICONS[k] || 'link'}</span>
                    `).join('')}
                  </div>
                ` : ''}
              </div>
            `).join('')}
          </div>
        `;
        if (reveal === 'instant') {
          el.querySelectorAll('.team-card').forEach(n => n.classList.add('in'));
        }
      }
    };

    if (reveal === 'staggered') {
      slide.init = function (el) {
        return Stage.staggerIn(el.querySelectorAll('.team-card'), 120, 180);
      };
      slide.replay = function (el) {
        el.querySelectorAll('.team-card').forEach(n => n.classList.remove('in'));
        return this.init(el);
      };
    }

    return slide;
  };

  function escape(s) {
    return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }
})(typeof window !== 'undefined' ? window : globalThis);
