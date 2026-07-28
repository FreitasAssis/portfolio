import type { ReactNode } from 'react';

/**
 * Os acentos que existem. §6.1: a base NÃO tem acento próprio, então não há
 * valor 'neutro' aqui — a ausência de acento é a ausência do atributo.
 *
 * Por que a lista continua escrita à mão, depois do modelo de conteúdo da
 * Task 5: um acento não é só um slug de MDX, é um par de hex verificado em
 * contraste que mora em `[data-accent='…']` no `app/globals.css` (§6.2, §9).
 * TypeScript não deriva união literal de arquivo lido em disco, e gerar o CSS
 * a partir do frontmatter tiraria os hex do lugar onde o teste de contraste os
 * mede. Então a lista existe em três lugares — aqui, no CSS e nos arquivos de
 * `content/projects/` — e o que impede as três de divergirem é mecânico:
 *
 *   - `tests/unit/projects.test.ts` exige que os três conjuntos sejam iguais;
 *   - `lib/projects.ts` derruba o build quando um MDX traz slug fora daqui;
 *   - `tests/unit/contrast.test.ts` mede automaticamente todo acento do CSS.
 *
 * Ou seja: case novo com cor nova = um arquivo de conteúdo, um bloco de tokens
 * e uma entrada nesta lista. Esquecer qualquer um dos três reprova, com o
 * arquivo e o campo no erro.
 */
export const ACCENTS = ['asafe', 'eaifez'] as const;

export type Accent = (typeof ACCENTS)[number];

/**
 * Delimita a região que empresta a cor de um projeto (§6.1). Componente de
 * servidor: só marca o DOM, não leva JS pro cliente. Quem lê a marcação no
 * scroll e a propaga pro `<html>` é o `AccentTracker`.
 *
 * Sem `accent`, o atributo não é emitido — nem vazio, nem com um padrão. Emitir
 * `data-accent=""` faria a região casar com `[data-accent]` no seletor do
 * tracker e no CSS, e a base deixaria de ser neutra.
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
