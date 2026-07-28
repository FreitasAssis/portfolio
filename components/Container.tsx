import type { ReactNode } from 'react';

/**
 * As duas larguras do §6.4: uma coluna de leitura estreita e centrada, e a
 * quebra de grade — "o único gesto de layout", reservado ao que é trabalho
 * (cards de projeto, prints, capa de case).
 *
 * `reading` fica em 36rem porque a raiz está em 18px (globals.css), o que dá
 * ~648px: dentro da faixa de 65–75 caracteres do §6.3 para o corpo serifado.
 * A medida do texto corrido em si continua sendo `.prose-measure`; isto aqui é
 * a coluna da página.
 *
 * Duas variantes de propósito. Uma terceira largura intermediária só teria como
 * critério "achei melhor assim", e a quebra de grade perde o efeito na terceira
 * vez que acontece.
 */
const WIDTHS = {
  reading: 'max-w-[36rem]',
  wide: 'max-w-[60rem]',
} as const;

export type ContainerWidth = keyof typeof WIDTHS;

/** Elementos que fazem sentido como caixa de layout. Lista fechada em vez de
 *  `ElementType` para não abrir mão da checagem do JSX. */
type ContainerTag = 'div' | 'section' | 'header' | 'footer' | 'article' | 'nav' | 'ul';

export function Container({
  as: Tag = 'div',
  width = 'reading',
  className,
  children,
}: {
  as?: ContainerTag;
  width?: ContainerWidth;
  className?: string;
  children: ReactNode;
}) {
  // px-5 no menor tamanho: em 360px sobram 320px de conteúdo, que é o piso do §9.
  const classes = ['mx-auto w-full px-5 sm:px-8', WIDTHS[width], className]
    .filter(Boolean)
    .join(' ');

  return <Tag className={classes}>{children}</Tag>;
}
