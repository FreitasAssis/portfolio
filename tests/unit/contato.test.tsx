import { existsSync } from 'node:fs';
import { join } from 'node:path';

import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import ContatoPage from '@/app/contato/page';
import { CV, EMAIL, WHATSAPP } from '@/content/contact';

/**
 * `/contato` (§3.4): dois caminhos lado a lado com a **mesma dignidade visual**,
 * e-mail em texto copiável, GitHub, LinkedIn, CV — e **sem formulário**.
 */
const renderPagina = () => render(<ContatoPage />);

const caminho = (titulo: string) =>
  screen.getByRole('heading', { level: 2, name: titulo }).closest('div')!;

describe('/contato — a bifurcação do §3.4', () => {
  it('tem um h1 só, e os dois caminhos no mesmo nível abaixo dele', () => {
    renderPagina();
    const h1 = screen.getAllByRole('heading', { level: 1 });
    expect(h1).toHaveLength(1);
    expect(h1[0]).toHaveTextContent('Contato');

    const h2 = screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent);
    expect(h2).toEqual(['Tenho uma vaga', 'Tenho um projeto', 'De qualquer forma']);
  });

  it('dá aos dois caminhos a mesma dignidade visual', () => {
    renderPagina();
    const vaga = caminho('Tenho uma vaga');
    const projeto = caminho('Tenho um projeto');

    // A igualdade é medida na classe renderizada, não prometida em comentário:
    // mesma caixa, mesma tipografia, mesmo nível de título. Os dois saem do
    // mesmo `map` em ContactPaths, então divergir exigiria trabalho — mas o §3.4
    // chama a igualdade de requisito, e requisito se trava.
    expect(vaga.className).toBe(projeto.className);
    expect(vaga.querySelector('h2')!.className).toBe(projeto.querySelector('h2')!.className);
    expect(vaga.querySelector('p')!.className).toBe(projeto.querySelector('p')!.className);
    expect(vaga.querySelector('ul')!.className).toBe(projeto.querySelector('ul')!.className);
    // E são irmãos no mesmo grid — "lado a lado".
    expect(vaga.parentElement).toBe(projeto.parentElement);
  });

  it('"tenho uma vaga" leva a e-mail, LinkedIn e download do CV', () => {
    renderPagina();
    const hrefs = within(caminho('Tenho uma vaga'))
      .getAllByRole('link')
      .map((a) => a.getAttribute('href'));
    expect(hrefs).toEqual([`mailto:${EMAIL}`, 'https://www.linkedin.com/in/luiz-dev', CV.href]);
  });

  it('"tenho um projeto" leva a e-mail e GitHub', () => {
    renderPagina();
    const hrefs = within(caminho('Tenho um projeto'))
      .getAllByRole('link')
      .map((a) => a.getAttribute('href'));
    expect(hrefs).toEqual([`mailto:${EMAIL}`, 'https://github.com/FreitasAssis']);
  });

  it('o e-mail é texto copiável, não a palavra "e-mail" (§3.4)', () => {
    renderPagina();
    // "E-mail em texto copiável": o requisito é que o endereço esteja escrito,
    // e não escondido atrás de um rótulo. Sem botão de copiar — a justificativa
    // (JS, estado, aria-live e caminho de erro para substituir um gesto que o
    // sistema já faz) está em components/ContactPaths.tsx.
    const links = screen.getAllByRole('link', { name: EMAIL });
    expect(links.length).toBeGreaterThanOrEqual(2);
    for (const link of links) {
      expect(link).toHaveAttribute('href', `mailto:${EMAIL}`);
      expect(link.textContent).toBe(EMAIL);
    }
  });

  it('oferece GitHub e LinkedIn a quem não se reconhece em nenhum caminho (§3.4)', () => {
    renderPagina();
    const geral = screen.getByRole('heading', { level: 2, name: /de qualquer forma/i })
      .closest('section')!;
    const hrefs = within(geral)
      .getAllByRole('link')
      .map((a) => a.getAttribute('href'));
    expect(hrefs).toEqual([
      `mailto:${EMAIL}`,
      'https://github.com/FreitasAssis',
      'https://www.linkedin.com/in/luiz-dev',
    ]);
  });
});

describe('/contato — o CV (§7)', () => {
  it('o nome do arquivo carrega a data, e o arquivo existe no repo', () => {
    // §7: "com data no nome do arquivo ou no rodapé do PDF". A data está no
    // nome porque é o único dos dois que o visitante vê antes de abrir — e
    // porque o arquivo continua datado na pasta de Downloads de quem recebeu.
    expect(CV.href).toMatch(/^\/cv\/luiz-freitas-\d{4}-\d{2}\.pdf$/);
    // Link de download quebrado não dá sintoma nenhum num export estático: o
    // build não confere `/public`, e o 404 só aparece pra quem clicou.
    // `process.cwd()` e não `import.meta.url`: sob o Vite o módulo de teste é
    // servido por uma URL que não é o caminho dele no disco, e o `existsSync`
    // sairia falso por motivo errado. O Vitest roda com a raiz do repo.
    const arquivo = join(process.cwd(), 'public', CV.href);
    expect(existsSync(arquivo)).toBe(true);
  });

  it('o link do CV baixa em vez de abrir no leitor embutido', () => {
    renderPagina();
    const link = screen.getByRole('link', { name: CV.label });
    expect(link).toHaveAttribute('href', CV.href);
    expect(link).toHaveAttribute('download');
  });
});

describe('/contato — guardrails do brief', () => {
  it('não tem formulário (§3.4, §11)', () => {
    const { container } = renderPagina();
    // "Formulário some no spam e não dá confirmação; mailto: e link direto
    // convertem melhor e não precisam de backend." E o site é export estático.
    expect(container.querySelector('form')).toBeNull();
    expect(container.querySelector('input')).toBeNull();
    expect(container.querySelector('textarea')).toBeNull();
    expect(container.querySelector('button')).toBeNull();
  });

  it('não expõe WhatsApp — a decisão ainda é do Luiz (§12)', () => {
    const { container } = renderPagina();
    // Expor telefone é irreversível: sai de indexador, de print, de
    // encaminhamento. Quando ele decidir, é uma edição em content/contact.ts
    // (WHATSAPP deixa de ser null) — e este teste falha junto, de propósito,
    // para que ligar o número seja uma decisão registrada.
    expect(WHATSAPP).toBeNull();
    expect(container.textContent).not.toMatch(/whats\s?app/i);
    const hrefs = Array.from(container.querySelectorAll('a')).map((a) => a.getAttribute('href'));
    expect(hrefs.filter((h) => /wa\.me|whatsapp/i.test(h ?? ''))).toEqual([]);
  });

  it('põe o retrato em versão pequena, ainda como buraco (§6.5)', () => {
    const { container } = renderPagina();
    expect(screen.getByText('{{ retrato }}')).toBeInTheDocument();
    expect(screen.getByText(/§6\.5 · versão pequena/i)).toBeInTheDocument();
    expect(container.querySelectorAll('img')).toHaveLength(0);
  });

  it('não renderiza um <main> próprio — a landmark é do layout', () => {
    const { container } = renderPagina();
    expect(container.querySelector('main')).toBeNull();
  });
});
