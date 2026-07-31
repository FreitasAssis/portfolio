import { existsSync } from 'node:fs';
import { join } from 'node:path';

import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import SobrePage from '@/app/sobre/page';
import { LAYER_1, LAYER_2, LAYER_2_CAVEAT, LAYER_3_NEVER } from '@/content/tech';
import { caminhoDoArquivo } from '../helpers/next-image';

/**
 * `/sobre`.
 *
 * O teste mais importante deste arquivo é o segundo: os **cinco** parágrafos da
 * página estão escritos aqui por extenso, e não importados de
 * `content/about.ts`. Importar deixaria o teste concordar com qualquer coisa
 * que alguém escrevesse lá. Copiados à mão, eles ficam travados nos dois
 * sentidos: reescrever quebra, acrescentar quebra.
 *
 * O texto do site está declarado terminado, então é reescrita — e não geração —
 * o que a trava pega hoje. O último parágrafo em especial é calibrado ("porta
 * encostada, não trancada nem escancarada"), e um ajuste de temperatura feito
 * de boa-fé é exatamente o tipo de mudança que este teste precisa pegar.
 *
 * É a mesma disciplina de `tests/unit/experience.test.ts`, e ela nasceu de um
 * erro real neste repo: uma frase escrita ao lado de texto curado achatou "três
 * projetos em três times" para "a plataforma".
 */
const renderPagina = () => render(<SobrePage />);

/** O texto curado, literal. Não conserte a pontuação; não "melhore o ritmo". */
const PARAGRAFOS_CURADOS = [
  'Sou santista — nascido em Santos e torcedor do Peixe — e nordestino de coração: moro em Natal, no Rio Grande do Norte. Casado, e músico nas horas vagas.',
  'Programo profissionalmente desde 2017, quando comecei desenvolvendo web no IFRN, como bolsista no campus de Educação a Distância. De lá pra cá passei por startup, consultoria e educação, e hoje sou desenvolvedor full stack sênior na Analytica Ensino — onde acompanho, desde a concepção, uma plataforma educacional usada por cerca de 400 mil alunos, professores e gestores da rede pública do Paraná.',
  'A parte de músico não é hobby desencontrado do resto, já tocava na igreja antes mesmo de programar, inclusive o Asafe veio daqui. Passei anos organizando repertório de Missa em drive, planilha e caderno, e resolvi construir a ferramenta que eu queria ter há tempos, a que torna prático esse trabalho e que se tornou o meu xodó.',
  'Estou na Analytica desde 2023 e gosto de onde estou. Esse portfólio é uma forma de deixar registrado o que construí, e de ser facilmente encontrado.',
  'Se um dia aparecer um próximo desafio, o que me atrai é problema com regra própria — onde entender o domínio é metade do trabalho, ou até mais. Gosto de coisa bem planejada, de participar da decisão quando posso, e de time onde ajudar quem está ao lado é rotina.',
];

const secao = (name: RegExp | string) =>
  screen.getByRole('heading', { level: 2, name }).closest('section')!;

/** A seção de texto é a que não tem `h2` — é a que abre a página, sob o `h1`. */
const secaoDoTexto = (container: HTMLElement) =>
  Array.from(container.querySelectorAll('section')).find(
    (s) => s.querySelector('h2') === null,
  )!;

