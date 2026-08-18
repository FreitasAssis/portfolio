import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import ProjetosPage from '@/app/projetos/page';
import { CHROME, Timeline, threadArrow } from '@/components/Timeline';
import { formatPeriod } from '@/components/TimelineCondensed';
import { experience } from '@/content/experience';
import { getAllProjects } from '@/lib/projects';

/**
 * `/projetos` — a página que carrega o conteúdo por posição, enquanto a
 * trajetória da home fica em cinco linhas de índice.
 *
 * O que esta página garante, e a home de propósito não:
 *
 *   - rotular "em paralelo" toda posição sobreposta;
 *   - marcar o fio contínuo **sinalizando** o `impact`, sem frase nova;
 *   - distinguir sobreposição de fio contínuo sem depender de cor;
 *   - mostrar `built`, `impact` e `stack` por posição.
 */

/** A página é um Server Component assíncrono: lê `content/projects/*.mdx`. */
async function renderPagina() {
  return render(await ProjetosPage());
}

const secao = (name: RegExp | string) =>
  screen.getByRole('heading', { level: 2, name }).closest('section')!;

/**
 * Todo texto que esta página escreve e que NÃO vem de `content/experience.ts`.
 *
 * Está literal aqui de propósito: é a lista completa das palavras inventadas na
 * seção de experiência, e ela cabe em três linhas. Mexer nela é mexer neste
 * teste — que é exatamente o atrito que se quer, porque foi por uma frase
 * "só para ajudar a entender" que a imprecisão entrou da primeira vez.
 */
const ROTULOS = {
  parallel: 'em paralelo',
  thread: 'fio contínuo',
  separator: ' · ',
} as const;

describe('/projetos — as duas seções', () => {
  it('rotula as duas seções, projetos próprios antes da experiência', async () => {
    await renderPagina();
    expect(screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent)).toEqual([
      'Projetos próprios',
      'Experiência profissional',
    ]);
  });

  it('tem um h1 só, e ele cobre as duas metades', async () => {
    await renderPagina();
    const h1 = screen.getAllByRole('heading', { level: 1 });
    expect(h1).toHaveLength(1);
    expect(h1[0]).toHaveTextContent('Projetos e experiência');
  });

  it('não mistura: iniciativa de um lado, experiência do outro', async () => {
    // Uma seção mostra iniciativa, a outra mostra experiência: se as duas se
    // contaminarem, a distinção deixa de existir.
    await renderPagina();
    const proprios = secao(/projetos próprios/i).textContent ?? '';
    const trabalho = secao(/experiência profissional/i).textContent ?? '';

    for (const item of experience) {
      expect(proprios).not.toContain(item.company);
    }
    for (const p of await getAllProjects()) {
      expect(trabalho).not.toContain(p.name);
    }
    // E nenhum link para app no ar dentro da experiência: o card é o lugar do
    // "abrir o app".
    expect(within(secao(/experiência profissional/i)).queryAllByRole('link')).toEqual([]);
  });

  it('não renderiza um <main> próprio — a landmark é do layout', async () => {
    const { container } = await renderPagina();
    expect(container.querySelector('main')).toBeNull();
  });
});

describe('/projetos — projetos próprios', () => {
  it('o Asafe abre a seção', async () => {
    await renderPagina();
    const nomes = within(secao(/projetos próprios/i))
      .getAllByRole('heading', { level: 3 })
      .map((h) => h.textContent);
    expect(nomes).toEqual(['Asafe', 'E aí, fez?', 'Ciranda']);
  });

  it('cada card leva ao app e ao case, e empresta a própria cor', async () => {
    const { container } = await renderPagina();
    const cards = secao(/projetos próprios/i);

    expect(within(cards).getByRole('link', { name: /abrir o asafe/i })).toHaveAttribute(
      'href',
      'https://asafe.mus.br',
    );
    expect(within(cards).getByRole('link', { name: /ler o case do asafe/i })).toHaveAttribute(
      'href',
      '/projetos/asafe',
    );
    expect(within(cards).getByRole('link', { name: /abrir o e aí, fez\?/i })).toHaveAttribute(
      'href',
      'https://eaifez.com.br',
    );
    expect(
      Array.from(container.querySelectorAll('[data-accent]')).map((z) =>
        z.getAttribute('data-accent'),
      ),
    ).toEqual(['asafe', 'eaifez', 'ciranda']);
  });

  it('o card mostra o `cardShot` do conteúdo, retrato nos dois', async () => {
    // A orientação é decisão de conteúdo (frontmatter `cardShot`), não um
    // `if (slug === ...)` no componente: os dois cards são vistos no mesmo
    // instante oferecendo a mesma coisa, e retrato ao lado de paisagem lê como
    // duas categorias de coisa em vez de duas ofertas paralelas.
    const { container } = await renderPagina();
    const projetos = await getAllProjects();
    const imagens = Array.from(container.querySelectorAll('img'));

    expect(imagens.map((img) => img.getAttribute('alt'))).toEqual(
      projetos.map((p) => p.cardShot.alt),
    );
    for (const img of imagens) {
      expect(Number(img.getAttribute('height'))).toBeGreaterThan(Number(img.getAttribute('width')));
    }
  });

  it('a stack do card sai do conteúdo, grudada no projeto', async () => {
    await renderPagina();
    const asafe = screen.getByRole('heading', { level: 3, name: 'Asafe' }).closest('article')!;
    const doConteudo = (await getAllProjects())[0].stack.map((s) => s.name);
    expect(
      within(asafe)
        .getAllByRole('listitem')
        .map((li) => li.textContent),
    ).toEqual(doConteudo);
  });
});

