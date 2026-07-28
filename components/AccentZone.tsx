import type { ReactNode } from 'react';

/**
 * Os acentos que existem. §6.1: a base NÃO tem acento próprio, então não há
 * valor 'neutro' aqui — a ausência de acento é a ausência do atributo.
 *
 * TODO(Task 5): quando existir o modelo de conteúdo, derivar esta união dos
 * slugs dos cases em vez de repetir a lista à mão.
 */
export type Accent = 'asafe' | 'eaifez';

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
