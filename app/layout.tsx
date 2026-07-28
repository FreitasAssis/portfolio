import type { ReactNode } from 'react';

import { Bricolage_Grotesque, JetBrains_Mono, Newsreader } from 'next/font/google';

import { AccentTracker } from '@/components/AccentTracker';
import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';

import './globals.css';

// §6.3: display grotesca, corpo serifado (a inversão é deliberada) e mono só
// para metadado.
const bricolage = Bricolage_Grotesque({
  subsets: ['latin'],
  variable: '--font-bricolage',
  display: 'swap',
});
const newsreader = Newsreader({
  subsets: ['latin'],
  variable: '--font-newsreader',
  display: 'swap',
});
const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
});

// Roda antes da primeira pintura: sem isso o tema escuro pisca branco no load.
const THEME_SCRIPT = `
(function () {
  try {
    var stored = localStorage.getItem('theme');
    var dark = stored ? stored === 'dark'
      : window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (dark) document.documentElement.setAttribute('data-theme', 'dark');
  } catch (e) {}
})();
`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="pt-BR"
      className={`${bricolage.variable} ${newsreader.variable} ${jetbrains.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      {/* O <main> mora aqui: uma única landmark por documento, e as páginas
          ficam livres para compor <Container> por dentro — inclusive seções que
          sangram a largura toda, como a capa de um case. */}
      <body className="flex min-h-dvh flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        {/* Depois do conteúdo: o tracker escaneia o DOM da página que está no ar
            e re-escaneia a cada rota (ver o comentário do componente). */}
        <AccentTracker />
      </body>
    </html>
  );
}
