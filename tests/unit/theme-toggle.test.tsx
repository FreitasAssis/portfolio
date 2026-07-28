import { renderToString } from 'react-dom/server';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';

import { ThemeToggle } from '@/components/ThemeToggle';

const root = document.documentElement;

describe('ThemeToggle', () => {
  beforeEach(() => {
    localStorage.clear();
    root.removeAttribute('data-theme');
  });

  it('alterna o data-theme do documento', async () => {
    render(<ThemeToggle />);
    await userEvent.click(screen.getByRole('button'));
    expect(root.getAttribute('data-theme')).toBe('dark');
  });

  it('persiste a escolha', async () => {
    render(<ThemeToggle />);
    await userEvent.click(screen.getByRole('button'));
    expect(localStorage.getItem('theme')).toBe('dark');
  });

  it('tem nome acessível', () => {
    render(<ThemeToggle />);
    expect(screen.getByRole('button')).toHaveAccessibleName(/tema/i);
  });

  /* Os quatro casos abaixo cobrem o que o trio acima deixa passar. */

  it('parte do tema que o script anti-flash já aplicou, não do claro', () => {
    // Se o toggle assumisse "claro" no mount, quem chega no escuro precisaria de
    // dois cliques para clarear — e o primeiro deles não faria nada visível.
    root.setAttribute('data-theme', 'dark');
    render(<ThemeToggle />);
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true');
  });

  it('volta para o claro gravando "light", não apagando a chave', async () => {
    // Sem gravar 'light' explicitamente, quem usa um sistema que prefere escuro
    // nunca consegue escolher o claro: o script anti-flash cai na preferência do
    // sistema no próximo load e desfaz a escolha.
    root.setAttribute('data-theme', 'dark');
    localStorage.setItem('theme', 'dark');
    render(<ThemeToggle />);

    await userEvent.click(screen.getByRole('button'));

    expect(localStorage.getItem('theme')).toBe('light');
    expect(root.getAttribute('data-theme')).not.toBe('dark');
  });

  it('é operável por teclado (§9)', async () => {
    render(<ThemeToggle />);
    const button = screen.getByRole('button');

    await userEvent.tab();
    expect(button).toHaveFocus();

    await userEvent.keyboard('{Enter}');
    expect(root.getAttribute('data-theme')).toBe('dark');
    expect(button).toHaveAttribute('aria-pressed', 'true');
  });

  it('o HTML do servidor não depende do tema (armadilha de hidratação)', () => {
    // O export estático renderiza este componente em build time, onde não existe
    // localStorage nem matchMedia. Se a marcação inicial dependesse do tema, o
    // primeiro render do cliente divergiria do HTML entregue.
    root.setAttribute('data-theme', 'dark');
    localStorage.setItem('theme', 'dark');
    const noEscuro = renderToString(<ThemeToggle />);

    root.removeAttribute('data-theme');
    localStorage.setItem('theme', 'light');
    const noClaro = renderToString(<ThemeToggle />);

    expect(noEscuro).toBe(noClaro);
  });
});
