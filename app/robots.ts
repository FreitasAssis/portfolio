import type { MetadataRoute } from 'next';

import { SITE_URL } from '@/content/site';

/**
 * Obrigatório: sem esta linha o `next build` falha sob `output: 'export'` com
 * *"export const dynamic = 'force-static' not configured on route
 * '/robots.txt'"*. O Next trata rota de metadado como handler, e handler sem
 * esta declaração não vira arquivo. Vale para toda rota de metadado nova.
 */
export const dynamic = 'force-static';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/' }],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
