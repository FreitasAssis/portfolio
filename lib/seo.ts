import type { Metadata } from 'next';

import { AUTHOR, OG_LOCALE, type RouteMeta } from '@/content/site';

/**
 * O molde de `metadata` de toda rota (§8).
 *
 * Existe para que canonical, Open Graph e Twitter não sejam escritos seis vezes
 * — seis cópias é como o site antigo acabou com a mesma descrição em todas as
 * páginas. Aqui cada página declara só o que é dela (o par título/descrição e o
 * caminho) e recebe o resto montado igual.
 *
 * ## Canonical
 *
 * `alternates.canonical` recebe o caminho relativo; o Next o resolve contra o
 * `metadataBase` de `app/layout.tsx` e emite a URL absoluta. Passar o caminho e
 * não a URL inteira é o que mantém `SITE_URL` como fonte única: trocar de
 * domínio é uma linha em `content/site.ts`.
 *
 * ## O buraco que a Task 10 preenche
 *
 * `openGraph.images` **não é declarado aqui de propósito** — as imagens são a
 * Task 10, e o §8 as quer geradas com `next/og` (nome do projeto + tagline
 * sobre a cor do projeto), o que tem risco técnico próprio sob `output:
 * 'export'`. O que já está pronto é o entorno: tipo, locale, `siteName`, `url`,
 * título e descrição por rota, e o `twitter.card` em `summary_large_image`.
 *
 * Quando a Task 10 chegar, o ponto de entrada é UM: o parâmetro `image` abaixo.
 * Nenhuma página precisa mudar — ou o `opengraph-image.tsx` por rota assume
 * (e o Next preenche sozinho), ou o pré-build escreve os PNGs em `public/og/` e
 * cada rota passa o caminho. Enquanto não houver imagem, o link compartilhado
 * cai no card só de texto, que é o comportamento correto: melhor sem imagem do
 * que com um 404 de imagem.
 */
export function pageMetadata({
  meta,
  path,
  image,
}: {
  readonly meta: RouteMeta;
  /** Caminho absoluto da rota, começando com `/`. A home é `'/'`. */
  readonly path: string;
  /** Task 10. Caminho ou URL da OG image desta rota. */
  readonly image?: string;
}): Metadata {
  const { title, description } = meta;

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: 'website',
      locale: OG_LOCALE,
      siteName: AUTHOR,
      url: path,
      title,
      description,
      ...(image ? { images: [image] } : {}),
    },
    twitter: {
      // Fica declarado mesmo sem imagem: sem `images`, o consumidor cai no card
      // de texto de qualquer jeito, e a Task 10 não precisa voltar aqui.
      card: 'summary_large_image',
      title,
      description,
      ...(image ? { images: [image] } : {}),
    },
  };
}
