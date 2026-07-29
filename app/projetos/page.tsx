import { Container } from '@/components/Container';
import { ProjectCard } from '@/components/ProjectCard';
import { Timeline } from '@/components/Timeline';
import { getAllProjects } from '@/lib/projects';

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
    </>
  );
}
