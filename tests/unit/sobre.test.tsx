import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import SobrePage from '@/app/sobre/page';
import { LAYER_1, LAYER_2, LAYER_2_CAVEAT, LAYER_3_NEVER } from '@/content/tech';

/**
 * `/sobre` (§3.4, §4.3, §4.4).
 *
 * O teste mais importante deste arquivo é o segundo: os **cinco** parágrafos do
 * §4.3 estão escritos aqui por extenso, e não importados de `content/about.ts`.
 * Importar deixaria o teste concordar com qualquer coisa que alguém escrevesse
 * lá. Copiado à mão, o texto do §4.3 fica travado nos dois sentidos: reescrever
 * quebra, acrescentar quebra.
 *
 * Eram três, e o guarda existia para impedir que o parágrafo final fosse
 * **gerado** — o §4.3 dizia "Não gerar" em letras maiúsculas. O Luiz escreveu os
 * dois últimos e o §12 fechou com "todo o texto do site está escrito", então a
 * trava mudou de alvo sem mudar de força: agora ela impede reescrita e adição
 * a um texto declarado terminado. O último parágrafo em especial tem calibragem
 * anotada no §4.3 ("porta encostada, não trancada nem escancarada"), e um
 * ajuste de temperatura feito de boa-fé é exatamente o tipo de mudança que este
 * teste precisa pegar.
 *
 * É a mesma disciplina de `tests/unit/experience.test.ts`, e ela nasceu de um
 * erro real neste repo: uma frase escrita ao lado de texto curado achatou "três
 * projetos em três times" para "a plataforma".
 */
const renderPagina = () => render(<SobrePage />);

/** §4.3, literal. Não conserte a pontuação; não "melhore o ritmo". */
const PARAGRAFOS_DO_BRIEF = [
  'Sou santista — nascido em Santos e torcedor do Peixe — e nordestino de coração: moro em Natal, no Rio Grande do Norte. Casado, e músico nas horas vagas.',
  'Programo profissionalmente desde 2017, quando comecei desenvolvendo web no IFRN, como bolsista no campus de Educação a Distância. De lá pra cá passei por startup, consultoria e educação, e hoje sou desenvolvedor full stack sênior na Analytica Ensino — onde acompanho, desde a concepção, uma plataforma educacional usada por cerca de 400 mil alunos, professores e gestores da rede pública do Paraná.',
  'A parte de músico não é hobby desencontrado do resto: é de onde saiu o Asafe. Passei anos organizando repertório de Missa em planilha e caderno, e resolvi construir a ferramenta que eu queria ter.',
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

describe('/sobre — o texto do §4.3', () => {
  it('tem um h1 só', () => {
    renderPagina();
    const h1 = screen.getAllByRole('heading', { level: 1 });
    expect(h1).toHaveLength(1);
    expect(h1[0]).toHaveTextContent('Sobre');
  });

  it('traz os cinco parágrafos do brief, verbatim — e nada além', () => {
    const { container } = renderPagina();
    const paragrafos = Array.from(secaoDoTexto(container).querySelectorAll('p')).map(
      (p) => p.textContent,
    );

    // Cinco, exatamente, e cada um comparado inteiro. Um sexto parágrafo, uma
    // vírgula trocada ou um "porta escancarada" no lugar do condicional do §4.3
    // falham aqui — que é o ponto: o §12 declara o texto do site terminado, e
    // texto terminado não se "melhora" em passagem.
    expect(paragrafos).toEqual(PARAGRAFOS_DO_BRIEF);
  });

  it('o último parágrafo mantém a calibragem do §4.3 — porta encostada', () => {
    const { container } = renderPagina();
    const texto = container.textContent ?? '';
    // O §4.3 anexa uma nota a este parágrafo: ele "não declara disponibilidade
    // NEM indisponibilidade". As duas formas de quebrá-lo têm sinais opostos e
    // são fáceis de escrever sem perceber, então as duas estão travadas.
    //
    // Quente demais — vira "disponível para oportunidades", proibido pelo nome
    // no §1:
    expect(texto).not.toMatch(/dispon[íi]vel (para|a)/i);
    expect(texto).not.toMatch(/aberto a (propostas|oportunidades)/i);
    expect(texto).not.toMatch(/procurando (vaga|oportunidade)/i);
    // Frio demais — se o site disser que ele não sai de lá, ninguém o guarda, e
    // ser guardado é a função da página (§1).
    expect(texto).not.toMatch(/não pretendo sair|não estou (procurando|disponível)/i);
    // E o condicional que sustenta as duas coisas continua escrito.
    expect(texto).toContain('Se um dia aparecer um próximo desafio');
  });

  it('não sobrou placeholder de texto na página (§12)', () => {
    const { container } = renderPagina();
    // §12: "todo o texto do site está escrito. O que falta é imagem e código."
    // Nada de "em breve", nada de lorem, nada de `{{ }}` de texto — o único
    // buraco legítimo da página é o do retrato, que é imagem.
    const texto = container.textContent ?? '';
    expect(texto).not.toMatch(/\bem breve\b/i);
    expect(texto).not.toMatch(/lorem ipsum/i);
    const buracos = texto.match(/\{\{[^}]*\}\}/g) ?? [];
    expect(buracos).toHaveLength(1);
    expect(buracos[0]).toMatch(/retrato/i);
  });

  it('não escreve adjetivo de venda (§4)', () => {
    const { container } = renderPagina();
    const texto = container.textContent ?? '';
    for (const proibido of [/soluç(ão|ões)/i, /experiências digitais/i, /impulsionar/i]) {
      expect(texto).not.toMatch(proibido);
    }
  });
});

