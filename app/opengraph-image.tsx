import { OG_CARDS } from '@/content/site';
import { OG_CONTENT_TYPE, OG_SIZE, ogCard } from '@/lib/og';

/**
 * Obrigatório: sem esta linha o `next build` para sob `output: 'export'` com
 * *"export const dynamic = 'force-static' not configured on route
 * '/opengraph-image'"*. O Next trata rota de metadado como handler, e handler
 * sem esta declaração não vira arquivo — a mesma trava de `app/robots.ts`.
 */
export const dynamic = 'force-static';

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export const alt = `${OG_CARDS.home.headline} — ${OG_CARDS.home.tagline}`;

export default function Image() {
  return ogCard(OG_CARDS.home);
}
