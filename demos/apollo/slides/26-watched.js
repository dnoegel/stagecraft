'use strict';

/**
 * BigNumber: 600 million people watched the landing. About one in six humans
 * alive on Earth at that time.
 */
Stage.register(Stage.BigNumber({
  section: 8,
  title: '07 · Watched',
  number: 600,
  unit: 'M',
  label: 'people watched the landing live',
  caption: 'roughly one in six humans alive on 20 July 1969'
}), {
  notes: [
    'Estimated 600 million viewers worldwide tuned in to watch the first moonwalk live — the largest TV audience to that date.',
    'World population in 1969: ~3.6 billion. So roughly 1 in 6 humans alive at that moment was watching.',
    'The footage was relayed via three tracking stations — Honeysuckle Creek (Australia), Goldstone (California), and Parkes (Australia). Honeysuckle Creek transmitted the first 8 minutes; Parkes carried the rest, including the Aldrin saluting-the-flag footage.'
  ].join(' ')
});
