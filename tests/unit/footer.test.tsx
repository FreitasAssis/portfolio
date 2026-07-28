import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Footer } from '@/components/Footer';

describe('Footer', () => {
  it('expõe os três contatos reais (§3.4)', () => {
    render(<Footer />);
    const hrefs = screen.getAllByRole('link').map((a) => a.getAttribute('href'));

    expect(hrefs).toEqual([
      'mailto:luiz_dev@outlook.com',
      'https://github.com/FreitasAssis',
      'https://www.linkedin.com/in/luiz-dev',
    ]);
  });

  it('mostra o e-mail em texto, não escondido atrás de um rótulo', () => {
    // §3.4: e-mail copiável. Um link escrito "e-mail" não é copiável.
    render(<Footer />);
    expect(screen.getByRole('link', { name: 'luiz_dev@outlook.com' })).toBeInTheDocument();
  });

  it('mostra o ano corrente', () => {
    render(<Footer />);
    expect(screen.getByText(new RegExp(`${new Date().getFullYear()}`))).toBeInTheDocument();
  });
});
