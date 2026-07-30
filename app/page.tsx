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
        <div className="mt-8">
          {projects.map((project, i) => (
            <ProjectCard key={project.slug} project={project} priority={i === 0} />
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
