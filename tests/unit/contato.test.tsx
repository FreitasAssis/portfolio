import { existsSync } from 'node:fs';
import { join } from 'node:path';

import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import ContatoPage from '@/app/contato/page';
import { CONTACT_LINKS, CV, EMAIL } from '@/content/contact';
import { caminhoDoArquivo } from '../helpers/next-image';

/**
 * `/contato` (§3.4): "**simples, porque o objetivo é ser alcançável, não
 * converter**: e-mail em texto copiável, LinkedIn, GitHub e o CV em PDF. Sem os
 * dois caminhos ('tenho uma vaga' / 'tenho um projeto'), que pressupunham venda
 * ativa."
 *
 * Este arquivo trocou de eixo junto com a página. Ele media a **igualdade** das
 * duas caixas — classe por classe, para que nenhuma ganhasse peso da outra. Sem
 * caixas, o que resta a medir é o oposto: que a triagem não volte, e que o CV
 * não tenha sumido com ela. O CV é o ponto: ele vivia **dentro** da caixa
 * "Tenho uma vaga", e tirar a bifurcação sem cuidado o levaria junto, embora o
 * §3.4 sempre tenha pedido o CV no `/contato` sem qualificar para quem.
 */
const renderPagina = () => render(<ContatoPage />);

describe('/contato — os canais do §3.4', () => {
  it('tem um h1 só, e nenhum título de triagem abaixo dele', () => {
    renderPagina();
    const h1 = screen.getAllByRole('heading', { level: 1 });
    expect(h1).toHaveLength(1);
    expect(h1[0]).toHaveTextContent('Contato');

    // A página encolheu (§1: "o /contato encolhe"). Não há mais seção nenhuma:
    // a lista de canais É a página, e "De qualquer forma" só fazia sentido como
    // escape de uma triagem que não existe mais.
    expect(screen.queryAllByRole('heading', { level: 2 })).toEqual([]);
  });

  it('lista os quatro canais na ordem do §3.4', () => {
    renderPagina();
    const hrefs = screen.getAllByRole('link').map((a) => a.getAttribute('href'));
    expect(hrefs).toEqual([
      `mailto:${EMAIL}`,
      'https://www.linkedin.com/in/luiz-dev',
      'https://github.com/FreitasAssis',
      CV.href,
    ]);
    // E a página mostra exatamente o dado, sem link escrito à mão por cima.
    expect(hrefs).toEqual(CONTACT_LINKS.map((l) => l.href));
  });

  it('não bifurca mais em "tenho uma vaga" / "tenho um projeto" (§3.4)', () => {
    const { container } = renderPagina();
    // "Sem os dois caminhos, que pressupunham venda ativa." Se voltarem, é
    // regressão de propósito declarado — não de gosto.
    expect(container.textContent).not.toMatch(/tenho uma vaga|tenho um projeto/i);
    expect(container.textContent).not.toMatch(/escolha o caminho/i);
  });

  it('o e-mail é texto copiável, não a palavra "e-mail" (§3.4)', () => {
    renderPagina();
    // "E-mail em texto copiável": o requisito é que o endereço esteja escrito,
    // e não escondido atrás de um rótulo. Sem botão de copiar — a justificativa
    // (JS, estado, aria-live e caminho de erro para substituir um gesto que o
    // sistema já faz) está em components/ContactLinks.tsx.
    const link = screen.getByRole('link', { name: EMAIL });
    expect(link).toHaveAttribute('href', `mailto:${EMAIL}`);
    expect(link.textContent).toBe(EMAIL);
  });
});

describe('/contato — o CV (§7)', () => {
  it('o CV está na página, e não sumiu com a caixa que o hospedava (§3.4)', () => {
    // O §3.4 nomeia o CV entre os quatro canais do `/contato`, sem qualificar
    // para quem. Até esta revisão o link existia **só** dentro de "Tenho uma
    // vaga": quem se lesse como cliente nunca via o currículo, e apagar a caixa
    // sem olhar teria apagado o link junto.
    renderPagina();
    const link = screen.getByRole('link', { name: CV.label });
    expect(link).toHaveAttribute('href', CV.href);
    expect(link).toHaveAttribute('download');
  });

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
});

