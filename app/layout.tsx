import type { ReactNode } from 'react';

import type { Metadata } from 'next';
import { Bricolage_Grotesque, JetBrains_Mono, Newsreader } from 'next/font/google';

import { AccentTracker } from '@/components/AccentTracker';
import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { AUTHOR, SITE_URL } from '@/content/site';

import './globals.css';

/**
 * Sem `title` nem `description` de propósito: um par aqui vira o valor de
 * qualquer rota que esqueça de declarar o seu, e a rota fica publicada com a
 * descrição errada sem sintoma. Sem herança ela sai sem `<title>` e o teste
 * sobre o `out/` a aponta pelo nome.
 *
 * `metadataBase` é obrigatório sob `output: 'export'`: não há requisição de onde
 * inferir o host, então sem ele o Next resolve canonical e OG contra
 * `http://localhost:3000`.
 */
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  authors: [{ name: AUTHOR, url: SITE_URL }],
  creator: AUTHOR,
};

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
/**
 * A única das três sem `<link rel="preload">`. As três preloadadas somam 140KB
 * disputando a mesma banda, e a mono nunca é o elemento de LCP em nenhuma das
 * rotas do site — ela desenha metadado: datas, stack, rótulos. Tirá-la da fila de
 * prioridade alta é o que deixa a display e a serifada, que SÃO o LCP, chegarem
 * antes. Ela continua no CSS e continua em `swap`: chega logo depois, e o que
 * pisca é um rótulo curto.
 */
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
      <body className="flex min-h-dvh flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <AccentTracker />
      </body>
    </html>
  );
}
