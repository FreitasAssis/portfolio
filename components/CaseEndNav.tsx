import Link from 'next/link';

import { EndNav } from '@/components/EndNav';
import type { Project } from '@/lib/projects';

/**
 * Fim do case: para onde ir depois de ter lido, e o caminho de volta ao topo.
 *
 * A forma — a régua, a coluna, a tipografia mono, a âncora `#topo` e a landmark
 * nomeada — mora em `components/EndNav.tsx`, que é o mesmo bloco usado pela
 * home, pela `/projetos` e pelo `/sobre`. As razões de o bloco ser estático em
 * vez de um botão flutuante estão lá. O que é específico do case está aqui, e é
 * só uma coisa: o próximo case.
 *
 * ## O bloco tem DOIS trabalhos, e o primeiro é o mais importante
 *
 * No fim de um case, o que o leitor mais quer não é o topo do que ele acabou de
 * ler — é o **outro** case. O §4.6 coloca o Asafe em primeiro e o "E aí, fez?"
 * em segundo "sem diminuir"; um link do primeiro para o segundo é o que faz essa
 * ordem valer alguma coisa, em vez de ser só a ordem em que os dois aparecem nos
 * cards. O "voltar ao topo" vem depois, e menor.
 *
 * É também o que separa este bloco do das outras três páginas: a corrente dos
 * cases é uma sequência de verdade (Asafe → E aí, fez? → `/projetos`), derivada
 * do `order` do frontmatter. A home, a `/projetos` e o `/sobre` não têm
 * "próximo" nenhum a oferecer, e inventar um transformaria o bloco num menu de
 * navegação repetido em cada rota. Lá o bloco leva só a âncora.
 *
 * ## Sobre a cor do link "próximo case"
 *
 * O bloco fica DENTRO da `AccentZone` do case, então o link para o outro projeto
 * usa a cor do projeto atual. É deliberado, e é o que o §6.1 já diz: "o acento é
 * injetado pelo projeto que está na tela" — a cor descreve onde você está, não
 * para onde o link vai. O mesmo já vale para o "Luiz Freitas" do cabeçalho, que
 * aponta para a home vestindo o acento do case aberto.
 *
 * Tirar o bloco da zona também custaria margem no `AccentTracker`, e a conta é
 * medida, não estimada. No fim da página, com o bloco DENTRO, a zona cobre 76,0%
 * da viewport em 1440×900 e 59,6% em 360×740; com ele fora, cairia para 63,3% e
 * **39,4%** — a 4,4 pontos do limiar de 35%. Um bloco de duas linhas em vez de
 * uma, ou uma tela um pouco mais baixa, e o acento se apagaria bem no fim do
 * case: movimento novo no lugar mais silencioso possível.
 */
export function CaseEndNav({ next }: { readonly next: Project | null }) {
  return (
    <EndNav label="Fim do case">
      <p className="text-sm">
        {next ? (
          <Link
            href={`/projetos/${next.slug}`}
            className="text-accent-text underline underline-offset-4"
          >
            Próximo case: {next.name}
          </Link>
        ) : (
          // Último case da ordem: o destino é a `/projetos`, e não o primeiro
          // case. Voltar ao primeiro fecharia um laço sem saída e ofereceria uma
          // página que este leitor provavelmente já viu; a `/projetos` é a rota
          // pai, contém os dois cases E a experiência profissional (§3.2), que é
          // a única coisa que ainda não foi lida por quem chegou até aqui.
          <Link href="/projetos" className="text-accent-text underline underline-offset-4">
            Ver todos os projetos
          </Link>
        )}
      </p>
    </EndNav>
  );
}
