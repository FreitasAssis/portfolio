import type { Metadata } from 'next';

import { Container } from '@/components/Container';
import { EndNav } from '@/components/EndNav';
import { ProjectCard } from '@/components/ProjectCard';
import { Timeline } from '@/components/Timeline';
import { META } from '@/content/site';
import { getAllProjects } from '@/lib/projects';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({ meta: META.projetos, path: '/projetos' });

export default async function ProjetosPage() {
  const projects = await getAllProjects();

  return (
    <>
      <Container width="wide" className="pt-14">
        <h1 className="font-display text-2xl font-bold tracking-tight">Projetos e experiência</h1>
      </Container>

      <Container as="section" width="wide" className="pt-10">
        <h2 className="font-display text-xl font-bold tracking-tight">Projetos próprios</h2>
        <div className="mt-8">
          {projects.map((project, i) => (
            <ProjectCard key={project.slug} project={project} priority={i === 0} />
          ))}
        </div>
      </Container>

      <Timeline />

      <EndNav />
    </>
  );
}
