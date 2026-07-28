import { readFileSync } from 'node:fs';
import { resolve as resolvePath } from 'node:path';

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

/* ------------------------------------------------------------------------- *
 * Daqui pra baixo os valores NÃO são copiados do brief: saem do próprio
 * app/globals.css. Os blocos acima travam o contrato do §6.2; estes travam que
 * o CSS que vai pro ar realmente cumpre esse contrato — inclusive quando o
 * data-accent cai no <html>, que é o que o AccentTracker da Task 2 faz.
 * ------------------------------------------------------------------------- */

// jsdom reescreve import.meta.url para uma URL http, então o caminho sai da
// raiz do projeto (o vitest roda com o cwd na raiz).
const CSS = readFileSync(resolvePath(process.cwd(), 'app/globals.css'), 'utf8').replace(
  /\/\*[\s\S]*?\*\//g,
  '',
);

/** Corpos de todas as regras cuja lista de seletores contém `selector`. */
function bodiesFor(selector: string): string[] {
  const bodies: string[] = [];
  const rule = /([^{}]+)\{([^{}]*)\}/g;
  let match: RegExpExecArray | null;
  while ((match = rule.exec(CSS)) !== null) {
    const selectors = match[1].split(',').map((s) => s.trim().replace(/\s+/g, ' '));
    if (selectors.includes(selector)) bodies.push(match[2]);
  }
  return bodies;
}

type Theme = 'claro' | 'escuro';
type Accent = 'nenhum' | 'asafe' | 'eaifez';

/**
 * Resolve os tokens como o browser resolveria, modelando o data-accent no
 * PRÓPRIO <html> — a colocação que o AccentTracker usa. Se alguém apagar a
 * forma auto-casante `:root[data-theme='dark'][data-accent='X']`, nada aqui
 * casa, --accent-text fica no valor do tema claro e os testes de AA no escuro
 * quebram. É esse o guarda: o efeito, não a grafia do seletor.
 */
function resolve(theme: Theme, accent: Accent): Map<string, string> {
  const tokens = new Map<string, string>();
  const apply = (selector: string) => {
    for (const body of bodiesFor(selector)) {
      for (const [, name, value] of body.matchAll(/(--[\w-]+)\s*:\s*([^;]+)/g)) {
        tokens.set(name, value.trim());
      }
    }
  };

  apply(':root');
  if (theme === 'escuro') apply(":root[data-theme='dark']");
  if (accent !== 'nenhum') {
    apply(`[data-accent='${accent}']`);
    if (theme === 'escuro') apply(`:root[data-theme='dark'][data-accent='${accent}']`);
  }
  return tokens;
}

/** Segue `var(--x)` até chegar num hex. */
function token(tokens: Map<string, string>, name: string, seen = new Set<string>()): string {
  const raw = tokens.get(name);
  if (raw === undefined) throw new Error(`token ${name} não declarado`);
  if (seen.has(name)) throw new Error(`referência circular em ${name}`);
  const alias = raw.match(/^var\((--[\w-]+)\)$/);
  if (alias) return token(tokens, alias[1], new Set(seen).add(name));
  if (!/^#[0-9a-f]{6}$/i.test(raw)) throw new Error(`token ${name} não é hex: ${raw}`);
  return raw;
}

const THEMES: Theme[] = ['claro', 'escuro'];
const ACCENTS: Accent[] = ['asafe', 'eaifez'];
const COMBOS = THEMES.flatMap((theme) => ACCENTS.map((accent) => ({ theme, accent })));

describe('CSS real: --accent-text sobre --paper passa AA (data-accent no <html>)', () => {
  it.each(COMBOS)('$accent / $theme', ({ theme, accent }) => {
    const tokens = resolve(theme, accent);
    const ratio = contrastRatio(token(tokens, '--accent-text'), token(tokens, '--paper'));
    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });
});

describe('CSS real: --accent-text bate com os hex travados no §6.2', () => {
  it.each(COMBOS)('$accent / $theme', ({ theme, accent }) => {
    const esperado = PAIRS.find((p) => p.name === `${accent} / ${theme}`)!.fg;
    expect(token(resolve(theme, accent), '--accent-text').toLowerCase()).toBe(
      esperado.toLowerCase(),
    );
  });
});

describe('CSS real: --accent-ink sobre o preenchimento --accent passa AA Large', () => {
  // §6.2 restringe --accent a capa de case, borda ativa e foco — texto em
  // tamanho de display. O piso é 3:1. O caso escuro é o que estava quebrado.
  it.each(COMBOS)('$accent / $theme', ({ theme, accent }) => {
    const tokens = resolve(theme, accent);
    const ratio = contrastRatio(token(tokens, '--accent-ink'), token(tokens, '--accent'));
    expect(ratio).toBeGreaterThanOrEqual(3);
  });
});

describe('CSS real: sem acento injetado, --accent-ink continua legível', () => {
  // Aqui --accent é var(--ink) e --accent-ink é var(--paper): o par vira junto
  // com o tema, então dá pra exigir AA cheio.
  it.each(THEMES)('tema %s', (theme) => {
    const tokens = resolve(theme, 'nenhum');
    const ratio = contrastRatio(token(tokens, '--accent-ink'), token(tokens, '--accent'));
    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });
});
