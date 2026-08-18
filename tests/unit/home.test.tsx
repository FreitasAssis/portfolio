import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import Page from '@/app/page';
import { formatPeriod } from '@/components/TimelineCondensed';
import { CV } from '@/content/contact';
import { experience } from '@/content/experience';
import { getAllProjects } from '@/lib/projects';

/** A home é uma árvore estática; renderizá-la inteira é o teste de comportamento
 *  mais próximo do que o visitante recebe. O `<main>` vem do layout (não daqui). */
async function renderHome() {
  return render(await Page());
}

const section = (name: RegExp | string) =>
  screen.getByRole('heading', { level: 2, name }).closest('section')!;

describe('Home — hero', () => {
  it('abre com a tese, em um h1 só', async () => {
    await renderHome();
    const h1 = screen.getAllByRole('heading', { level: 1 });
    expect(h1).toHaveLength(1);
    expect(h1[0]).toHaveTextContent(
      'Construo software desde 2017 — e dois dos produtos aqui nasceram de problemas que eu mesmo vivo.',
    );
  });

  it('traz o eyebrow com cidade e cargo', async () => {
    await renderHome();
    expect(screen.getByText('Natal, RN · Desenvolvedor full stack sênior')).toBeInTheDocument();
  });

  it('põe os 400 mil no subhead — é o dado mais forte do currículo', async () => {
    await renderHome();
    // Os três substantivos, e não dois: é assim que o CV escreve, e o site e o
    // CV contam a mesma história com as mesmas palavras.
    expect(
      screen.getByText(/cerca de 400 mil alunos, professores e gestores/i),
    ).toBeInTheDocument();
  });

  it('oferece os dois CTAs do hero', async () => {
    await renderHome();
    expect(screen.getByRole('link', { name: 'Ver os projetos' })).toHaveAttribute(
      'href',
      '/projetos',
    );
    expect(screen.getByRole('link', { name: 'Falar comigo' })).toHaveAttribute('href', '/contato');
  });

  it('não põe imagem no hero — ele pertence à tese', async () => {
    const { container } = await renderHome();
    const hero = screen.getByRole('heading', { level: 1 }).closest('section')!;
    expect(hero.querySelector('img')).toBeNull();
    // Só existem duas fontes de imagem no site — prints de projeto e o retrato
    // —, e nenhuma delas é decoração. Na home, as únicas imagens são os prints
    // dos cards: uma por projeto, contada a partir do conteúdo para que um case
    // novo não possa entrar trazendo imagem de enfeite junto.
    const imagens = Array.from(container.querySelectorAll('img'));
    expect(imagens).toHaveLength((await getAllProjects()).length);
    for (const img of imagens) {
      expect(img.closest('article')).not.toBeNull();
    }
  });
});

