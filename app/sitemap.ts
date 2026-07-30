import type { MetadataRoute } from 'next';

import { SITE_URL } from '@/content/site';
import { getAllProjects } from '@/lib/projects';

/**
 * Obrigatório sob `output: 'export'` — a mesma trava de `app/robots.ts`, onde
 * está a explicação. Sem ela o `next build` para com *"export const dynamic =
 * 'force-static' not configured on route '/sitemap.xml'"*.
 */
export const dynamic = 'force-static';

/** As rotas fixas do site. */
export const STATIC_ROUTES = ['/', '/projetos', '/sobre', '/contato'] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const projects = await getAllProjects();

  const routes: string[] = [
    '/',
    '/projetos',
    ...projects.map((project) => `/projetos/${project.slug}`),
    '/sobre',
    '/contato',
  ];

  // A home sai sem a barra final para casar com o canonical que o Next emite
  // (ele normaliza, porque `trailingSlash` é falso). Com a barra, o sitemap
  // aponta para a URL que o próprio site declara não-canônica.
  return routes.map((path) => ({
    url: path === '/' ? SITE_URL : `${SITE_URL}${path}`,
  }));
}
