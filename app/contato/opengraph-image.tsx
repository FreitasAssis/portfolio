import { OG_CARDS } from '@/content/site';
import { OG_CONTENT_TYPE, OG_SIZE, ogCard } from '@/lib/og';

/** Sem esta linha o build estático para na rota; o porquê está em `app/robots.ts`. */
export const dynamic = 'force-static';

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export const alt = `${OG_CARDS.contato.headline} — ${OG_CARDS.contato.tagline}`;

export default function Image() {
  return ogCard(OG_CARDS.contato);
}
