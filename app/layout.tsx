import type { ReactNode } from 'react';

import type { Metadata } from 'next';
import { Bricolage_Grotesque, JetBrains_Mono, Newsreader } from 'next/font/google';

import { AccentTracker } from '@/components/AccentTracker';
import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { AUTHOR, SITE_URL } from '@/content/site';

import './globals.css';

/**
 * O que é do site inteiro, e só isso (§8).
 *
 * **Sem `title` e sem `description` aqui de propósito.** Um par no layout vira
 * o valor de qualquer rota que esqueça de declarar o seu — que é como o site
 * antigo terminou com a mesma descrição nas quatro páginas, e o silêncio é o
 * que torna esse bug caro. Sem herança, a rota que esquecer sai sem `<title>` e
 * o teste do §8 sobre o `out/` a aponta pelo nome.
 *
 * **Sem `title.template`:** ver a nota em `content/site.ts` — o §8 tem dois
 * sufixos e a home não tem nenhum.
 *
 * `metadataBase` é o que faz canonical e OG saírem absolutos. Sob
 * `output: 'export'` não existe requisição de onde inferir o host: sem esta
 * linha o Next avisa no build e resolve tudo contra `http://localhost:3000`,
 * publicando canonical que aponta para a máquina de quem buildou.
 */
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  authors: [{ name: AUTHOR, url: SITE_URL }],
  creator: AUTHOR,
};

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
