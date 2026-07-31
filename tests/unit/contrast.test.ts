import { describe, expect, it } from 'vitest';

import { contrastRatio } from '@/lib/contrast';
import {
  accentSlugsInCss,
  declaration,
  focusOutlineToken,
  resolveTokens,
  type Theme,
  token,
} from '../helpers/globals-css';

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

/* ------------------------------------------------------------------------- *
 * Daqui pra baixo os valores NÃO são copiados do brief: saem do próprio
 * app/globals.css. Os blocos acima travam o contrato do §6.2; estes travam que
 * o CSS que vai pro ar realmente cumpre esse contrato — inclusive quando o
 * data-accent cai no <html>, que é o que o AccentTracker da Task 2 faz.
 * ------------------------------------------------------------------------- */

const THEMES: Theme[] = ['claro', 'escuro'];

/**
 * A lista de acentos NÃO é escrita à mão aqui: sai dos seletores do próprio
 * CSS. Assim, um acento novo entra em todos os testes de contraste abaixo no
 * instante em que o bloco `[data-accent='…']` é criado — não dá para acrescentar
 * uma cor de marca e esquecer de medi-la. Quem garante que essa lista é a mesma
 * dos slugs do conteúdo e da união `Accent` é `projects.test.ts`.
 */
const ACCENTS = accentSlugsInCss();
const COMBOS = THEMES.flatMap((theme) => ACCENTS.map((accent) => ({ theme, accent })));

/** O par do §6.2 esperado para o acento, ou um erro que diz o que falta. */
function pairFor(accent: string, theme: Theme) {
  const pair = PAIRS.find((p) => p.name === `${accent} / ${theme}`);
  if (!pair) throw new Error(`o acento '${accent}' existe no CSS mas não tem par travado no §6.2`);
  return pair;
}

describe('CSS real: --accent-text sobre --paper passa AA (data-accent no <html>)', () => {
  it.each(COMBOS)('$accent / $theme', ({ theme, accent }) => {
    const tokens = resolveTokens(theme, accent);
    const ratio = contrastRatio(token(tokens, '--accent-text'), token(tokens, '--paper'));
    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });
});

describe('CSS real: --accent-text bate com os hex travados no §6.2', () => {
  it.each(COMBOS)('$accent / $theme', ({ theme, accent }) => {
    const esperado = pairFor(accent, theme).fg;
    expect(token(resolveTokens(theme, accent), '--accent-text').toLowerCase()).toBe(
      esperado.toLowerCase(),
    );
  });
});

describe('CSS real: --accent-ink sobre o preenchimento --accent passa AA cheio', () => {
  // 4.5:1, e não os 3:1 de texto grande: o par não vive só na capa do case. O
  // botão "Abrir o app" (components/ProjectCard.tsx e a rota do case) é
  // preenchido com --accent e escrito em --accent-ink a `font-mono text-sm`, que
  // resolve para 16.2px de peso normal — abaixo dos 24px (ou 18.7px em negrito)
  // a partir dos quais a WCAG afrouxa para 3:1. Foi este piso que tirou o
  // #c8506a de --accent: com ele o par media 4.18.
  it.each(COMBOS)('$accent / $theme', ({ theme, accent }) => {
    const tokens = resolveTokens(theme, accent);
    const ratio = contrastRatio(token(tokens, '--accent-ink'), token(tokens, '--accent'));
    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });
});

describe('CSS real: o corpo do botão de acento é texto de tamanho normal', () => {
  /**
   * O que justifica o 4.5:1 do bloco acima, lido do próprio CSS em vez de
   * afirmado num comentário. A WCAG só afrouxa para 3:1 a partir de 24px (ou
   * 18.7px em negrito); o botão "Abrir o app" é `font-mono text-sm` de peso
   * normal. Se um dia a escala mudar e `text-sm` passar dos 24px, este teste
   * falha e avisa que o piso do par --accent-ink/--accent pode ser revisto —
   * afrouxar aquele número sem passar por aqui é que não pode.
   */
  const WCAG_TEXTO_GRANDE_PX = 24;

  it('text-sm resolve abaixo do limite de texto grande', () => {
    const raiz = Number.parseFloat(declaration('html', 'font-size'));
    const px = Number.parseFloat(declaration('@theme', '--text-sm')) * raiz;
    expect(px).toBeLessThan(WCAG_TEXTO_GRANDE_PX);
  });
});

describe('CSS real: o anel de foco é visível sobre o papel (§9, WCAG 1.4.11)', () => {
  // Desvio deliberado do §6.2, que atribui o foco a --accent: o hex cru da marca
  // não vira com o tema e daria 1.713:1 no par asafe/escuro. O piso do §9 vence.
  // O teste lê qual token o CSS realmente usa, então reverter para --accent
  // reprova aqui em vez de sair invisível no ar.
  it.each(COMBOS)('$accent / $theme', ({ theme, accent }) => {
    const tokens = resolveTokens(theme, accent);
    const ratio = contrastRatio(token(tokens, focusOutlineToken()), token(tokens, '--paper'));
    expect(ratio).toBeGreaterThanOrEqual(3);
  });
});

describe('CSS real: sem acento injetado, --accent-ink continua legível', () => {
  // Aqui --accent é var(--ink) e --accent-ink é var(--paper): o par vira junto
  // com o tema, então dá pra exigir AA cheio.
  it.each(THEMES)('tema %s', (theme) => {
    const tokens = resolveTokens(theme, null);
    const ratio = contrastRatio(token(tokens, '--accent-ink'), token(tokens, '--accent'));
    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });
});
