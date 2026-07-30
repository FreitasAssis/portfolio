import type { ReactNode } from 'react';

import { Container } from '@/components/Container';

type EndNavLabel = 'Fim da página' | 'Fim do case';

/**
 * O fim do conteúdo: uma régua, o caminho de volta ao topo e, quando existe, um
 * destino seguinte passado por `children`.
 *
 * Não traz margem de cima: o espaço acima da régua é do bloco anterior, porque
 * cada seção do site paga o próprio `py`.
 */
export function EndNav({
  label = 'Fim da página',
  children,
}: {
  readonly label?: EndNavLabel;
  readonly children?: ReactNode;
}) {
  return (
    <Container
      as="nav"
      width="reading"
      // O cabeçalho já é a navegação "Principal"; duas landmarks de navegação no
      // mesmo documento precisam de nomes diferentes para serem escolhíveis na
      // lista de um leitor de tela.
      aria-label={label}
      className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-4 border-t border-rule py-10 font-mono"
    >
      {children}

      {/* Fragmento NOMEADO (o `id` do <header>), nunca `href="#"`: os dois rolam
          para o topo, mas só o alvo nomeado move o ponto de partida da navegação
          sequencial de teclado. Com `#`, quem clica vê o topo e continua
          tabulando a partir do rodapé. */}
      <p className="text-xs text-ink-2">
        <a href="#topo" className="hover:text-ink">
          Voltar ao topo
        </a>
      </p>
    </Container>
  );
}
