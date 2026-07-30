import type { Metadata } from 'next';

import { AUTHOR, OG_LOCALE, type RouteMeta } from '@/content/site';

/**
 * O molde de `metadata` de toda rota: cada página declara só o par
 * título/descrição e o caminho, e recebe canonical, Open Graph e Twitter
 * montados iguais.
 *
 * `alternates.canonical` recebe o caminho RELATIVO, e não a URL inteira: o Next
 * resolve contra o `metadataBase` do layout, então trocar de domínio continua
 * sendo uma linha em `content/site.ts`.
 */
export function pageMetadata({
  meta,
  path,
  image,
}: {
  readonly meta: RouteMeta;
  /** Caminho absoluto da rota, começando com `/`. A home é `'/'`. */
  readonly path: string;
  /** Caminho ou URL da OG image desta rota. Sem ela o link compartilhado cai no
   *  card só de texto, que é melhor que um 404 de imagem. */
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
      card: 'summary_large_image',
      title,
      description,
      ...(image ? { images: [image] } : {}),
    },
  };
}