describe('/sobre — os parágrafos curados', () => {
  it('tem um h1 só', () => {
    renderPagina();
    const h1 = screen.getAllByRole('heading', { level: 1 });
    expect(h1).toHaveLength(1);
    expect(h1[0]).toHaveTextContent('Sobre');
  });

  it('traz os cinco parágrafos curados, verbatim — e nada além', () => {
    const { container } = renderPagina();
    const paragrafos = Array.from(secaoDoTexto(container).querySelectorAll('p')).map(
      (p) => p.textContent,
    );

    // Cinco, exatamente, e cada um comparado inteiro. Um sexto parágrafo, uma
    // vírgula trocada ou um "porta escancarada" no lugar do condicional falham
    // aqui — que é o ponto: texto terminado não se "melhora" em passagem.
    //
    // O retrato mora DENTRO desta seção, entre os parágrafos, então a contagem
    // virou também a trava contra legenda: uma linha de texto sob a foto entra
    // aqui como sexto parágrafo e reprova.
    expect(paragrafos).toEqual(PARAGRAFOS_CURADOS);
  });

  it('o último parágrafo deixa a porta encostada: nem disponível, nem indisponível', () => {
    const { container } = renderPagina();
    const texto = container.textContent ?? '';
    // O parágrafo não declara disponibilidade NEM indisponibilidade. As duas
    // formas de quebrá-lo têm sinais opostos e são fáceis de escrever sem
    // perceber, então as duas estão travadas.
    //
    // Quente demais — vira "disponível para oportunidades", que é a linguagem
    // de venda que o site não usa:
    expect(texto).not.toMatch(/dispon[íi]vel (para|a)/i);
    expect(texto).not.toMatch(/aberto a (propostas|oportunidades)/i);
    expect(texto).not.toMatch(/procurando (vaga|oportunidade)/i);
    // Frio demais — se o site disser que ele não sai de lá, ninguém o guarda, e
    // ser guardado é a função da página.
    expect(texto).not.toMatch(/não pretendo sair|não estou (procurando|disponível)/i);
    // E o condicional que sustenta as duas coisas continua escrito.
    expect(texto).toContain('Se um dia aparecer um próximo desafio');
  });

  it('não sobrou placeholder nenhum na página', () => {
    const { container } = renderPagina();
    // `{{ }}` é a marca de asset que ainda não chegou. Nenhuma sobra aqui.
    const texto = container.textContent ?? '';
    expect(texto).not.toMatch(/\bem breve\b/i);
    expect(texto).not.toMatch(/lorem ipsum/i);
    expect(texto.match(/\{\{[^}]*\}\}/g) ?? []).toEqual([]);
  });

  it('não escreve adjetivo de venda', () => {
    const { container } = renderPagina();
    const texto = container.textContent ?? '';
    for (const proibido of [/soluç(ão|ões)/i, /experiências digitais/i, /impulsionar/i]) {
      expect(texto).not.toMatch(proibido);
    }
  });
});

describe('/sobre — as camadas de tecnologia', () => {
  it('a camada 1 aparece item a item, com destaque', () => {
    renderPagina();
    const tecnologia = secao(/tecnologia/i);
    const itens = within(tecnologia)
      .getAllByRole('listitem')
      .map((li) => li.textContent);
    expect(itens).toEqual([...LAYER_1]);
  });

  it('a camada 1 inclui React Native / Expo, como o CV', () => {
    // React Native / Expo fica na camada 1, e não na 2: é onde o CV o põe, e o
    // site e o CV contam a mesma história com as mesmas palavras. O dado do
    // próprio site já dizia "uso hoje" — a stack da Analytica em
    // content/experience.ts, o Expo no frontmatter do Asafe. A justificativa
    // inteira está em content/tech.ts.
    renderPagina();
    const tecnologia = secao(/tecnologia/i);
    expect(within(tecnologia).getByText('React Native / Expo').tagName).toBe('LI');
  });

  it('a camada 2 é um parágrafo só, com a frase de honestidade', () => {
    renderPagina();
    const tecnologia = secao(/tecnologia/i);
    const paragrafo = within(tecnologia)
      .getAllByText(/já entreguei em produção/i)
      .map((el) => el.closest('p'))
      .find(Boolean)!;
    for (const item of LAYER_2) {
      expect(paragrafo.textContent).toContain(item);
    }
    expect(paragrafo.textContent).toContain(LAYER_2_CAVEAT);
    // "bloco secundário, menor": o parágrafo não pode reaparecer como lista, ou
    // as duas camadas leriam com o mesmo peso.
    expect(paragrafo.querySelector('ul')).toBeNull();
  });

  it('a camada 3 não se lista', () => {
    const { container } = renderPagina();
    const texto = container.textContent ?? '';
    // "É como um chef listar 'sei usar faca'." `Git` com fronteira de palavra,
    // senão `GitHub` casaria e o teste falharia por motivo errado.
    for (const termo of LAYER_3_NEVER) {
      expect(texto).not.toMatch(new RegExp(`\\b${termo}\\b`));
    }
  });

  it('nenhuma camada usa ícone', () => {
    renderPagina();
    const tecnologia = secao(/tecnologia/i);
    // Texto e tipografia bastam, e ficam melhor. Só existem duas fontes de
    // imagem no site, e nenhuma delas é logotipo de linguagem.
    expect(tecnologia.querySelectorAll('svg')).toHaveLength(0);
    expect(tecnologia.querySelectorAll('img')).toHaveLength(0);
  });
});

