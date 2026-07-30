import type { ReactNode } from 'react';

import { Container } from '@/components/Container';

/**
 * Nomes de landmark que o site usa no fim do conteúdo. Lista fechada, pelo mesmo
 * motivo da lista de tags do `Container`: o §9 exige que duas landmarks do mesmo
 * tipo tenham nomes distintos, e o cabeçalho já ocupou "Principal". Dois valores
 * possíveis não deixam ninguém inventar um terceiro nome por acidente.
 */
type EndNavLabel = 'Fim da página' | 'Fim do case';

/**
 * O fim do conteúdo: uma régua, o caminho de volta ao topo e, quando existe, um
 * destino seguinte passado por `children`.
 *
 * Este componente é a **forma** compartilhada; quem decide o que vem antes do
 * "voltar ao topo" é o chamador. Hoje são dois: `CaseEndNav`, que oferece o
 * próximo case, e as páginas curtas (home, `/projetos`, `/sobre`), que não têm
 * "próximo" nenhum e usam só a âncora.
 *
 * ## Por que NÃO é um botão flutuante
 *
 * As páginas de case são longas de verdade — medido no Chromium sobre o `out/`:
 * 7.915px no Asafe e 6.719px no "E aí, fez?" em 1440×900 (8,8 e 7,5 telas), e
 * 14.138px / 12.068px em 360×740 (19,1 e 16,3 telas). As outras três também
 * pedem o atalho: a home tem 4,4 telas em 1440×900 e a `/projetos` 4,9, e em
 * 360px o mesmo conteúdo é duas a três vezes mais alto.
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
 * terminou de ler. E porque **não custa nada**, não há motivo para racioná-lo por
 * altura de página. A decisão anterior de deixá-lo só nos cases foi tomada
 * medindo altura de desktop; o `/projetos` sozinho carrega dois cards grandes
 * mais cinco posições de timeline com `built`, `impact` e `stack`.
 *
 * ## Onde ele NÃO está: `/contato`
 *
 * A única rota de conteúdo sem este bloco. O §3.4 encolheu a página para um
 * título, uma linha e quatro links — ela cabe numa tela, e um "voltar ao topo"
 * ali aponta para onde a pessoa já está. A ausência é decisão registrada, com
 * teste: `tests/unit/contato.test.tsx` conta os links da página inteira e
 * `tests/e2e/contato.spec.ts` conta os do `<main>`.
 *
 * ## Por que aqui e não no rodapé
 *
 * O rodapé seria o lugar óbvio — ele já vem depois de `<main>` em todas as rotas
 * e resolveria as três páginas de uma vez. Foi descartado por três razões:
 *
 * 1. Ele apareceria no `/contato`, que é exatamente onde não se quer.
 * 2. Ele apareceria **duas vezes** num case, junto do bloco que já existe lá.
 * 3. O rodapé é `contentinfo` e é chrome do site: os mesmos três contatos e o
 *    ano, iguais em toda rota. Um "voltar ao topo" ali lê como parte do móvel;
 *    no fim do `<main>` ele lê como o fim do que se estava lendo, que é
 *    literalmente o que ele é.
 *
 * ## Tipografia e forma
 *
 * Mono, como manda o §6.3 para metadado — navegação é metadado, e é o que o
 * cabeçalho e o "Ver detalhe de cada posição" da `TimelineCondensed` já fazem.
 * O tratamento é o mesmo dos dois: o link primário (quando existe) em
 * `text-accent-text` com sublinhado, o "voltar ao topo" no registro quieto do
 * rodapé (`text-ink-2`, `hover:text-ink`). Nada de tratamento novo, nenhum
 * ícone, nenhuma caixa — o §6.4 já gastou o gesto de layout do site na quebra de
 * grade dos cards, e este bloco é texto e uma régua.
 *
 * A régua fica na coluna de leitura (`reading`, 792px) e não em `wide`, que é a
 * largura do rodapé (1080px). Duas réguas da mesma largura a 96px de distância
 * leriam como dois rodapés; mais estreita, a de cima lê como o fim da leitura.
 *
 * O espaço acima da régua é do bloco anterior, não deste: cada seção do site
 * paga o próprio `py`. Foi por isso que a seção "Formação" do `/sobre` trocou
 * `pt-16` por `py-16` — ela era a última da página e não precisava de fundo.
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
      // O cabeçalho já tem `aria-label="Principal"`. Duas landmarks de navegação
      // no mesmo documento precisam de nomes diferentes para serem escolhíveis
      // na lista de landmarks de um leitor de tela (§9).
      aria-label={label}
      className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-4 border-t border-rule py-10 font-mono"
    >
      {/* Sem `children`, o `justify-between` deixa a âncora sozinha no início da
          coluna — alinhada ao texto da página, e não solta na margem direita. */}
      {children}

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
