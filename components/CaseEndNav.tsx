import Link from 'next/link';

import { Container } from '@/components/Container';
import type { Project } from '@/lib/projects';

/**
 * Fim do case: para onde ir depois de ter lido, e o caminho de volta ao topo.
 *
 * ## Por que existe, e por que NÃO é um botão flutuante
 *
 * A página de um case é longa de verdade — medido no Chromium sobre o `out/`:
 * 7.915px no Asafe e 6.719px no "E aí, fez?" em 1440×900 (8,8 e 7,5 telas), e
 * 14.138px / 12.068px em 360×740 (19,1 e 16,3 telas). Só a seção de decisões
 * responde por 41% a 53% dessa altura. Quem chega ao fim rolou muito.
 *
 * O reflexo seria o botão flutuante que aparece no scroll. Ele está descartado
 * pelo §6.4: "movimento: um só momento orquestrado — a transição de acento ao
 * entrar num case. Fora isso, hover discreto e nada mais". Um botão que entra e
 * sai da viewport é um segundo momento de movimento, precisa de componente de
 * cliente com listener de scroll, e flutua sobre o conteúdo justamente onde a
 * tela é mais apertada (§9, 360px).
 *
 * Este bloco é estático: zero JavaScript, nenhum movimento novo, foco de teclado
 * de graça, e disponível exatamente quando é desejado — quem quer o topo é quem
 * terminou de ler.
 *
 * ## O bloco tem DOIS trabalhos, e o primeiro é o mais importante
 *
 * No fim de um case, o que o leitor mais quer não é o topo do que ele acabou de
 * ler — é o **outro** case. O §4.6 coloca o Asafe em primeiro e o "E aí, fez?"
 * em segundo "sem diminuir"; um link do primeiro para o segundo é o que faz essa
 * ordem valer alguma coisa, em vez de ser só a ordem em que os dois aparecem nos
 * cards. O "voltar ao topo" vem depois, e menor.
 *
 * ## Tipografia e forma
 *
 * Mono, como manda o §6.3 para metadado — navegação é metadado, e é o que o
 * cabeçalho e o "Ver detalhe de cada posição" da `TimelineCondensed` já fazem.
 * O tratamento é o mesmo dos dois: o link primário em `text-accent-text` com
 * sublinhado, o secundário no registro quieto do rodapé (`text-ink-2`,
 * `hover:text-ink`). Nada de tratamento novo, nenhum ícone, nenhuma caixa — o
 * §6.4 já gastou o gesto de layout do site na quebra de grade dos cards, e este
 * bloco é texto e uma régua.
 *
 * A régua fica na coluna de leitura (`reading`, 792px) e não em `wide`, que é a
 * largura do rodapé (1080px). Duas réguas da mesma largura a 96px de distância
 * leriam como dois rodapés; mais estreita, a de cima lê como o fim da leitura.
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
    <Container
      as="nav"
      width="reading"
      // O cabeçalho já tem `aria-label="Principal"`. Duas landmarks de navegação
      // no mesmo documento precisam de nomes diferentes para serem escolhíveis
      // na lista de landmarks de um leitor de tela (§9).
      aria-label="Fim do case"
      className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-4 border-t border-rule py-10 font-mono"
    >
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

      {/* Âncora pura, sem JavaScript. O alvo é o `id` do <header> e não um
          `href="#"` vazio: os dois rolam para o topo, mas só o alvo nomeado
          move o ponto de partida da navegação sequencial de teclado para lá.
          Com `#`, quem clica vê o topo e continua tabulando a partir do rodapé.
          Não há `scroll-behavior: smooth` — ele brigaria com o §6.4 e com
          `prefers-reduced-motion`. */}
      <p className="text-xs text-ink-2">
        <a href="#topo" className="hover:text-ink">
          Voltar ao topo
        </a>
      </p>
    </Container>
  );
}
