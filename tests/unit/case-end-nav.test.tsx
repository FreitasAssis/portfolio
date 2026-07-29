import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next/navigation', () => ({ usePathname: () => '/projetos/asafe' }));

import { CaseEndNav } from '@/components/CaseEndNav';
import { Header } from '@/components/Header';
import type { Project } from '@/lib/projects';

import { CSS } from '../helpers/globals-css';

/**
 * Fim do case (§3.3, §6.4, §9).
 *
 * O bloco existe porque a página do case é longa — 8,8 telas em 1440×900 e 19,1
 * em 360×740, no Asafe — e porque o §6.4 proíbe a resposta reflexa (botão
 * flutuante que aparece no scroll: movimento novo, componente de cliente,
 * flutuando sobre o conteúdo). O que estes testes protegem é justamente o que
 * torna a alternativa estática defensável.
 */

const fake = (slug: string, name: string) => ({ slug, name }) as unknown as Project;

const links = () => screen.getAllByRole('link').map((a) => [a.textContent, a.getAttribute('href')]);

describe('fim do case — para onde ir depois', () => {
  it('leva ao próximo case, nomeando-o', () => {
    render(<CaseEndNav next={fake('eaifez', 'E aí, fez?')} />);
    expect(screen.getByRole('link', { name: /próximo case/i })).toHaveAttribute(
      'href',
      '/projetos/eaifez',
    );
    // O nome do projeto entra no rótulo: "próximo" sozinho não diz o que vem, e
    // o §4.6 quer que o segundo case seja oferecido "sem diminuir".
    expect(screen.getByRole('link', { name: /próximo case/i })).toHaveTextContent('E aí, fez?');
  });

  it('no último case, oferece a /projetos em vez de fechar um laço', () => {
    // Voltar ao primeiro devolveria ao leitor um case que ele acabou de passar.
    // A /projetos é a rota pai e tem a experiência profissional, que é a única
    // coisa que ainda não foi lida por quem chegou até aqui (§3.2).
    render(<CaseEndNav next={null} />);
    expect(links()).toEqual([
      ['Ver todos os projetos', '/projetos'],
      ['Voltar ao topo', '#topo'],
    ]);
    expect(screen.queryByText(/próximo case/i)).toBeNull();
  });

  it('os dois links têm nomes acessíveis distinguíveis (§9)', () => {
    // Dois links no mesmo bloco com destinos diferentes: se o nome acessível
    // coincidir, quem navega por lista de links tem duas entradas iguais.
    for (const next of [fake('eaifez', 'E aí, fez?'), null]) {
      const { unmount } = render(<CaseEndNav next={next} />);
      const nomes = screen.getAllByRole('link').map((a) => a.textContent);
      expect(nomes).toHaveLength(2);
      expect(new Set(nomes).size).toBe(2);
      unmount();
    }
  });
});

describe('fim do case — a âncora do topo', () => {
  it('aponta para um id que existe de verdade, e não para `#`', () => {
    // `href="#"` também rola para o topo, mas deixa o ponto de partida da
    // navegação de teclado onde estava: quem clica vê o topo e continua
    // tabulando a partir do rodapé. Um fragmento NOMEADO move esse ponto para o
    // alvo. O alvo é o cabeçalho, que é onde a navegação do site mora.
    render(<CaseEndNav next={null} />);
    const topo = screen.getByRole('link', { name: 'Voltar ao topo' });
    expect(topo).toHaveAttribute('href', '#topo');

    const { container } = render(<Header />);
    expect(container.querySelector('header')).toHaveAttribute('id', 'topo');
  });

  it('é âncora pura — nada de botão, nada de handler', () => {
    // O bloco é estático de propósito (§6.4): zero JavaScript, nenhum movimento
    // novo, e o foco de teclado vem de graça porque é um `<a href>`.
    const { container } = render(<CaseEndNav next={fake('eaifez', 'E aí, fez?')} />);
    expect(container.querySelectorAll('button')).toHaveLength(0);
    const topo = screen.getByRole('link', { name: 'Voltar ao topo' });
    expect(topo.tagName).toBe('A');
  });

  it('não pede scroll suave em lugar nenhum (§6.4)', () => {
    // `scroll-behavior: smooth` seria movimento novo e brigaria com
    // `prefers-reduced-motion`, que o §9 manda respeitar. A âncora salta.
    const { container } = render(<CaseEndNav next={null} />);
    expect(container.innerHTML).not.toMatch(/scroll-smooth|scroll-behavior/);
    expect(CSS).not.toMatch(/scroll-behavior\s*:\s*smooth/);
  });
});

describe('fim do case — forma (§6.3, §6.4)', () => {
  it('é uma landmark de navegação com nome próprio (§9)', () => {
    render(<CaseEndNav next={null} />);
    // O cabeçalho já tem `aria-label="Principal"`; duas landmarks do mesmo tipo
    // sem nomes distintos não são escolhíveis numa lista de landmarks.
    expect(screen.getByRole('navigation', { name: 'Fim do case' })).toBeInTheDocument();
  });

  it('é texto e uma régua — sem caixa, sem ícone (§6.4)', () => {
    // O §6.4 já gastou o único gesto de layout do site na quebra de grade dos
    // cards. Aqui não entra caixa fechada, fundo, sombra nem SVG.
    const { container } = render(<CaseEndNav next={fake('eaifez', 'E aí, fez?')} />);
    const nav = screen.getByRole('navigation');
    // Uma régua no topo, e só. `border` sozinho seria caixa fechada nos quatro
    // lados — a mesma distinção de forma que a timeline já faz entre a etiqueta
    // "em paralelo" (caixa) e o fio contínuo (régua).
    expect(nav.className).toMatch(/\bborder-t\b/);
    expect(nav.className).not.toMatch(/(^|\s)border(\s|$)/);
    expect(nav.className).not.toMatch(/\b(rounded|shadow|bg-[a-z])/);
    expect(container.querySelectorAll('svg, img')).toHaveLength(0);
  });

  it('põe a navegação em mono, como o resto do metadado (§6.3)', () => {
    // Mesma família das datas da timeline, do cabeçalho e do "Ver detalhe de
    // cada posição" — não é um quarto tratamento tipográfico.
    render(<CaseEndNav next={fake('eaifez', 'E aí, fez?')} />);
    expect(screen.getByRole('navigation').className).toContain('font-mono');
  });

  it('o "voltar ao topo" é o discreto dos dois', () => {
    // Ordem de peso: o que o leitor mais quer no fim de um case é o OUTRO case;
    // o topo vem depois, e menor. Se os dois tiverem o mesmo peso, o bloco vira
    // um menu.
    render(<CaseEndNav next={fake('eaifez', 'E aí, fez?')} />);
    const proximo = screen.getByRole('link', { name: /próximo case/i });
    const topo = screen.getByRole('link', { name: 'Voltar ao topo' });

    expect(proximo.className).toContain('text-accent-text');
    expect(proximo.parentElement!.className).toContain('text-sm');
    expect(topo.parentElement!.className).toMatch(/text-xs.*text-ink-2/);
    expect(topo.className).not.toContain('accent');
  });
});
