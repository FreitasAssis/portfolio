/**
 * Leitor de cascata do `app/globals.css`, compartilhado pelos testes.
 *
 * Nasceu dentro de `tests/unit/contrast.test.ts` (Task 2) e saiu para cá na
 * Task 5, quando `projects.test.ts` passou a precisar do mesmo resolvedor para
 * conferir se o hex do frontmatter bate com o hex do CSS. Duas cópias do
 * resolvedor seria o pior dos mundos: as duas concordariam entre si e poderiam
 * discordar do browser juntas.
 *
 * Não é um parser de CSS — é o mínimo para modelar a cascata que este arquivo
 * usa: `:root`, `:root[data-theme='dark']` e os blocos `[data-accent='…']`,
 * inclusive na forma auto-casante que o `AccentTracker` exige (o `data-accent`
 * cai no PRÓPRIO `<html>`).
 */
import { readFileSync } from 'node:fs';
import { resolve as resolvePath } from 'node:path';

// jsdom reescreve import.meta.url para uma URL http, então o caminho sai da
// raiz do projeto (o vitest roda com o cwd na raiz).
export const CSS = readFileSync(resolvePath(process.cwd(), 'app/globals.css'), 'utf8').replace(
  /\/\*[\s\S]*?\*\//g,
  '',
);

/** Corpos de todas as regras cuja lista de seletores contém `selector`. */
export function bodiesFor(selector: string): string[] {
  const bodies: string[] = [];
  const rule = /([^{}]+)\{([^{}]*)\}/g;
  let match: RegExpExecArray | null;
  while ((match = rule.exec(CSS)) !== null) {
    const selectors = match[1].split(',').map((s) => s.trim().replace(/\s+/g, ' '));
    if (selectors.includes(selector)) bodies.push(match[2]);
  }
  return bodies;
}

export type Theme = 'claro' | 'escuro';

/**
 * Os acentos que o CSS realmente define, lidos dos seletores `[data-accent='…']`.
 * É um dos três lados do sincronismo travado em `projects.test.ts`: CSS,
 * conteúdo e a união `Accent`.
 */
export function accentSlugsInCss(): string[] {
  const slugs = new Set<string>();
  for (const [, slug] of CSS.matchAll(/\[data-accent='([\w-]+)'\]/g)) slugs.add(slug);
  return [...slugs].sort();
}

/**
 * Resolve os tokens como o browser resolveria, modelando o data-accent no
 * PRÓPRIO <html> — a colocação que o AccentTracker usa. Se alguém apagar a
 * forma auto-casante `:root[data-theme='dark'][data-accent='X']`, nada aqui
 * casa, --accent-text fica no valor do tema claro e os testes de AA no escuro
 * quebram. É esse o guarda: o efeito, não a grafia do seletor.
 */
export function resolveTokens(theme: Theme, accent: string | null): Map<string, string> {
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
  if (accent !== null) {
    apply(`[data-accent='${accent}']`);
    if (theme === 'escuro') apply(`:root[data-theme='dark'][data-accent='${accent}']`);
  }
  return tokens;
}

/** Segue `var(--x)` até chegar num hex. */
export function token(tokens: Map<string, string>, name: string, seen = new Set<string>()): string {
  const raw = tokens.get(name);
  if (raw === undefined) throw new Error(`token ${name} não declarado`);
  if (seen.has(name)) throw new Error(`referência circular em ${name}`);
  const alias = raw.match(/^var\((--[\w-]+)\)$/);
  if (alias) return token(tokens, alias[1], new Set(seen).add(name));
  if (!/^#[0-9a-f]{6}$/i.test(raw)) throw new Error(`token ${name} não é hex: ${raw}`);
  return raw;
}

/**
 * Token que a regra de `:focus-visible` usa na cor do outline, lido do CSS —
 * `bodiesFor` não serve aqui porque ele quebra a lista de seletores na vírgula
 * e o seletor do foco tem vírgulas dentro de um `:where()`.
 */
export function focusOutlineToken(): string {
  const rule = /:focus-visible\s*\{([^{}]*)\}/.exec(CSS);
  if (rule === null) throw new Error('regra de :focus-visible não encontrada');
  const outline = /outline:[^;]*var\((--[\w-]+)\)/.exec(rule[1]);
  if (outline === null) throw new Error('o outline do foco não sai de um token var()');
  return outline[1];
}
