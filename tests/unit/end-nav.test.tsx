import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next/navigation', () => ({ usePathname: () => '/' }));

import { CaseEndNav } from '@/components/CaseEndNav';
import { EndNav } from '@/components/EndNav';
import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import type { Project } from '@/lib/projects';

import { CSS } from '../helpers/globals-css';

/**
 * O bloco de fim de conteúdo, na forma compartilhada por quatro rotas: a home,
 * a `/projetos`, o `/sobre` e os cases. O `/contato` fica de fora, e a
 * razão está em `tests/unit/contato.test.tsx`.
 *
 * O que estes testes protegem é o **idioma único**: a mesma âncora, o mesmo
 * texto, o mesmo tratamento tipográfico, em todas elas. Quatro variações do
 * mesmo link seria o resultado natural de resolver isso página por página.
 */

const fake = (slug: string, name: string) => ({ slug, name }) as unknown as Project;

const topo = () => screen.getByRole('link', { name: 'Voltar ao topo' });

describe('fim do conteúdo — a âncora do topo', () => {
  it('aponta para um id que existe de verdade, e não para `#`', () => {
    // `href="#"` também rola para o topo, mas deixa o ponto de partida da
    // navegação de teclado onde estava: quem clica vê o topo e continua
    // tabulando a partir do rodapé. Um fragmento NOMEADO move esse ponto para o
    // alvo. O alvo é o cabeçalho, que é onde a navegação do site mora.
    render(<EndNav />);
    expect(topo()).toHaveAttribute('href', '#topo');

    const { container } = render(<Header />);
    expect(container.querySelector('header')).toHaveAttribute('id', 'topo');
  });

  it('é âncora pura — nada de botão, nada de handler', () => {
    // O bloco é estático de propósito: zero JavaScript, nenhum movimento
    // novo, e o foco de teclado vem de graça porque é um `<a href>`.
    const { container } = render(<EndNav />);
    expect(container.querySelectorAll('button')).toHaveLength(0);
    expect(topo().tagName).toBe('A');
  });

  it('não pede scroll suave em lugar nenhum', () => {
    // `scroll-behavior: smooth` seria movimento novo e brigaria com
    // `prefers-reduced-motion`, que o site respeita. A âncora salta.
    const { container } = render(<EndNav />);
    expect(container.innerHTML).not.toMatch(/scroll-smooth|scroll-behavior/);
    expect(CSS).not.toMatch(/scroll-behavior\s*:\s*smooth/);
  });

  it('sozinho, é o único link do bloco — sem corrente de "próximo"', () => {
    // A home, a `/projetos` e o `/sobre` não têm sequência natural. Os cases
    // têm (Asafe → E aí, fez? → /projetos), e é só lá que ela existe; um
    // "próxima página" nas outras três seria menu inventado.
    render(<EndNav />);
    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(1);
    expect(links[0]).toHaveAttribute('href', '#topo');
  });
});

