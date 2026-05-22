'use strict';

/**
 * Stage.QandA — large rhetorical question with a big answer below.
 *
 * Usage:
 *   Stage.register(Stage.QandA({
 *     section: 2,
 *     title: '02 · The question',
 *     question: 'What if the bottleneck was never the typing?',
 *     answer: 'It was always the thinking.',
 *     attribution: 'after years of waiting for compilers'   // optional, small
 *   }));
 *
 * Edit paths:
 *   question / answer / attribution
 */

(function (root) {
  const Stage = root.Stage = root.Stage || {};

  Stage.QandA = function (opts) {
    const question = opts.question || '';
    const answer = opts.answer || '';
    const attribution = opts.attribution || '';

    return {
      section: opts.section,
      title: opts.title,
      transition: opts.transition,
      render(el) {
        el.innerHTML = `
          <div class="qanda" data-stage-key="QandA">
            <div class="qa-q" data-stage-edit="question" data-stage-key="QandA/question">${escape(question)}</div>
            <div class="qa-a" data-stage-edit="answer" data-stage-key="QandA/answer">${escape(answer)}</div>
            ${attribution ? `<div class="qa-attr" data-stage-edit="attribution" data-stage-key="QandA/attribution">— ${escape(attribution)}</div>` : ''}
          </div>
        `;
      },
      init(el) {
        const q = el.querySelector('.qa-q');
        const a = el.querySelector('.qa-a');
        const attr = el.querySelector('.qa-attr');
        const timers = [];
        timers.push(setTimeout(() => q && q.classList.add('in'), 150));
        timers.push(setTimeout(() => a && a.classList.add('in'), 900));
        timers.push(setTimeout(() => attr && attr.classList.add('in'), 1500));
        return () => timers.forEach(clearTimeout);
      },
      replay(el) {
        el.querySelectorAll('.qa-q, .qa-a, .qa-attr').forEach(n => n.classList.remove('in'));
        return this.init(el);
      }
    };
  };

  function escape(s) {
    return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }
})(typeof window !== 'undefined' ? window : globalThis);
