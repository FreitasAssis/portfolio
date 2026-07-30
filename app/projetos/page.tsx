import type { Metadata } from 'next';

import { Container } from '@/components/Container';
import { EndNav } from '@/components/EndNav';
import { ProjectCard } from '@/components/ProjectCard';
import { Timeline } from '@/components/Timeline';
import { META } from '@/content/site';
import { getAllProjects } from '@/lib/projects';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({ meta: META.projetos, path: '/projetos' });

/**
 * `/projetos` (§3.2): **duas seções explicitamente rotuladas, nunca
 * misturadas** — "uma mostra iniciativa, a outra mostra experiência".
 *
 * A distinção é o conteúdo desta página, então ela é estrutural: dois `<h2>`
 * com os nomes do §3.2, em larguras diferentes (os cards rompem a margem, que é
 * o único gesto de layout do §6.4; a experiência fica na coluna de leitura,
 * porque é texto) e sem nenhum elemento em comum entre as duas.
 *
 * O `<h1>` cobre as duas: um documento tem um `<h1>` só, e chamá-lo de
 * "Projetos" deixaria a metade de baixo sem título de página.
 *
 * O `<main>` é do layout — uma landmark por documento.
 */
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

      {/* A página mais alta do site fora dos cases: dois cards grandes e cinco
          posições com `built`, `impact` e `stack`. Só a âncora — a corrente de
          "próximo" é dos cases (§4.6), e esta é a rota pai deles. */}
      <EndNav />
    </>
  );
}
