import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import Page from '@/app/page';
import { experience } from '@/content/experience';

/** A home é uma árvore estática; renderizá-la inteira é o teste de comportamento
 *  mais próximo do que o visitante recebe. O `<main>` vem do layout (não daqui). */
function renderHome() {
  return render(<Page />);
}

const section = (name: RegExp | string) =>
  screen.getByRole('heading', { level: 2, name }).closest('section')!;

describe('Home — hero (§4.1)', () => {
  it('abre com a tese, em um h1 só', () => {
    renderHome();
    const h1 = screen.getAllByRole('heading', { level: 1 });
    expect(h1).toHaveLength(1);
    expect(h1[0]).toHaveTextContent(
      'Nove anos construindo software — e dois dos produtos aqui nasceram de problemas que eu mesmo vivo.',
    );
  });

  it('traz o eyebrow com cidade e cargo', () => {
    renderHome();
    expect(screen.getByText('Natal, RN · Desenvolvedor full stack sênior')).toBeInTheDocument();
  });

  it('põe os 400 mil no subhead — é o dado mais forte do currículo', () => {
    renderHome();
    expect(screen.getByText(/cerca de 400 mil alunos e professores/i)).toBeInTheDocument();
  });

  it('oferece os dois CTAs do §4.1', () => {
    renderHome();
    expect(screen.getByRole('link', { name: 'Ver os projetos' })).toHaveAttribute(
      'href',
      '/projetos',
    );
    expect(screen.getByRole('link', { name: 'Falar comigo' })).toHaveAttribute('href', '/contato');
  });

  it('não põe imagem no hero — ele pertence à tese (§6.5)', () => {
    const { container } = renderHome();
    const hero = screen.getByRole('heading', { level: 1 }).closest('section')!;
    expect(hero.querySelector('img')).toBeNull();
    expect(container.querySelectorAll('img')).toHaveLength(0);
  });
});