describe('/sobre — retrato e formação', () => {
  it('publica o retrato — uma imagem só, com dimensões declaradas', () => {
    const { container } = renderPagina();
    const imagens = Array.from(container.querySelectorAll('img'));
    expect(imagens).toHaveLength(1);
    const [retrato] = imagens;

    // Sem `width`/`height` nos atributos a caixa não reserva altura nenhuma sob
    // `images.unoptimized`, e a foto abre em 0×0 empurrando a formação para
    // cima. É a mesma trava dos prints da galeria.
    expect(Number(retrato.getAttribute('width'))).toBeGreaterThan(0);
    expect(Number(retrato.getAttribute('height'))).toBeGreaterThan(0);

    // O arquivo é 4:5 — a proporção é premissa do componente, e o /contato usa
    // outro recorte justamente porque esta não serve lá.
    const largura = Number(retrato.getAttribute('width'));
    const altura = Number(retrato.getAttribute('height'));
    expect(largura / altura).toBeCloseTo(4 / 5, 2);

    // A caixa não pode voltar a pedir mais pixels do que o arquivo tem: 490px
    // de fonte cobrem 245px de CSS num display 2x, e a raiz do site é 18px.
    const teto = retrato.className.match(/max-w-\[([\d.]+)rem\]/);
    expect(teto, `sem teto de largura em ${retrato.className}`).not.toBeNull();
    expect(Number(teto![1]) * 18 * 2).toBeLessThanOrEqual(largura);
  });

  it('o alt descreve a fotografia, não o papel dela na página', () => {
    const { container } = renderPagina();
    const alt = container.querySelector('img')!.getAttribute('alt') ?? '';
    // A mesma régua de `lib/projects.ts` para os prints: alt curto ou genérico
    // é a regressão mais fácil que existe, porque ninguém revisa alt.
    expect(alt.trim().length).toBeGreaterThan(20);
    expect(alt.trim()).not.toMatch(/^(print|screenshot|imagem|foto|retrato)$/i);
    // E ele conta o que se vê: o violão e o microfone estão na foto.
    expect(alt).toMatch(/viol[ãa]o/i);
    expect(alt).toMatch(/microfone/i);
  });

  it('o retrato vem logo depois do terceiro parágrafo, em ordem de DOM', () => {
    const { container } = renderPagina();
    const secao = secaoDoTexto(container);
    const retrato = secao.querySelector('img');

    // A foto mora na mesma seção do texto, e não num bloco solto depois dela:
    // é assim que ela deixa de ser apêndice e vira a prova do parágrafo que
    // diz que ele já tocava na igreja antes de programar.
    expect(retrato, 'o retrato saiu da seção do texto').not.toBeNull();

    // Ordem de DOM, não posição em pixel: é ela que decide o que um leitor de
    // tela ouve, e ela continua certa se alguém trocar o CSS por grade ou
    // `order`. O teste em pixel que confere a centralização é o de e2e — aqui
    // o jsdom não faz layout nenhum.
    const terceiro = screen.getByText(PARAGRAFOS_CURADOS[2]);
    const quarto = screen.getByText(PARAGRAFOS_CURADOS[3]);
    expect(
      terceiro.compareDocumentPosition(retrato!) & Node.DOCUMENT_POSITION_FOLLOWING,
      'o retrato não vem depois do terceiro parágrafo',
    ).toBeTruthy();
    expect(
      quarto.compareDocumentPosition(retrato!) & Node.DOCUMENT_POSITION_PRECEDING,
      'o retrato não vem antes do quarto parágrafo',
    ).toBeTruthy();
  });

  it('o retrato não disputa banda com o LCP, que aqui é um parágrafo', () => {
    const { container } = renderPagina();
    const retrato = container.querySelector('img')!;
    // A foto subiu para o meio do texto, que é onde imagem costuma virar LCP —
    // e foi medida de novo lá. Na emulação móvel do Lighthouse ela nasce em
    // y=936, fora da dobra de 823; na de desktop aparece inteira e ainda perde
    // em área para o segundo parágrafo (73.872px² contra 93.555px²), que é o
    // elemento de LCP que o Lighthouse aponta nas duas.
    //
    // `lazy` sozinho não segura (a margem do lazy-loading do Chrome é maior que
    // a distância até ela), daí a prioridade baixa. O dia em que o Lighthouse
    // apontar a foto, este teste inverte — mas por medição, não por palpite.
    expect(retrato.getAttribute('loading')).toBe('lazy');
    expect(retrato.getAttribute('fetchpriority')).toBe('low');
  });

  it('o arquivo do retrato existe no repo, e é o que o componente declara', () => {
    const { container } = renderPagina();
    const img = container.querySelector('img')!;
    // `src` quebrado não dá sintoma nenhum num export estático: o build não
    // confere `/public`, e o buraco só aparece pra quem abriu a página. Mesma
    // razão do teste do CV, em tests/unit/contato.test.tsx.
    const src = caminhoDoArquivo(img);
    expect(src).toMatch(/^\/retrato\/.+\.webp$/);
    expect(existsSync(join(process.cwd(), 'public', src))).toBe(true);
  });

  it('mostra a formação sem nenhum dado de documento', () => {
    const { container } = renderPagina();
    const formacao = secao(/formação/i);
    expect(formacao.textContent).toContain('Tecnólogo em Análise e Desenvolvimento de Sistemas');
    expect(formacao.textContent).toContain('Universidade Potiguar (UnP)');
    expect(formacao.textContent).toContain('conclusão em dezembro de 2022');

    // Sem foto de documento, sem data de nascimento, sem RG — vale para a
    // página tanto quanto para o CV.
    //
    // O padrão NÃO pode ser `nascid`: o primeiro parágrafo abre com "nascido em
    // Santos", que é biografia e não documento. O que não pode aparecer é data
    // — de nascimento ou em qualquer outro lugar da página — e número de
    // documento.
    const texto = container.textContent ?? '';
    expect(texto).not.toMatch(/\bRG\b|\bCPF\b/);
    expect(texto).not.toMatch(/data de nascimento|nascid[oa] em \d/i);
    expect(texto).not.toMatch(/\d{2}\/\d{2}\/(19|20)\d{2}/);
    expect(texto).not.toMatch(/\d{3}\.\d{3}\.\d{3}-\d{2}/);
  });
});

