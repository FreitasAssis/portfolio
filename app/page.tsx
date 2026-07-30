import type { Metadata } from 'next';

import { ContactBlock } from '@/components/ContactBlock';
import { Container } from '@/components/Container';
import { EndNav } from '@/components/EndNav';
import { Hero } from '@/components/Hero';
import { HowIWork } from '@/components/HowIWork';
import { PersonJsonLd } from '@/components/JsonLd';
import { ProjectCard } from '@/components/ProjectCard';
import { TimelineCondensed } from '@/components/TimelineCondensed';
import { META } from '@/content/site';
import { getAllProjects } from '@/lib/projects';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({ meta: META.home, path: '/' });

/**
 * Home (§3.1), na ordem: hero, projetos próprios, trajetória condensada, como
 * eu trabalho, contato.
 *
 * §2: "a home é autossuficiente. Quem ler só a home já sabe quem é o Luiz, o
 * que ele construiu e como falar com ele. Nada essencial atrás de clique."
 *
 * Os cards saem de `content/projects/*.mdx` — a mesma fonte do `/projetos` e da
 * página de cada case. Até a Task 7 havia aqui uma cópia local do dado, com a
 * ordem, as taglines e as stacks escritas à mão; copiar conteúdo é a forma mais
 * silenciosa de divergir dele. A ordem também vem do dado (`order`), e o §4.6
 * fixa o Asafe em primeiro.
 *
 * Ler conteúdo torna a home um Server Component assíncrono. É o que muda para
 * quem testa: `tests/unit/home.test.tsx` renderiza `await Page()`.
 *
 * O `<main>` é do layout — uma landmark por documento.
 */
export default async function Page() {
  const projects = await getAllProjects();

  return (
    <>
      {/* §8: o `Person` só na home. Fica antes de tudo porque não pinta nada —
          é um `<script type="application/ld+json">`, invisível na página. */}
      <PersonJsonLd />

      <Hero />

      <Container as="section" width="wide" className="py-4">
        <h2 className="font-display text-xl font-bold tracking-tight">Projetos próprios</h2>
        <div className="mt-8">
          {projects.map((project, i) => (
            <ProjectCard key={project.slug} project={project} priority={i === 0} />
          ))}
        </div>
      </Container>

      <TimelineCondensed />
      <HowIWork />
      <ContactBlock />

      {/* O fim do `<main>`, e não o rodapé — a justificativa está no componente.
          Só a âncora: a home não tem "próximo" a oferecer. */}
      <EndNav />
    </>
  );
}
