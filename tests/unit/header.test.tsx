import { render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const route = vi.hoisted(() => ({ current: '/' }));
vi.mock('next/navigation', () => ({ usePathname: () => route.current }));

import { Header } from '@/components/Header';

const nav = () => screen.getByRole('navigation');

describe('Header', () => {
  beforeEach(() => {
    route.current = '/';
  });

  it('leva às três rotas do site, em português', () => {
    render(<Header />);
    const links = within(nav())
      .getAllByRole('link')
      .map((a) => [a.textContent, a.getAttribute('href')]);

    expect(links).toEqual([
      ['Projetos', '/projetos'],
      ['Sobre', '/sobre'],
      ['Contato', '/contato'],
    ]);
  });

  it('o nome volta para a home', () => {
    render(<Header />);
    expect(screen.getByRole('link', { name: 'Luiz Freitas' })).toHaveAttribute('href', '/');
  });

  it('não linka /notas — o blog está fora de escopo', () => {
    render(<Header />);
    const hrefs = screen.getAllByRole('link').map((a) => a.getAttribute('href'));
    expect(hrefs).not.toContain('/notas');
  });

  it('marca a página atual, inclusive dentro de um case', () => {
    route.current = '/projetos/asafe';
    render(<Header />);

    expect(screen.getByRole('link', { name: 'Projetos' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: 'Sobre' })).not.toHaveAttribute('aria-current');
  });

  it('na home, nenhuma rota da nav fica marcada como atual', () => {
    render(<Header />);
    for (const link of within(nav()).getAllByRole('link')) {
      expect(link).not.toHaveAttribute('aria-current');
    }
  });

  it('carrega o toggle de tema', () => {
    render(<Header />);
    expect(screen.getByRole('button', { name: /tema/i })).toBeInTheDocument();
  });
});