describe('Home — projetos próprios', () => {
  it('o Asafe abre a seção', async () => {
    await renderHome();
    const nomes = within(section(/projetos próprios/i))
      .getAllByRole('heading', { level: 3 })
      .map((h) => h.textContent);
    expect(nomes).toEqual(['Asafe', 'E aí, fez?', 'Ciranda']);
  });

  it('o link principal leva ao app no ar, não ao case', async () => {
    await renderHome();
    const cards = section(/projetos próprios/i);
    expect(within(cards).getByRole('link', { name: /abrir o asafe/i })).toHaveAttribute(
      'href',
      'https://asafe.mus.br',
    );
    expect(within(cards).getByRole('link', { name: /abrir o e aí, fez\?/i })).toHaveAttribute(
      'href',
      'https://eaifez.com.br',
    );
  });

  it('mantém o case como link secundário', async () => {
    await renderHome();
    const cards = section(/projetos próprios/i);
    expect(within(cards).getByRole('link', { name: /ler o case do asafe/i })).toHaveAttribute(
      'href',
      '/projetos/asafe',
    );
    expect(within(cards).getByRole('link', { name: /ler o case do e aí, fez\?/i })).toHaveAttribute(
      'href',
      '/projetos/eaifez',
    );
  });

  it('cada card empresta a própria cor ao site', async () => {
    const { container } = await renderHome();
    const zonas = Array.from(container.querySelectorAll('[data-accent]'));
    expect(zonas.map((z) => z.getAttribute('data-accent'))).toEqual([
      'asafe',
      'eaifez',
      'ciranda',
    ]);
    expect(within(zonas[0] as HTMLElement).getByRole('heading', { level: 3 })).toHaveTextContent(
      'Asafe',
    );
  });

  it('a stack aparece grudada no projeto, nunca solta', async () => {
    await renderHome();
    const asafe = screen.getByRole('heading', { level: 3, name: 'Asafe' }).closest('article')!;
    expect(within(asafe).getByText('Next.js')).toBeInTheDocument();
    expect(within(asafe).getByText('Supabase')).toBeInTheDocument();
  });

  it('o card mostra o print que o conteúdo escolheu para ele, em retrato', async () => {
    // O card não usa necessariamente a `cover`: a do "E aí, fez?" é a imagem OG
    // do app, paisagem, e um cartão largo ao lado de um celular alto faz o olho
    // ler duas CATEGORIAS de coisa em vez de duas ofertas paralelas. Quem
    // escolhe é o frontmatter (`cardShot`), não um `if` aqui dentro — e o
    // carregador recusa `cardShot` paisagem.
    const { container } = await renderHome();
    const projetos = await getAllProjects();
    const imagens = Array.from(container.querySelectorAll('img'));

    expect(imagens.map((img) => img.getAttribute('alt'))).toEqual(
      projetos.map((p) => p.cardShot.alt),
    );
    for (const img of imagens) {
      expect(Number(img.getAttribute('height'))).toBeGreaterThan(
        Number(img.getAttribute('width')),
      );
    }
    // `{{ }}` é a marca de asset que ainda não chegou; nenhuma sobrou.
    expect(container.textContent).not.toMatch(/\{\{ *print/i);
  });
});

describe('Home — trajetória condensada', () => {
  it('lista as cinco posições, na ordem do dado', async () => {
    await renderHome();
    const linhas = within(section(/trajetória/i)).getAllByRole('listitem');
    expect(linhas).toHaveLength(experience.length);
    linhas.forEach((li, i) => {
      expect(li).toHaveTextContent(experience[i].company);
      expect(li).toHaveTextContent(experience[i].role);
    });
  });

  it('cabe em uma linha por posição — é índice, não conteúdo', async () => {
    // Cinco linhas, uma por posição. O bloco fica entre os cards de projeto e o
    // "Como eu trabalho", e o papel dele na página é ser respiro entre dois
    // blocos densos: cada <li> carrega período, empresa e cargo, e nada além.
    await renderHome();
    const traj = section(/trajetória/i);

    for (const li of within(traj).getAllByRole('listitem')) {
      expect(li.querySelectorAll('p')).toHaveLength(2);
    }

    // O conteúdo por posição — `built`, `impact`, `stack` — mora no /projetos.
    // Se vazar para cá, o bloco deixa de ser índice: já aconteceu, com três
    // linhas e uma régua vertical por posição.
    const texto = traj.textContent ?? '';
    expect(texto).not.toMatch(/em paralelo/i);
    expect(texto).not.toMatch(/\bRemoto\b/);
    for (const item of experience) {
      expect(texto).not.toContain(item.built.slice(0, 40));
      expect(texto).not.toContain(item.impact.slice(0, 40));
      expect(texto).not.toContain(item.stack.join(', '));
    }
  });

  it('não tem uma palavra sobre a experiência que não venha do dado', async () => {
    // O texto da seção é remontado a partir de `experience` e comparado inteiro.
    // Qualquer frase escrita à mão sobre a carreira — por mais bem-intencionada
    // que seja — quebra aqui.
    //
    // Não é purismo: foi assim que a imprecisão entrou. Uma nota inventada para
    // sinalizar o fio contínuo ("a plataforma da Analytica nasceu na Opah IT")
    // lia como se a Opah tivesse sido só a Analytica, quando foram três projetos
    // em times distintos. O texto certo já está em `content/experience.ts`; o
    // site não reescreve.
    await renderHome();
    const esperado = [
      'Trajetória',
      ...experience.map((e) => `${formatPeriod(e)}${e.company} · ${e.role}`),
      'Ver detalhe de cada posição',
    ].join('');
    expect(section(/trajetória/i).textContent).toBe(esperado);
  });

  it('põe as datas em mono', async () => {
    await renderHome();
    const traj = section(/trajetória/i);
    const data = within(traj).getByText(/^mar\/2023 — atual$/);
    expect(data.className).toContain('font-mono');
    expect(within(traj).getByText(/^set\/2021 — mar\/2023$/)).toBeInTheDocument();
  });

  /* Âncora, não o topo. O link promete "detalhe de cada posição", e o topo do
     /projetos é a seção de projetos próprios — cair lá obrigaria a rolar
     passando pelos cards grandes até achar o que foi prometido. O alvo
     `#experiencia` vive em components/Timeline.tsx; um e2e confere que ele
     existe de fato na página construída, porque href apontando para âncora
     inexistente é falha silenciosa: o navegador não reclama, só não sai do
     lugar. */
  it('leva ao detalhe na âncora da experiência em /projetos', async () => {
    await renderHome();
    expect(within(section(/trajetória/i)).getByRole('link', { name: /ver detalhe/i })).toHaveAttribute(
      'href',
      '/projetos#experiencia',
    );
  });
});

describe('Home — como eu trabalho', () => {
  it('traz os três blocos, sem ícone', async () => {
    await renderHome();
    const titulos = within(section(/como eu trabalho/i))
      .getAllByRole('heading', { level: 3 })
      .map((h) => h.textContent);
    expect(titulos).toEqual([
      'Decido com justificativa.',
      'Escopo é uma decisão, não um acidente.',
      'Faço com cuidado o que envolve outras pessoas.',
    ]);
    expect(section(/como eu trabalho/i).querySelectorAll('svg')).toHaveLength(0);
  });

  it('linka os dois documentos de decisão do Asafe', async () => {
    // O link é o que substitui qualquer declaração sobre método: documento de
    // decisão é o trabalho que a ferramenta não faz no seu lugar. Precisa
    // existir e abrir, senão a alegação fica sem o convite de auditoria que a
    // sustenta.
    //
    // São dois porque dois é o que o repo público do Asafe versiona, e porque um
    // documento pode ser acidente enquanto dois, em eixos diferentes do mesmo
    // projeto, são hábito — que é o que se quer provar.
    await renderHome();
    const bloco = within(section(/como eu trabalho/i));
    expect(bloco.getByRole('link', { name: 'DESIGN.md' })).toHaveAttribute(
      'href',
      'https://github.com/FreitasAssis/Asafe/blob/main/docs/DESIGN.md',
    );
    expect(bloco.getByRole('link', { name: 'identidade-visual.md' })).toHaveAttribute(
      'href',
      'https://github.com/FreitasAssis/Asafe/blob/main/docs/identidade-visual.md',
    );
  });

  it('apresenta os documentos como convite, e não como fileira de links', async () => {
    await renderHome();
    const bloco = section(/como eu trabalho/i);
    // Os dois links moram na MESMA frase — "no repo público do Asafe: X e Y" —,
    // que é o que faz deles um lugar onde o trabalho está escrito em vez de dois
    // botões. Se alguém os separar em parágrafos ou numa lista, quebra aqui.
    const links = Array.from(bloco.querySelectorAll('a'));
    expect(links).toHaveLength(2);
    expect(links[0].closest('p')).toBe(links[1].closest('p'));
    expect(links[0].closest('p')!.textContent).toMatch(/no repo público do Asafe:/i);
    expect(bloco.querySelectorAll('li')).toHaveLength(0);
  });

  it('o primeiro bloco não ganha cláusula além de "o que fica de fora, e por quê"', async () => {
    await renderHome();
    const texto = section(/como eu trabalho/i).textContent ?? '';
    // A frase é "o que vai ser construído, o que fica de fora, e por quê". Um
    // "e de que forma" já entrou aqui na escrita, e ele troca justificativa por
    // execução — no bloco que se chama "Decido com justificativa".
    expect(texto).toContain('o que vai ser construído, o que fica de fora, e por quê.');
    expect(texto).not.toMatch(/de que forma/i);
  });

  it('não sobrou placeholder onde o documento já existe', async () => {
    const { container } = await renderHome();
    expect(container.textContent).not.toMatch(/URL do documento de decisões/i);
    // E não nomeia arquivo que não está no repo: `PLANNING.md` e `REVISAO.md`
    // não são versionados no Asafe. Link de auditoria que dá 404 desfaz o
    // convite que ele faz.
    expect(container.textContent).not.toMatch(/PLANNING\.md/i);
    expect(container.textContent).not.toMatch(/REVISAO\.md/i);
  });
});

describe('Home — contato', () => {
  it('lista os quatro canais na ordem: e-mail, LinkedIn, GitHub, CV', async () => {
    await renderHome();
    const hrefs = within(section(/contato/i))
      .getAllByRole('link')
      .map((a) => a.getAttribute('href'));
    expect(hrefs).toEqual([
      'mailto:luiz_dev@outlook.com',
      'https://www.linkedin.com/in/luiz-dev',
      'https://github.com/FreitasAssis',
      CV.href,
    ]);
  });

  it('não bifurca mais em "tenho uma vaga" / "tenho um projeto"', async () => {
    // Os dois caminhos saíram porque pressupunham venda ativa: o site existe
    // para ser alcançável, não para converter. Um h3 novo aqui seria a triagem
    // voltando pela porta dos fundos.
    await renderHome();
    const contato = section(/contato/i);
    expect(within(contato).queryAllByRole('heading', { level: 3 })).toEqual([]);
    expect(contato.textContent).not.toMatch(/tenho uma vaga|tenho um projeto/i);
  });

  it('dá o e-mail copiável uma vez, por extenso', async () => {
    await renderHome();
    const emails = within(section(/contato/i)).getAllByRole('link', {
      name: 'luiz_dev@outlook.com',
    });
    // Uma vez: quando eram dois caminhos o endereço aparecia duplicado, um em
    // cada caixa. Sem as caixas, repeti-lo seria ruído.
    expect(emails).toHaveLength(1);
    emails.forEach((a) => expect(a).toHaveAttribute('href', 'mailto:luiz_dev@outlook.com'));
  });

  it('não tem formulário', async () => {
    const { container } = await renderHome();
    expect(container.querySelector('form')).toBeNull();
    expect(container.querySelector('input')).toBeNull();
  });

  it('baixa o CV, com a data no nome do arquivo', async () => {
    // A data mora no nome do arquivo porque é o único dos dois lugares (nome ou
    // rodapé do PDF) que o visitante vê antes de abrir — e porque o arquivo
    // continua datado na pasta de Downloads de quem recebeu.
    await renderHome();
    const contato = section(/contato/i);
    expect(within(contato).queryByText(/\{\{ *CV em PDF/i)).toBeNull();
    const cv = within(contato).getByRole('link', { name: CV.label });
    expect(cv).toHaveAttribute('href', CV.href);
    expect(CV.href).toMatch(/^\/cv\/luiz-freitas-\d{4}-\d{2}\.pdf$/);
  });

  it('não publica telefone nem WhatsApp', async () => {
    // Publicar um número é irreversível: ele sai de indexador, de print, de
    // encaminhamento. Por isso a varredura olha o que a PÁGINA publica, e não
    // uma constante — se um dia o número entrar, ele entra como link novo em
    // `CONTACT_LINKS` e este teste falha.
    const { container } = await renderHome();
    expect(container.textContent).not.toMatch(/whats\s?app/i);
    const hrefs = Array.from(container.querySelectorAll('a')).map((a) => a.getAttribute('href'));
    expect(hrefs.filter((h) => /wa\.me|whatsapp|^tel:/i.test(h ?? ''))).toEqual([]);
  });
});

describe('Home — guardrails de conteúdo', () => {
  it('não existe seção sobre IA', async () => {
    const { container } = await renderHome();
    const titulos = screen.getAllByRole('heading').map((h) => h.textContent ?? '');
    expect(titulos.filter((t) => /^ia\b|intelig[êe]ncia artificial/i.test(t))).toEqual([]);
    // Nem selo, nem "AI-assisted", nem parágrafo defensivo.
    expect(container.textContent).not.toMatch(/ai-assisted|intelig[êe]ncia artificial/i);
  });

  it('não renderiza um <main> próprio — a landmark é do layout', async () => {
    const { container } = await renderHome();
    expect(container.querySelector('main')).toBeNull();
  });

  it('mantém a ordem dos quatro blocos da home', async () => {
    await renderHome();
    const h2 = screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent);
    expect(h2).toEqual(['Projetos próprios', 'Trajetória', 'Como eu trabalho', 'Contato']);
  });

  it('não se adjetiva — nada do vocabulário de venda', async () => {
    const { container } = await renderHome();
    expect(container.textContent).not.toMatch(
      /soluç(ão|ões)|experiências digitais|impulsionar|inovador|excepcional|apaixonad/i,
    );
  });
});

describe('Home — fim da página', () => {
  it('fecha com o "voltar ao topo", no mesmo idioma dos cases', async () => {
    // A forma vem de `components/EndNav.tsx` e é a mesma em quatro rotas — não
    // uma variação escrita aqui. O alvo é `#topo`, nunca `href="#"`: os dois
    // rolam igual, mas o fragmento vazio deixa o ponto de partida do Tab no
    // rodapé.
    await renderHome();
    const topo = screen.getByRole('link', { name: 'Voltar ao topo' });
    expect(topo).toHaveAttribute('href', '#topo');
    expect(screen.getByRole('navigation', { name: 'Fim da página' })).toContainElement(topo);
  });

  it('não inventa um "próximo" — o bloco leva só a âncora', async () => {
    // A corrente de "próximo case" só existe nos cases, que têm uma sequência a
    // oferecer. Na home ela seria menu de navegação repetido.
    await renderHome();
    const bloco = screen.getByRole('navigation', { name: 'Fim da página' });
    expect(within(bloco).getAllByRole('link')).toHaveLength(1);
    expect(bloco.textContent).not.toMatch(/próxim/i);
  });
});
