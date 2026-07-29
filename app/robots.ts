import type { MetadataRoute } from 'next';

import { SITE_URL } from '@/content/site';

/**
 * `robots.txt` (§8). Materializado em `out/robots.txt` pelo export estático —
 * conferido em `tests/e2e/seo.spec.ts`, não presumido.
 *
 * Libera tudo: o site inteiro é público e não há área logada, busca interna nem
 * rota paginada para poupar do rastreador. `Disallow:` vazio seria equivalente;
 * `allow: '/'` diz a mesma coisa de forma legível para quem abrir o arquivo.
 *
 * O `sitemap` aqui é a única parte que faz trabalho de verdade — é assim que o
 * rastreador acha `sitemap.xml` sem depender de a URL ter sido submetida à mão
 * em algum painel. Absoluta porque o protocolo do robots.txt exige.
 */
/**
 * **Obrigatório, e o build prova.** Sem esta linha o `next build` falha com
 * *"export const dynamic = 'force-static' not configured on route
 * '/robots.txt' with output: export"* — o Next trata rota de metadado como
 * handler de rota, e handler sem esta declaração não tem como ser
 * materializado num arquivo. O erro é claro, mas só aparece no build; foi
 * exatamente o que o §8 pedia para verificar em vez de supor.
 */
export const dynamic = 'force-static';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/' }],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
