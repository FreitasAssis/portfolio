import type { MetadataRoute } from 'next';

import { SITE_URL } from '@/content/site';
import { getAllProjects } from '@/lib/projects';

/**
 * `sitemap.xml` (§8).
 *
 * Sob `output: 'export'` esta rota é materializada em `out/sitemap.xml` no
 * build, como qualquer página — não há servidor para gerá-la sob demanda. Está
 * verificado em `tests/e2e/seo.spec.ts`, que lê o arquivo do `out/`: o §8 pede
 * o sitemap "gerado", e "o Next gera" é uma suposição até alguém abrir a pasta.
 *
 * ## As rotas dos cases saem do conteúdo
 *
 * `getAllProjects()` é a mesma fonte de `generateStaticParams` em
 * `app/projetos/[slug]/page.tsx`. Escrever `/projetos/asafe` e
 * `/projetos/eaifez` à mão aqui funcionaria hoje e envelheceria no dia em que
 * um `.mdx` novo entrasse: a página existiria no `out/` e não no sitemap, sem
 * erro nenhum. O §2 promete "adicionar projeto = criar um arquivo"; o sitemap é
 * parte do que essa promessa cobre.
 *
 * As quatro rotas fixas continuam listadas à mão porque **são** código — cada
 * uma é um `page.tsx` do repo, e derivá-las varrendo o `app/` trocaria uma
 * lista curta e legível por um scanner de diretório que também acharia
 * `sitemap.ts` e `robots.ts`. `tests/unit/site.test.ts` amarra as duas pontas:
 * a lista daqui tem que bater com as chaves do dicionário do §8.
 *
 * ## Sem `lastModified`
 *
 * `new Date()` diria "mudou hoje" a cada build, inclusive num build que só
 * reordenou um import — é ruído para o indexador e faz o `out/` diferir de si
 * mesmo entre dois builds do mesmo commit. Uma data de verdade viria do git, e
 * o `changeFrequency`/`priority` o Google ignora há anos. Sem eles o documento
 * segue válido: `<loc>` é o único campo obrigatório do protocolo.
 */

/**
 * **Obrigatório sob `output: 'export'`** — a mesma trava de `app/robots.ts`,
 * onde está a explicação. Sem ela o `next build` para com
 * *"export const dynamic = 'force-static' not configured on route
 * '/sitemap.xml'"*, e o site não builda.
 */
export const dynamic = 'force-static';

/** As rotas fixas, na ordem em que o §3 as apresenta. */
export const STATIC_ROUTES = ['/', '/projetos', '/sobre', '/contato'] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const projects = await getAllProjects();

  // Os cases entram logo depois do `/projetos`, que é a página que leva a eles.
  const routes: string[] = [
    '/',
    '/projetos',
    ...projects.map((project) => `/projetos/${project.slug}`),
    '/sobre',
    '/contato',
  ];

  // A home é `SITE_URL` cru, sem a barra final. É medido, não estético: o Next
  // emite `<link rel="canonical" href="https://luizfreitas.com.br">` — ele
  // normaliza a barra final porque `trailingSlash` é falso. Um sitemap que
  // listasse `…com.br/` estaria apontando para uma URL que o próprio site
  // declara não-canônica, que é o tipo de contradição que o rastreador resolve
  // sozinho e o auditor perde meia hora conferindo. `tests/e2e/seo.spec.ts`
  // compara as duas pontas no artefato construído.
  return routes.map((path) => ({
    url: path === '/' ? SITE_URL : `${SITE_URL}${path}`,
  }));
}
