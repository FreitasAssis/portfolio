import Image from 'next/image';

/**
 * O retrato. As duas escalas de uso passam por aqui, e cada uma tem o seu
 * arquivo: são dois **recortes do mesmo frame**, não duas fotos.
 *
 * O 4:5 seria o recorte natural nas duas, mas na versão pequena ele não serve:
 * a caixa tem 180px, e num 4:5 o rosto sai com uns 50px de altura. O quadrado
 * dá o mesmo rosto maior na mesma largura, porque corta o corpo do violão em
 * vez de encolher a cena inteira.
 *
 * **Cada arquivo tem exatamente 2× a caixa em que é desenhado** — 490 para uma
 * caixa de 243px, 360 para uma de 180. A foto é um frame de vídeo, e o recorte
 * maior tem 490px de largura: não existe nem existirá original maior, então a
 * caixa é que se ajusta ao arquivo, e não o contrário.
 */
const RETRATOS = {
  page: {
    src: '/retrato/4x5.webp',
    width: 490,
    height: 613,
    // O que este recorte mostra e o quadrado não: o corpo do violão, a mão
    // sobre as cordas e o salão em volta.
    alt: 'Luiz cantando ao microfone com a mão sobre as cordas do violão, de camiseta verde e correia no ombro, num salão de parede branca e luz natural',
    /**
     * 13,5rem × 18px de raiz = **243px**, e não 216 — a raiz do site é 18px
     * (`app/globals.css`). Num display 2x isso pede 486px de fonte, e o arquivo
     * tem 490: a tela mais comum recebe a foto em 1:1, sem ampliar.
     *
     * Os 16rem de antes davam 288px, que num 2x pediriam 576px de uma fonte de
     * 490 — a foto vinha de um vídeo e não existe original maior, então a conta
     * só fecha encolhendo a caixa.
     */
    largura: 'max-w-[13.5rem]',
    /**
     * O LCP do `/sobre` é um PARÁGRAFO, não a foto — e isso foi **medido de
     * novo** depois de ela subir para o meio do texto, que é justo onde uma
     * imagem costuma virar o LCP.
     *
     * Na emulação móvel do Lighthouse (412×823) ela nasce em y=936: fora da
     * dobra, área zero, fora da disputa. Na de desktop (1350×940) ela aparece
     * inteira e ainda assim perde — 243×304 = 73.872px² contra os 693×135 =
     * 93.555px² do segundo parágrafo, que é o elemento que o Lighthouse aponta
     * nas duas emulações.
     *
     * Sem `priority`, então: o preload só disputaria banda com as fontes de que
     * o parágrafo depende. Mas a folga no desktop é de 26%, e não de uma ordem
     * de grandeza — quem aumentar a caixa da foto ou encurtar aquele parágrafo
     * mede de novo antes de confiar nesta linha.
     */
    prioridade: false,
  },
  inline: {
    src: '/retrato/1x1.webp',
    /**
     * 360, e não os 490 do recorte original. A caixa tem 10rem × 18px = 180px,
     * e 360 é o 2× exato dela — o arquivo maior custava 5KB e, **medido**, 80ms
     * de LCP nesta rota, o bastante para derrubar a performance de 95 para 94.
     *
     * O preço é um 3× ampliando 1,5× em vez de 1,1×. É um preço pequeno numa
     * caixa de 180px sobre uma foto que já sai mole de um frame de vídeo: o que
     * limita o detalhe ali é a fonte, não a contagem de pixels do arquivo.
     */
    width: 360,
    height: 360,
    // Aqui não há corpo de violão nem salão para descrever: o recorte fecha no
    // rosto e sobra o braço do instrumento cruzando a frente.
    alt: 'Luiz cantando ao microfone, de camiseta verde, com o braço do violão e a correia cruzando o peito diante de uma parede branca',
    largura: 'max-w-[10rem]',
    /**
     * Aqui, sim. O `/contato` é uma página de quatro linhas, e o Lighthouse
     * aponta esta foto como o **elemento de LCP** — com `lazy` o
     * `lcp-lazy-loaded` reprova (score 0).
     *
     * É o oposto do que aconteceu na home, onde o `priority` estava no primeiro
     * card e o LCP era a h1; o critério é o mesmo, e só a medição decide.
     */
    prioridade: true,
  },
} as const;

/**
 * Sem prop de `className`: quem chama posiciona a foto pelo elemento em volta,
 * não por classe injetada aqui. `tests/unit/sobre.test.tsx` lê o teto de largura
 * direto da classe, por regex, para conferir que a caixa não pede mais pixels do
 * que o arquivo tem — um segundo `max-w` vindo de fora faria essa leitura casar
 * com a classe errada.
 *
 * (E escrever o nome dessa classe com colchetes aqui teria custo real: o
 * Tailwind varre o texto do arquivo inteiro, comentário incluído, e publica uma
 * regra a partir do que achar.)
 */
export function Portrait({
  /** `page` no /sobre; `inline` no bloco de contato, onde ela é "versão pequena". */
  size = 'page',
}: {
  readonly size?: 'page' | 'inline';
}) {
  const retrato = RETRATOS[size];

  return (
    <Image
      src={retrato.src}
      alt={retrato.alt}
      width={retrato.width}
      height={retrato.height}
      // Largura DEFINIDA em CSS, altura em `auto`. A proporção dos atributos só
      // reserva espaço se um dos eixos for definido: com os dois em `auto` a
      // imagem abre em 0×0 até o byte chegar, e a página reflui.
      //
      // E o anel não é enfeite: a parede da foto é branca e o papel do tema
      // claro também, então sem ele o retrato não tem onde terminar.
      className={`h-auto w-full rounded-md ring-1 ring-rule ${retrato.largura}`}
      priority={retrato.prioridade}
      // Onde a foto NÃO é o LCP: `lazy` sozinho não segura, pela margem do
      // lazy-loading do Chrome. A prioridade baixa não adia a busca, só põe a
      // foto atrás das fontes de que o elemento de LCP depende.
      fetchPriority={retrato.prioridade ? undefined : 'low'}
    />
  );
}