describe('/sobre — as camadas de tecnologia (§4.4)', () => {
  it('a camada 1 aparece item a item, com destaque', () => {
    renderPagina();
    const tecnologia = secao(/tecnologia/i);
    const itens = within(tecnologia)
      .getAllByRole('listitem')
      .map((li) => li.textContent);
    expect(itens).toEqual([...LAYER_1]);
  });

  it('a camada 1 inclui React Native / Expo, como o CV (§4.5)', () => {
    // A divergência herdada da Task 4: o §4.4 punha React Native na camada 2, o
    // CV põe em "Uso hoje". Ganhou o CV — o §4.5 manda os dois contarem a mesma
    // história com as mesmas palavras, e o dado do próprio site (a stack da
    // Analytica em content/experience.ts, o Expo no frontmatter do Asafe) já
    // dizia "uso hoje". A justificativa inteira está em content/tech.ts.
    renderPagina();
    const tecnologia = secao(/tecnologia/i);
    expect(within(tecnologia).getByText('React Native / Expo').tagName).toBe('LI');
  });

  it('a camada 2 é um parágrafo só, com a frase de honestidade do brief', () => {
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

  it('a camada 3 não se lista (§4.4)', () => {
    const { container } = renderPagina();
    const texto = container.textContent ?? '';
    // "É como um chef listar 'sei usar faca'." `Git` com fronteira de palavra,
    // senão `GitHub` casaria e o teste falharia por motivo errado.
    for (const termo of LAYER_3_NEVER) {
      expect(texto).not.toMatch(new RegExp(`\\b${termo}\\b`));
    }
  });

  it('nenhuma camada usa ícone (§4.4, §6.5)', () => {
    renderPagina();
    const tecnologia = secao(/tecnologia/i);
    // "Texto e tipografia bastam, e ficam melhor" — e o §6.5 só admite duas
    // fontes de imagem no site, nenhuma delas logotipo de linguagem.
    expect(tecnologia.querySelectorAll('svg')).toHaveLength(0);
    expect(tecnologia.querySelectorAll('img')).toHaveLength(0);
  });
});

describe('/sobre — retrato e formação', () => {
  it('reserva o lugar do retrato, e o buraco diz o que a foto precisa ser (§6.5)', () => {
    const { container } = renderPagina();
    // A foto ainda não existe (§12). O buraco tem que gritar: se for ao ar por
    // engano, é impossível não ver — e quem for produzir o arquivo lê a
    // restrição na tela, sem abrir o brief.
    expect(screen.getByText(/\{\{ retrato do Luiz/i)).toBeInTheDocument();
    expect(screen.getByText(/com o instrumento ou em Natal/i)).toBeInTheDocument();
    expect(screen.getByText(/não headshot corporativo/i)).toBeInTheDocument();
    // Enquanto for placeholder, não há imagem nenhuma na página.
    expect(container.querySelectorAll('img')).toHaveLength(0);
  });

  it('mostra a formação sem nenhum dado de documento (§4.3)', () => {
    const { container } = renderPagina();
    const formacao = secao(/formação/i);
    expect(formacao.textContent).toContain('Tecnólogo em Análise e Desenvolvimento de Sistemas');
    expect(formacao.textContent).toContain('Universidade Potiguar (UnP)');
    expect(formacao.textContent).toContain('conclusão em dezembro de 2022');

    // "Sem foto de documento, sem data de nascimento, sem RG" — vale para a
    // página tanto quanto para o CV.
    //
    // O padrão NÃO pode ser `nascid`: o §4.3 abre com "nascido em Santos", que
    // é biografia e não documento. O que não pode aparecer é data — de
    // nascimento ou em qualquer outro lugar da página — e número de documento.
    const texto = container.textContent ?? '';
    expect(texto).not.toMatch(/\bRG\b|\bCPF\b/);
    expect(texto).not.toMatch(/data de nascimento|nascid[oa] em \d/i);
    expect(texto).not.toMatch(/\d{2}\/\d{2}\/(19|20)\d{2}/);
    expect(texto).not.toMatch(/\d{3}\.\d{3}\.\d{3}-\d{2}/);
  });
});

describe('/sobre — guardrails do brief', () => {
  it('põe pessoa antes de tecnologia (§3.4)', () => {
    renderPagina();
    const h2 = screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent);
    expect(h2).toEqual(['Tecnologia', 'Formação']);
    // E o texto do §4.3 vem antes do primeiro h2 — "pessoa primeiro,
    // tecnologia depois" é a ordem da página, não uma intenção.
    const primeiroH2 = screen.getByRole('heading', { level: 2, name: /tecnologia/i });
    const primeiroParagrafo = screen.getByText(PARAGRAFOS_DO_BRIEF[0]);
    expect(
      primeiroParagrafo.compareDocumentPosition(primeiroH2) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it('não existe seção sobre IA (§4.2.1)', () => {
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
