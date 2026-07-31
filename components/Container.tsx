import type { ReactNode } from 'react';

/**
 * As duas larguras do site: a coluna de leitura e a quebra de grade, reservada ao
 * que é trabalho (cards de projeto, prints, capa de case).
 *
 * `reading` é a CAIXA, não o texto: os 44rem viram 702px de conteúdo depois do
 * padding, que é o que faz o `.prose-measure` de 68ch ser o limite que morde.
 * Estreitar aqui derruba a prosa abaixo do piso de 65 caracteres.
 */
const WIDTHS = {
  reading: 'max-w-[44rem]',
  wide: 'max-w-[60rem]',
} as const;

export type ContainerWidth = keyof typeof WIDTHS;

type ContainerTag = 'div' | 'section' | 'header' | 'footer' | 'article' | 'nav' | 'ul';

export function Container({
  as: Tag = 'div',
  width = 'reading',
  className,
  id,
  'aria-label': ariaLabel,
  children,
}: {
  as?: ContainerTag;
  width?: ContainerWidth;
  className?: string;
  id?: string;
  /**
   * Nome da landmark, quando `as` é `nav` ou `section`. Duas landmarks do mesmo
   * tipo no documento precisam de nomes distintos.
   */
  'aria-label'?: string;
  children: ReactNode;
}) {
  // px-5 no menor tamanho: em 360px sobram os 320px de conteúdo que são o piso do
  // site. A folga maior entra só a partir de `sm`.
  const classes = ['mx-auto w-full px-5 sm:px-10', WIDTHS[width], className]
    .filter(Boolean)
    .join(' ');

  return (
    <Tag className={classes} id={id} aria-label={ariaLabel}>
      {children}
    </Tag>
  );
}
