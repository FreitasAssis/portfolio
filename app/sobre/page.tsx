import type { Metadata } from 'next';

import { Container } from '@/components/Container';
import { EndNav } from '@/components/EndNav';
import { Portrait } from '@/components/Portrait';
import { TechLayers } from '@/components/TechLayers';
import { ABOUT_PARAGRAPHS, EDUCATION } from '@/content/about';
import { META } from '@/content/site';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({ meta: META.sobre, path: '/sobre' });

export default function SobrePage() {
  return (
    <>
      <Container className="pt-14">
        <h1 className="font-display text-2xl font-bold tracking-tight">Sobre</h1>
      </Container>

      {/* Só os parágrafos: o teste que os conta toma esta seção sem `h2` como
          fronteira, e qualquer outro `<p>` aqui dentro faz a contagem mentir. */}
      <Container as="section" className="space-y-6 pt-8">
        {ABOUT_PARAGRAPHS.map((paragraph) => (
          <p key={paragraph.slice(0, 24)} className="prose-measure text-ink">
            {paragraph}
          </p>
        ))}
      </Container>

      {/* Depois do texto, não ao lado: na coluna de 44rem, dividir a linha com a
          foto derruba a prosa para uns 40 caracteres, abaixo do piso de 65. */}
      <Container className="pt-12">
        <Portrait />
      </Container>

      <Container>
        <TechLayers />
      </Container>

      {/* `py-16` e não `pt-16`: o `EndNav` logo abaixo não traz margem de cima
          nenhuma, e cada seção paga o próprio ritmo vertical. */}
      <Container as="section" className="py-16">
        <h2 className="font-display text-xl font-bold tracking-tight">Formação</h2>
        <p className="mt-4 font-mono text-xs leading-relaxed text-ink-2">
          <span className="text-ink">{EDUCATION.degree}</span>
          <br />
          {EDUCATION.institution} — {EDUCATION.conclusion}
        </p>
      </Container>

      <EndNav />
    </>
  );
}
