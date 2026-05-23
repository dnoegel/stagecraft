'use strict';

Stage.register(Stage.Bento({
  section: 4,
  title: '04 · Bento',
  cells: [
    { span: 2, heading: 'Hot',    body: '50 components, 15 transitions, 5 themes', color: 'accent' },
    {          heading: 'Open',  body: 'MIT licensed' },
    {          heading: 'Tiny',  body: 'No runtime deps for present mode', color: 'blue' },
    {          heading: 'Fast',  body: 'Single HTML file, no build step' },
    {          heading: 'Live',  body: 'Edit mode + AST roundtrip', color: 'amber' },
    { span: 2, heading: 'Agent-native', body: '@note: comments + AGENT.md manifesto' }
  ]
}), {
  notes: 'The 2026 Bento layout — modular grid with spannable cells. Good for landing-page-style summary slides.'
});
