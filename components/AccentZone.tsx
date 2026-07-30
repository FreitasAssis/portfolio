import type { ReactNode } from 'react';

/**
 * Os acentos que existem. Não há valor 'neutro': a ausência de acento é a
 * ausência do atributo.
 *
 * A lista existe em três lugares — aqui, nos blocos `[data-accent='…']` do
 * `app/globals.css` e no frontmatter de `content/projects/` — e os três são
 * comparados em `tests/unit/projects.test.ts`.
 */
export const ACCENTS = ['asafe', 'eaifez'] as const;

export type Accent = (typeof ACCENTS)[number];

/**
 * Delimita a região que empresta a cor de um projeto. Só marca o DOM; quem lê a
 * marcação no scroll e a propaga pro `<html>` é o `AccentTracker`.
 */
export function AccentZone({
  accent,
  children,
  className,
}: {
  accent?: Accent;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div {...(accent ? { 'data-accent': accent } : {})} className={className}>
      {children}
    </div>
  );
}
