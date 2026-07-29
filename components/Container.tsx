import type { ReactNode } from 'react';

/**
 * As duas larguras do §6.4: uma coluna de leitura estreita e centrada, e a
 * quebra de grade — "o único gesto de layout", reservado ao que é trabalho
 * (cards de projeto, prints, capa de case).
 *
 * `reading` fica em **44rem**. A versão anterior usava 36rem alegando "dentro da
 * faixa de 65–75 caracteres do §6.3", e a conta estava errada: 36rem = 648px é a
 * CAIXA, e o que sobra depois do padding é 576px. Medido no Chromium com o
 * Newsreader em 18px, 576px são **56,5 caracteres** — abaixo do piso de 65 do
 * §6.3, não dentro da faixa. A coluna estreitava a prosa em vez de protegê-la, e
 * de quebra empurrava a linha mais longa da Trajetória para duas linhas.
 *
 * 44rem = 792px de caixa e 702px de conteúdo, o que faz o `.prose-measure`
 * (68ch) finalmente ser o limite que morde — antes o contêiner cortava antes e o
 * token não fazia nada. Prosa em 68 caracteres, no meio da faixa do §6.3.
 *
 * Continuam **duas** variantes, e isso importa: o §6.4 diz que a quebra de grade
 * é "o único gesto de layout" e marca "aqui é trabalho, o resto é texto". Uma
 * terceira largura intermediária diluiria o gesto — por isso a Trajetória, que
 * é tabela e não prosa, foi acomodada alargando a coluna de leitura até a
 * medida que o §6.3 já pedia, e não ganhando um eixo próprio. `wide` segue
 * exclusiva dos cards de projeto: 1080 contra 792 ainda são 144px de sangria de
 * cada lado, visível de longe.
 */
const WIDTHS = {
  reading: 'max-w-[44rem]',
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
  id,
  children,
}: {
  as?: ContainerTag;
  width?: ContainerWidth;
  className?: string;
  /** Alvo de âncora. Só isso — não vire porta de entrada para props arbitrárias. */
  id?: string;
  children: ReactNode;
}) {
  // px-5 no menor tamanho: em 360px sobram 320px de conteúdo, que é o piso do §9.
  // Intocado de propósito — em telas estreitas a margem lateral é espaço que o
  // conteúdo não tem sobrando. A folga extra entra só a partir de `sm`, que é
  // onde a página estava apertada: px-10 (45px) no lugar de px-8 (36px).
  const classes = ['mx-auto w-full px-5 sm:px-10', WIDTHS[width], className]
    .filter(Boolean)
    .join(' ');

  return (
    <Tag className={classes} id={id}>
      {children}
    </Tag>
  );
}