describe('fim do conteúdo — um idioma, não quatro', () => {
  it('a âncora do case e a das páginas curtas são o MESMO elemento', () => {
    // A trava contra a duplicação. Se alguém reescrever o link numa página em vez
    // de usar o componente, a grafia diverge aqui — texto, href ou classe.
    const semNext = render(<EndNav />);
    const doCase = render(<CaseEndNav next={fake('eaifez', 'E aí, fez?')} />);

    const ancoras = screen
      .getAllByRole('link', { name: 'Voltar ao topo' })
      .map((a) => a.outerHTML);
    expect(ancoras).toHaveLength(2);
    expect(ancoras[0]).toBe(ancoras[1]);

    semNext.unmount();
    doCase.unmount();
  });

  it('a landmark tem nome próprio, distinto do cabeçalho', () => {
    // O cabeçalho já tem `aria-label="Principal"`; duas landmarks do mesmo tipo
    // sem nomes distintos não são escolhíveis numa lista de landmarks.
    const { unmount } = render(<EndNav />);
    expect(screen.getByRole('navigation', { name: 'Fim da página' })).toBeInTheDocument();
    unmount();

    render(<CaseEndNav next={null} />);
    expect(screen.getByRole('navigation', { name: 'Fim do case' })).toBeInTheDocument();
  });

  it('é texto e uma régua — sem caixa, sem ícone', () => {
    // O site já gastou o único gesto de layout que se permite na quebra de
    // grade dos cards. Aqui não entra caixa fechada, fundo, sombra nem SVG.
    const { container } = render(<EndNav />);
    const nav = screen.getByRole('navigation');
    // Uma régua no topo, e só. `border` sozinho seria caixa fechada nos quatro
    // lados — a mesma distinção de forma que a timeline já faz entre a etiqueta
    // "em paralelo" (caixa) e o fio contínuo (régua).
    expect(nav.className).toMatch(/\bborder-t\b/);
    expect(nav.className).not.toMatch(/(^|\s)border(\s|$)/);
    expect(nav.className).not.toMatch(/\b(rounded|shadow|bg-[a-z])/);
    expect(container.querySelectorAll('svg, img')).toHaveLength(0);
  });

  it('não é sticky nem fixed — nada flutua sobre o conteúdo', () => {
    // A alternativa descartada era o botão que aparece no scroll. Ele voltaria
    // por aqui: uma classe de posicionamento no bloco e a regra vai embora sem
    // ninguém notar, porque a página continua funcionando.
    const { container } = render(<EndNav />);
    expect(container.innerHTML).not.toMatch(/\b(sticky|fixed|absolute|z-\d)\b/);
  });

  it('põe a navegação em mono, como o resto do metadado', () => {
    // Mesma família das datas da timeline, do cabeçalho e do "Ver detalhe de
    // cada posição" — não é um quarto tratamento tipográfico.
    render(<EndNav />);
    expect(screen.getByRole('navigation').className).toContain('font-mono');
  });

  it('a régua é mais estreita que a do rodapé, de propósito', () => {
    // Duas réguas da MESMA largura a 96px de distância leriam como dois rodapés.
    // A de cima fica na coluna de leitura (44rem) e a do rodapé em `wide`
    // (60rem), então a de cima lê como "fim da leitura" e não como moldura.
    const bloco = render(<EndNav />);
    const nav = screen.getByRole('navigation');
    bloco.unmount();

    const { container } = render(<Footer />);
    const caixaDoRodape = container.querySelector('footer > div')!;

    expect(nav.className).toContain('max-w-[44rem]');
    expect(caixaDoRodape.className).toContain('max-w-[60rem]');
  });
});

describe('fim do conteúdo — o case acrescenta, não substitui', () => {
  it('leva ao próximo case, nomeando-o', () => {
    render(<CaseEndNav next={fake('eaifez', 'E aí, fez?')} />);
    expect(screen.getByRole('link', { name: /próximo case/i })).toHaveAttribute(
      'href',
      '/projetos/eaifez',
    );
    // O nome do projeto entra no rótulo: "próximo" sozinho não diz o que vem, e
    // o segundo case tem que ser oferecido sem diminuir.
    expect(screen.getByRole('link', { name: /próximo case/i })).toHaveTextContent('E aí, fez?');
  });

  it('no último case, oferece a /projetos em vez de fechar um laço', () => {
    // Voltar ao primeiro devolveria ao leitor um case que ele acabou de passar.
    // A /projetos é a rota pai e tem a experiência profissional, que é a única
    // coisa que ainda não foi lida por quem chegou até aqui.
    render(<CaseEndNav next={null} />);
    expect(screen.getAllByRole('link').map((a) => [a.textContent, a.getAttribute('href')])).toEqual([
      ['Ver todos os projetos', '/projetos'],
      ['Voltar ao topo', '#topo'],
    ]);
    expect(screen.queryByText(/próximo case/i)).toBeNull();
  });

  it('os dois links do case têm nomes acessíveis distinguíveis', () => {
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

  it('o "voltar ao topo" é o discreto dos dois', () => {
    // Ordem de peso: o que o leitor mais quer no fim de um case é o OUTRO case;
    // o topo vem depois, e menor. Se os dois tiverem o mesmo peso, o bloco vira
    // um menu.
    render(<CaseEndNav next={fake('eaifez', 'E aí, fez?')} />);
    const proximo = screen.getByRole('link', { name: /próximo case/i });

    expect(proximo.className).toContain('text-accent-text');
    expect(proximo.parentElement!.className).toContain('text-sm');
    expect(topo().parentElement!.className).toMatch(/text-xs.*text-ink-2/);
    expect(topo().className).not.toContain('accent');
  });
});