describe('/sobre — guardrails de conteúdo', () => {
  it('põe pessoa antes de tecnologia', () => {
    renderPagina();
    const h2 = screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent);
    expect(h2).toEqual(['Tecnologia', 'Formação']);
    // E o texto vem antes do primeiro h2 — "pessoa primeiro, tecnologia depois"
    // é a ordem da página, não uma intenção.
    const primeiroH2 = screen.getByRole('heading', { level: 2, name: /tecnologia/i });
    const primeiroParagrafo = screen.getByText(PARAGRAFOS_CURADOS[0]);
    expect(
      primeiroParagrafo.compareDocumentPosition(primeiroH2) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it('não existe seção sobre IA', () => {
    const { container } = renderPagina();
    const titulos = screen.getAllByRole('heading').map((h) => h.textContent ?? '');
    expect(titulos.filter((t) => /^ia\b|intelig[êe]ncia artificial/i.test(t))).toEqual([]);
    expect(container.textContent).not.toMatch(/ai-assisted|intelig[êe]ncia artificial/i);
  });

  it('não renderiza um <main> próprio — a landmark é do layout', () => {
    const { container } = renderPagina();
    expect(container.querySelector('main')).toBeNull();
  });
});

describe('/sobre — fim da página', () => {
  it('fecha com o "voltar ao topo", no mesmo idioma dos cases', () => {
    // 2,1 telas em 1440×900 — a mais curta das três que ganharam o bloco, e
    // ainda assim cinco parágrafos, o retrato, duas camadas de tecnologia e a
    // formação. Em 360px isso não cabe em uma tela nem perto.
    renderPagina();
    const topo = screen.getByRole('link', { name: 'Voltar ao topo' });
    expect(topo).toHaveAttribute('href', '#topo');
    expect(screen.getByRole('navigation', { name: 'Fim da página' })).toContainElement(topo);
  });

  it('não inventa um "próximo" — o bloco leva só a âncora', () => {
    renderPagina();
    const bloco = screen.getByRole('navigation', { name: 'Fim da página' });
    expect(within(bloco).getAllByRole('link')).toHaveLength(1);
  });
});
