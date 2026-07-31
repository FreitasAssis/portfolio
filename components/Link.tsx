import type { ComponentProps } from 'react';

import NextLink from 'next/link';

/**
 * O `next/link` do site, com o prefetch de viewport desligado.
 *
 * O padrão do Next busca o payload de toda rota cujo link esteja na viewport, e
 * o cabeçalho está sempre na viewport: cada carga de página baixava três rotas
 * que o visitante pode nunca abrir, e na home e no `/projetos` também os dois
 * cases, que são os documentos mais pesados do site. Medido com o Lighthouse
 * sobre o `out/` servido por HTTP: 3180ms de LCP com prefetch, 2280ms sem, e
 * cinco pontos de performance nessas duas rotas.
 *
 * O que se abre mão é menos do que parece — `prefetch={false}` desliga só a
 * busca especulativa por estar na tela; o Next continua buscando no hover e no
 * touchstart, que é quando o visitante já demonstrou intenção.
 *
 * Quem impede um `next/link` cru de voltar é tests/unit/manutencao.test.ts.
 */
export function Link(props: ComponentProps<typeof NextLink>) {
  return <NextLink prefetch={false} {...props} />;
}