describe('Home — projetos próprios (§3.1, §4.6)', () => {
  it('o Asafe abre a seção (§4.6)', () => {
    renderHome();
    const nomes = within(section(/projetos próprios/i))
      .getAllByRole('heading', { level: 3 })
      .map((h) => h.textContent);
    expect(nomes).toEqual(['Asafe', 'E aí, fez?']);
  });

  it('o link principal leva ao app no ar, não ao case (§3.1)', () => {
    renderHome();
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

  it('mantém o case como link secundário', () => {
    renderHome();
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

  it('cada card empresta a própria cor ao site (§6.1)', () => {
    const { container } = renderHome();
    const zonas = Array.from(container.querySelectorAll('[data-accent]'));
    expect(zonas.map((z) => z.getAttribute('data-accent'))).toEqual(['asafe', 'eaifez']);
    expect(within(zonas[0] as HTMLElement).getByRole('heading', { level: 3 })).toHaveTextContent(
      'Asafe',
    );
  });

  it('a stack aparece grudada no projeto, nunca solta (§2)', () => {
    renderHome();
    const asafe = screen.getByRole('heading', { level: 3, name: 'Asafe' }).closest('article')!;
    expect(within(asafe).getByText('Next.js')).toBeInTheDocument();
    expect(within(asafe).getByText('Supabase')).toBeInTheDocument();
  });

  it('diz em alto e bom som que o print ainda não existe', () => {
    renderHome();
    const faltando = screen.getAllByText(/\{\{ *print/i);
    expect(faltando).toHaveLength(2);
  });
});

describe('Home — trajetória condensada (§3.1)', () => {
  it('lista as cinco posições, na ordem do dado', () => {
    renderHome();
    const linhas = within(section(/trajetória/i)).getAllByRole('listitem');
    expect(linhas).toHaveLength(experience.length);
    linhas.forEach((li, i) => {
      expect(li).toHaveTextContent(experience[i].company);
      expect(li).toHaveTextContent(experience[i].role);
    });
  });

  it('escreve na interface que Boomer e ez.devs correram em paralelo (§4.5)', () => {
    renderHome();
    const traj = section(/trajetória/i);
    const paralelas = within(traj).getAllByText(/em paralelo/i);
    expect(paralelas).toHaveLength(2);
  });

  it('mostra o fio contínuo ligando Opah e Analytica (§4.5)', () => {
    renderHome();
    const traj = section(/trajetória/i);
    expect(within(traj).getAllByText(/mesma plataforma, desde a concepção/i)).toHaveLength(2);
  });

  it('põe as datas em mono (§6.3)', () => {
    renderHome();
    const traj = section(/trajetória/i);
    // A linha de metadado carrega período e modalidade juntos; o que o §6.3
    // exige é que ela esteja na família mono.
    const data = within(traj).getByText(/^mar\/2023 — atual\b/);
    expect(data.className).toContain('font-mono');
    expect(within(traj).getByText(/^set\/2021 — mar\/2023\b/)).toBeInTheDocument();
  });

  it('leva ao detalhe em /projetos', () => {
    renderHome();
    expect(within(section(/trajetória/i)).getByRole('link', { name: /ver detalhe/i })).toHaveAttribute(
      'href',
      '/projetos',
    );
  });
});

describe('Home — como eu trabalho (§4.2)', () => {
  it('traz os três blocos, sem ícone', () => {
    renderHome();
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

  it('deixa o placeholder do documento de decisões visível, sem inventar URL (§0)', () => {
    renderHome();
    const bloco = section(/como eu trabalho/i);
    expect(
      within(bloco).getByText('{{ URL do documento de decisões do Asafe }}'),
    ).toBeInTheDocument();
    // Nenhum link para um caminho de documento que ninguém conferiu.
    const hrefs = within(bloco)
      .queryAllByRole('link')
      .map((a) => a.getAttribute('href'));
    expect(hrefs.filter((h) => /PLANNING|DECIS/i.test(h ?? ''))).toEqual([]);
  });
});

describe('Home — contato (§3.4)', () => {
  it('bifurca nos dois caminhos, com o mesmo peso', () => {
    renderHome();
    const titulos = within(section(/contato/i))
      .getAllByRole('heading', { level: 3 })
      .map((h) => h.textContent);
    expect(titulos).toEqual(['Tenho uma vaga', 'Tenho um projeto']);
  });

  it('dá e-mail copiável nos dois caminhos', () => {
    renderHome();
    const emails = within(section(/contato/i)).getAllByRole('link', {
      name: 'luiz_dev@outlook.com',
    });
    expect(emails).toHaveLength(2);
    emails.forEach((a) => expect(a).toHaveAttribute('href', 'mailto:luiz_dev@outlook.com'));
  });

  it('não tem formulário (§3.4, §11)', () => {
    const { container } = renderHome();
    expect(container.querySelector('form')).toBeNull();
    expect(container.querySelector('input')).toBeNull();
  });

  it('marca o CV como pendente em vez de inventar o link (§0)', () => {
    renderHome();
    const contato = section(/contato/i);
    expect(within(contato).getByText(/\{\{ *CV em PDF/i)).toBeInTheDocument();
    const hrefs = within(contato)
      .getAllByRole('link')
      .map((a) => a.getAttribute('href'));
    expect(hrefs.filter((h) => /\.pdf$/i.test(h ?? ''))).toEqual([]);
  });

  it('não expõe WhatsApp — a decisão ainda é do Luiz (§12)', () => {
    const { container } = renderHome();
    expect(container.textContent).not.toMatch(/whats\s?app/i);
    const hrefs = Array.from(container.querySelectorAll('a')).map((a) => a.getAttribute('href'));
    expect(hrefs.filter((h) => /wa\.me|whatsapp/i.test(h ?? ''))).toEqual([]);
  });
});

describe('Home — guardrails do brief', () => {
  it('não existe seção sobre IA (§4.2.1)', () => {
    const { container } = renderHome();
    const titulos = screen.getAllByRole('heading').map((h) => h.textContent ?? '');
    expect(titulos.filter((t) => /^ia\b|intelig[êe]ncia artificial/i.test(t))).toEqual([]);
    // Nem selo, nem "AI-assisted", nem parágrafo defensivo.
    expect(container.textContent).not.toMatch(/ai-assisted|intelig[êe]ncia artificial/i);
  });

  it('não renderiza um <main> próprio — a landmark é do layout', () => {
    const { container } = renderHome();
    expect(container.querySelector('main')).toBeNull();
  });

  it('mantém a ordem de blocos do §3.1', () => {
    renderHome();
    const h2 = screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent);
    expect(h2).toEqual(['Projetos próprios', 'Trajetória', 'Como eu trabalho', 'Contato']);
  });

  it('não se adjetiva — nada do vocabulário de venda do §4', () => {
    const { container } = renderHome();
    expect(container.textContent).not.toMatch(
      /soluç(ão|ões)|experiências digitais|impulsionar|inovador|excepcional|apaixonad/i,
    );
  });
});
