import { describe, expect, it } from 'vitest';

import { contrastRatio } from '@/lib/contrast';

const LIGHT_PAPER = '#FAFAFA';
const DARK_PAPER = '#0E1013';

const PAIRS = [
  { name: 'asafe / claro', fg: '#2F3A5E', bg: LIGHT_PAPER },
  { name: 'eaifez / claro', fg: '#A83C55', bg: LIGHT_PAPER },
  { name: 'asafe / escuro', fg: '#8E9AC4', bg: DARK_PAPER },
  { name: 'eaifez / escuro', fg: '#E88BA0', bg: DARK_PAPER },
];

describe('--accent-text passa AA em texto de tamanho normal', () => {
  it.each(PAIRS)('$name', ({ fg, bg }) => {
    expect(contrastRatio(fg, bg)).toBeGreaterThanOrEqual(4.5);
  });
});

describe('texto de corpo passa AA nos dois temas', () => {
  it('ink sobre paper', () => {
    expect(contrastRatio('#14161A', LIGHT_PAPER)).toBeGreaterThanOrEqual(4.5);
  });
  it('ink-2 sobre paper', () => {
    expect(contrastRatio('#5A616B', LIGHT_PAPER)).toBeGreaterThanOrEqual(4.5);
  });
  it('ink escuro sobre paper escuro', () => {
    expect(contrastRatio('#EDEEF0', DARK_PAPER)).toBeGreaterThanOrEqual(4.5);
  });
  it('ink-2 escuro sobre paper escuro', () => {
    expect(contrastRatio('#9AA1AC', DARK_PAPER)).toBeGreaterThanOrEqual(4.5);
  });
});