/* ------------------------------------------------------------------------- *
 * Experiência profissional
 * ------------------------------------------------------------------------- */

describe('/projetos — experiência profissional', () => {
  const renderTimeline = () => render(<Timeline />);

  const entrada = (company: string) =>
    screen.getByRole('heading', { level: 3, name: new RegExp(company) }).closest('li')!;

  it('/projetos mostra built, impact e stack por posição', () => {
    renderTimeline();
    const linhas = screen.getAllByRole('listitem').filter((li) => li.querySelector('h3'));
    expect(linhas).toHaveLength(experience.length);

    for (const item of experience) {
      const li = entrada(item.company);
      expect(li, `${item.company}: built`).toHaveTextContent(item.built);
      expect(li, `${item.company}: impact`).toHaveTextContent(item.impact);
      expect(li, `${item.company}: cargo`).toHaveTextContent(item.role);
      expect(li, `${item.company}: modalidade`).toHaveTextContent(item.mode);
      for (const tech of item.stack) {
        expect(within(li).getByText(tech), `${item.company}: ${tech}`).toBeInTheDocument();
      }
    }
  });

  it('/projetos rotula "em paralelo" toda posição sobreposta', () => {
    // O conjunto vem do dado — `parallel` é derivado de `start`/`end` e travado
    // em tests/unit/experience.test.ts. Aqui o que se verifica é que TODA
    // posição rotulada no dado aparece rotulada na tela, e nenhuma outra.
    renderTimeline();
    const comRotulo = experience.filter((e) => e.parallel);
    expect(comRotulo.map((e) => e.company)).toEqual(['Opah IT', 'ez.devs', 'Boomer']);

    expect(screen.getAllByText(new RegExp(ROTULOS.parallel, 'i'))).toHaveLength(comRotulo.length);

    for (const item of experience) {
      const li = entrada(item.company);
      if (item.parallel) {
        // Sem o rótulo, a sobreposição parece erro de data; com ele, é
        // capacidade. E ele nomeia a contraparte, senão só troca uma dúvida
        // por outra.
        expect(li).toHaveTextContent(new RegExp(`${ROTULOS.parallel}.*${item.parallel}`, 'i'));
      } else {
        expect(li.textContent, item.company).not.toMatch(new RegExp(ROTULOS.parallel, 'i'));
      }
    }
  });

  it('/projetos marca o fio contínuo SINALIZANDO o impact, sem frase nova', () => {
    renderTimeline();
    const comFio = experience.filter((e) => e.thread);
    expect(comFio.map((e) => e.company)).toEqual(['Analytica Ensino', 'Opah IT']);

    const marcas = screen.getAllByText(new RegExp(ROTULOS.thread, 'i'));
    expect(marcas).toHaveLength(comFio.length);

    for (const item of comFio) {
      const marca = within(entrada(item.company)).getByText(new RegExp(ROTULOS.thread, 'i'));
      // O marcador SINALIZA o texto curado: ele e o `impact` são o mesmo bloco.
      // Se um dia o marcador virar um parágrafo ao lado, isto quebra — e era
      // exatamente essa a porta por onde entrou "a plataforma da Analytica
      // nasceu na Opah IT", que achatava três projetos em três times a um só.
      const bloco = marca.parentElement!;
      expect(bloco, item.company).toHaveTextContent(item.impact);
      // E o bloco marcado é o `impact`, não a entrada inteira: marcar tudo não
      // sinaliza nada.
      expect(bloco.textContent, item.company).not.toContain(item.built);
    }

    // Nenhuma frase nova sobre a carreira: o marcador é um rótulo curto, não uma
    // oração.
    expect(ROTULOS.thread.split(/\s+/)).toHaveLength(2);
    expect(ROTULOS.thread).not.toMatch(/[.!?]/);
  });

  it('/projetos distingue sobreposição de fio contínuo sem depender de cor', () => {
    // As duas ideias são opostas — simultaneidade × continuidade — e se
    // encontram na Opah IT, que carrega as duas. Se usarem a mesma linguagem
    // visual, os dois melhores argumentos da timeline se anulam. A distinção
    // não pode ser cor — que morre em daltonismo, tema escuro e impressão — nem
    // movimento: é forma, eixo e lugar.
    renderTimeline();
    const opah = entrada('Opah IT');
    const sobreposicao = within(opah).getByText(new RegExp(ROTULOS.parallel, 'i')).closest('p')!;
    const fio = within(opah).getByText(new RegExp(ROTULOS.thread, 'i')).parentElement!;

    // 1. Forma: caixa fechada nos quatro lados × régua aberta, só à esquerda.
    expect(sobreposicao.className).toMatch(/\bborder\b/);
    expect(sobreposicao.className).not.toMatch(/border-l-/);
    expect(fio.className).toMatch(/border-l-/);
    expect(fio.className).not.toMatch(/(^|\s)border(\s|$)/);

    // 2. Lugar: a sobreposição é nota sobre o TEMPO e fica junto das datas, no
    //    cabeçalho; o fio é nota sobre o TRABALHO e fica colado ao `impact`.
    expect(sobreposicao.textContent).not.toContain(byCompany('Opah IT').impact);
    expect(fio.textContent).toContain(byCompany('Opah IT').impact);

    // 3. Direção: o fio aponta para a outra ponta, que é uma posição vizinha na
    //    página. A caixa não aponta para lugar nenhum — ela se fecha.
    expect(fio.textContent).toMatch(/[↑↓]/);
    expect(sobreposicao.textContent).not.toMatch(/[↑↓]/);
    expect(threadArrow(0)).toBe('↓'); // Analytica, com a Opah logo abaixo
    expect(threadArrow(1)).toBe('↑'); // Opah, com a Analytica logo acima
    expect(threadArrow(2)).toBeNull(); // ez.devs não tem fio

    // 4. E nenhuma das duas depende de cor para existir: as duas têm rótulo em
    //    texto, que é o que sobrevive a daltonismo, tema escuro e impressão.
    expect(sobreposicao.textContent).toMatch(new RegExp(ROTULOS.parallel, 'i'));
    expect(fio.textContent).toMatch(new RegExp(ROTULOS.thread, 'i'));
    for (const marca of [sobreposicao, fio]) {
      expect(marca.className).not.toMatch(/\btext-(red|green|blue|amber|accent)/);
      expect(marca.className).not.toMatch(/\bbg-(red|green|blue|amber|accent)/);
    }
  });

  it('põe as datas em mono', () => {
    renderTimeline();
    for (const item of experience) {
      const data = within(entrada(item.company)).getByText(
        new RegExp(`^${formatPeriod(item)}`),
      );
      expect(data.className, item.company).toContain('font-mono');
    }
  });

  it('não tem uma palavra sobre a experiência que não venha do dado', () => {
    // O mesmo teste que guarda a trajetória da home, agora no /projetos — que é
    // onde o conteúdo de verdade mora. A seção inteira é remontada a partir de
    // `experience` mais os três rótulos de interface acima, e comparada letra a
    // letra. Qualquer frase escrita à mão sobre a carreira quebra aqui.
    render(<Timeline />);
    expect(CHROME).toEqual(ROTULOS);

    const esperado = [
      'Experiência profissional',
      ...experience.map((item, i) => {
        const seta = threadArrow(i);
        const cabecalho = [
          `${formatPeriod(item)}${ROTULOS.separator}${item.mode}`,
          `${item.company}${ROTULOS.separator}${item.role}`,
          item.parallel ? `${ROTULOS.parallel}${ROTULOS.separator}${item.parallel}` : '',
        ].join('');
        const impacto = seta ? `${ROTULOS.thread} ${seta}${item.impact}` : item.impact;
        return `${cabecalho}${item.built}${impacto}${item.stack.join('')}`;
      }),
    ].join('');

    expect(secao(/experiência profissional/i).textContent).toBe(esperado);
  });
});

const byCompany = (company: string) => experience.find((e) => e.company === company)!;

describe('/projetos — fim da página', () => {
  it('fecha com o "voltar ao topo", no mesmo idioma dos cases', async () => {
    // A página mais alta do site fora dos cases: dois cards grandes e cinco
    // posições com `built`, `impact` e `stack` — 4,9 telas em 1440×900, e em
    // 360px muito mais. A forma vem de `components/EndNav.tsx`.
    await renderPagina();
    const topo = screen.getByRole('link', { name: 'Voltar ao topo' });
    expect(topo).toHaveAttribute('href', '#topo');
    expect(screen.getByRole('navigation', { name: 'Fim da página' })).toContainElement(topo);
  });

  it('não inventa um "próximo" — o bloco leva só a âncora', async () => {
    await renderPagina();
    const bloco = screen.getByRole('navigation', { name: 'Fim da página' });
    expect(within(bloco).getAllByRole('link')).toHaveLength(1);
  });
});
