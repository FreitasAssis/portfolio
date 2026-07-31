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

export default async function Page() {
  const projects = await getAllProjects();

  return (
    <>
      <PersonJsonLd />

      <Hero />

      <Container as="section" width="wide" className="py-4">
        <h2 className="font-display text-xl font-bold tracking-tight">Projetos próprios</h2>
        {/* Nenhum card com `priority` aqui, ao contrário do /projetos: o hero
            vem antes e empurra o primeiro print para 1023px em 412×823 e 1103px
            em 360×640, sempre abaixo da dobra. O preload disputaria banda com as
            fontes de que o h1 — que é o elemento de LCP medido — precisa. */}
        <div className="mt-8">
          {projects.map((project) => (
            <ProjectCard key={project.slug} project={project} />
          ))}
        </div>
      </Container>

      <TimelineCondensed />
      <HowIWork />
      <ContactBlock />

      <EndNav />
    </>
  );
}
