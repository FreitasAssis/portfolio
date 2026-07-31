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
 *
 * **Sem parâmetro de imagem.** O `og:image` de cada rota não passa por aqui: ele
 * vem do `opengraph-image.tsx` ao lado da página, que o Next descobre pelo nome
 * do arquivo e injeta sozinho no `<head>`. Um parâmetro aqui seria um segundo
 * caminho até o mesmo metadado, e o dia em que alguém o usasse a rota sairia com
 * duas `og:image`.
 */
export function pageMetadata({
  meta,
  path,
}: {
  readonly meta: RouteMeta;
  /** Caminho absoluto da rota, começando com `/`. A home é `'/'`. */
  readonly path: string;
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
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}