describe('/contato — guardrails do brief', () => {
  it('não tem formulário (§3.4, §11)', () => {
    const { container } = renderPagina();
    // "Some no spam, não dá confirmação, e precisa de backend; mailto: e link
    // direto resolvem melhor." E o site é export estático.
    expect(container.querySelector('form')).toBeNull();
    expect(container.querySelector('input')).toBeNull();
    expect(container.querySelector('textarea')).toBeNull();
    expect(container.querySelector('button')).toBeNull();
  });

  it('não escreve linguagem de venda nem de urgência (§1)', () => {
    const { container } = renderPagina();
    const texto = container.textContent ?? '';
    // §1: "nada de linguagem de venda ou de urgência. Sem 'disponível para
    // oportunidades', sem CTA agressivo, sem funil." O §4 já proibia o
    // vocabulário; o §1 subiu isso a regra de finalidade, e o /contato é onde
    // ela é mais fácil de violar sem perceber.
    for (const proibido of [
      /dispon[íi]vel para/i,
      /or[çc]amento/i,
      /vamos conversar/i,
      /entre em contato agora/i,
      /soluç(ão|ões)/i,
      /impulsionar/i,
    ]) {
      expect(texto, String(proibido)).not.toMatch(proibido);
    }
  });

  it('não publica telefone nem WhatsApp', () => {
    const { container } = renderPagina();
    // O §12 não lista mais "decidir se expõe WhatsApp" como pendência, e a
    // constante `WHATSAPP` saiu de content/contact.ts junto com o caminho
    // "Tenho um projeto", que era o único lugar onde o número entraria. A trava
    // que sobrou é a que sempre importou — `expect(WHATSAPP).toBeNull()` era
    // tautologia sobre uma constante, esta olha o que a página publica —, e ela
    // continua valendo sem pendência aberta: número exposto é irreversível.
    expect(container.textContent).not.toMatch(/whats\s?app/i);
    const hrefs = Array.from(container.querySelectorAll('a')).map((a) => a.getAttribute('href'));
    expect(hrefs.filter((h) => /wa\.me|whatsapp|^tel:/i.test(h ?? ''))).toEqual([]);
  });

  it('põe o retrato em versão pequena, e é o recorte quadrado', () => {
    const { container } = renderPagina();
    const imagens = Array.from(container.querySelectorAll('img'));
    expect(imagens).toHaveLength(1);
    const [retrato] = imagens;

    const largura = Number(retrato.getAttribute('width'));
    const altura = Number(retrato.getAttribute('height'));
    // Quadrado, e não o 4:5 do /sobre. A caixa aqui tem 180px (10rem sobre uma
    // raiz de 18px): num 4:5 o rosto cai para uns 50px de altura, e o recorte
    // quadrado devolve o rosto maior na MESMA largura. Se alguém "unificar" os
    // dois recortes num arquivo só, é aqui que a unificação custa.
    expect(largura).toBe(altura);
    // E as duas dimensões existem: sem elas a caixa não reserva altura nenhuma
    // sob `images.unoptimized`, e a foto abre em 0×0.
    expect(largura).toBeGreaterThan(0);

    const arquivo = caminhoDoArquivo(retrato);
    expect(arquivo).toMatch(/^\/retrato\/.+\.webp$/);
    expect(existsSync(join(process.cwd(), 'public', arquivo))).toBe(true);

    // Alt descritivo, na mesma régua que `lib/projects.ts` aplica aos prints.
    const alt = retrato.getAttribute('alt') ?? '';
    expect(alt.trim().length).toBeGreaterThan(20);
    expect(alt.trim()).not.toMatch(/^(print|screenshot|imagem|foto|retrato)$/i);
  });

  it('o retrato não é lazy — nesta rota ele é o elemento de LCP', () => {
    const { container } = renderPagina();
    const retrato = container.querySelector('img')!;
    // Medido, não presumido: o Lighthouse elege esta foto como LCP (a página
    // tem um título, uma linha e quatro links), reprova `lcp-lazy-loaded` e a
    // performance cai a 94 — abaixo do piso de 95 que o repo mantém. No /sobre é o
    // contrário, e lá o `lazy` fica; ver tests/unit/sobre.test.tsx.
    expect(retrato.getAttribute('loading')).not.toBe('lazy');
    expect(retrato.getAttribute('fetchpriority')).not.toBe('low');
  });

  it('não sobrou buraco de asset na página', () => {
    const { container } = renderPagina();
    // O retrato era o último `{{ }}` do site. Zero, e não "um, o do retrato".
    expect((container.textContent ?? '').match(/\{\{[^}]*\}\}/g) ?? []).toEqual([]);
  });

  it('não renderiza um <main> próprio — a landmark é do layout', () => {
    const { container } = renderPagina();
    expect(container.querySelector('main')).toBeNull();
  });
});

describe('/contato — sem "voltar ao topo", de propósito (§3.4)', () => {
  it('a página que cabe numa tela não ganha atalho para o topo', () => {
    // A exclusão é decisão registrada, não esquecimento. A home, a `/projetos` e
    // o `/sobre` fecham com o bloco de `components/EndNav.tsx`; esta rota não,
    // porque o §3.4 a encolheu a um título, uma linha e quatro links — um
    // "voltar ao topo" aqui aponta para onde a pessoa já está.
    //
    // É também por isso que o bloco NÃO mora no rodapé, que apareceria nas seis
    // rotas de uma vez: a justificativa completa está em components/EndNav.tsx.
    renderPagina();
    expect(screen.queryByRole('link', { name: 'Voltar ao topo' })).toBeNull();
    expect(screen.queryByRole('navigation')).toBeNull();
  });
});
