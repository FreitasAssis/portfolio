import { MDXRemote } from 'next-mdx-remote/rsc';

import { AccentZone } from '@/components/AccentZone';
import { Container } from '@/components/Container';
import { ProjectCardPlaceholder } from '@/components/ProjectCardPlaceholder';
import { Decisoes, mdxComponents, Stack } from '@/components/mdx-components';
import { getAllProjects, getProject, isShotPending, type Project } from '@/lib/projects';

/**
 * Obrigatório sob `output: 'export'` (§7): é esta lista que decide quais HTML
 * saem no `out/`. Como ela vem do carregador, um `.mdx` novo em
 * `content/projects/` já nasce com rota — nenhuma linha de código a mais.
 */
export async function generateStaticParams() {
  return (await getAllProjects()).map((project) => ({ slug: project.slug }));
}

/**
 * A capa do §3.3: cor do projeto, nome e uma linha do que é.
 *
 * CUIDADO AO EDITAR — texto sobre o preenchimento `--accent` só existe em
 * tamanho grande, de propósito. O par `--accent-ink` sobre `--accent` é
 * verificado em 3:1 (`tests/unit/contrast.test.ts`), que é o piso da WCAG para
 * texto grande; o do "E aí, fez?" mede 4.18:1 e reprova o piso de 4.5:1 do
 * texto normal. Daí a tagline em `text-lg` (25px) e nada de metadado miúdo
 * aqui dentro. Rótulo pequeno vai fora da faixa, sobre o papel.
 *
 * A faixa sangra a largura toda, mas o texto dela fica na coluna de leitura:
 * o §6.4 dá ao site UM gesto de layout, e gastá-lo aqui deixaria o nome do
 * projeto num eixo e o corpo do case em outro. Quem rompe a margem é a cor e
 * são os prints — o que é trabalho.
 */
function Cover({ project }: { project: Project }) {
  return (
    <div className="bg-accent text-accent-ink">
      <Container width="reading" className="py-16 sm:py-20">
        <h1 className="font-display text-3xl leading-tight font-bold tracking-tight">
          {project.name}
        </h1>
        <p className="mt-4 max-w-[30rem] text-lg leading-snug">{project.tagline}</p>
      </Container>
    </div>
  );
}

/**
 * Os dois links do §3.3. O do repo só existe quando o repo é público: o
 * "E aí, fez?" é privado (§4.6), e botão que leva a 404 é pior que ausência.
 *
 * Ficam fora da faixa colorida por acessibilidade — sobre o papel, o anel de
 * foco (`--accent-text`, §9) tem contraste; sobre o preenchimento do acento,
 * ele desapareceria, porque é a mesma cor da faixa no tema claro.
 */
function Actions({ project }: { project: Project }) {
  return (
    <Container width="reading" className="flex flex-wrap items-center gap-x-6 gap-y-3 py-8">
      <a
        href={project.liveUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="bg-accent px-5 py-3 font-mono text-sm text-accent-ink hover:opacity-90"
      >
        Abrir o {project.name}
      </a>
      {project.repoUrl && (
        <a
          href={project.repoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono text-xs text-accent-text underline underline-offset-4"
        >
          Código no GitHub
        </a>
      )}
    </Container>
  );
}

/**
 * A galeria do §3.3 — capa e os três prints do §4.7, na quebra de grade, que é
 * onde mora o trabalho (§6.4).
 *
 * Os arquivos chegam na Task 6. Até lá reaproveita o mesmo buraco tracejado dos
 * cards da home: proporção real de celular e `{{ }}` por extenso, para que ir
 * ao ar sem print seja impossível de não notar. O `alt` já está escrito no
 * frontmatter e aparece dentro do buraco — é ele que vai para a imagem.
 */
function Gallery({ project }: { project: Project }) {
  const shots = [project.cover, ...project.shots];
  return (
    <Container as="section" width="wide" className="py-14">
      <h2 className="sr-only">Prints do {project.name}</h2>
      <ul className="grid grid-cols-2 justify-items-center gap-8 lg:grid-cols-4">
        {shots.map((shot) => (
          <li key={shot.alt}>
            {isShotPending(shot) ? (
              <ProjectCardPlaceholder label={shot.alt} spec="390–430pt · 2x/3x · WebP (§4.7)" />
            ) : (
              // A Task 6 troca isto por <Image> com dimensões declaradas (§9).
              // eslint-disable-next-line @next/next/no-img-element
              <img src={shot.src} alt={shot.alt} className="w-full max-w-[15rem]" />
            )}
          </li>
        ))}
      </ul>
    </Container>
  );
}

/**
 * O case (§3.3). O template é fixo e a ordem das seções também — quem garante
 * que o corpo em MDX traz todas, e nessa ordem, é o `parseProject`.
 *
 * A página inteira é uma `AccentZone` (§6.1): é o case que empresta a cor ao
 * site, e uma zona do tamanho da página cobre a viewport com folga, então o
 * `AccentTracker` a elege e o header, o rodapé e o fundo acompanham.
 *
 * O `<main>` é do layout — uma landmark por documento.
 */
export default async function CasePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await getProject(slug);

  return (
    <AccentZone accent={project.slug}>
      <Cover project={project} />
      <Actions project={project} />

      {/* `reading` é a coluna estreita do §6.4; `prose-measure` trava a medida
          de 65–75 caracteres do §6.3 mesmo se a coluna crescer um dia. */}
      <Container as="article" width="reading" className="prose-measure pb-6">
        <MDXRemote
          source={project.body}
          components={{
            ...mdxComponents,
            // Os dois pontos em que o corpo dá lugar ao dado estruturado do
            // frontmatter: o MDX escolhe o lugar, o template escolhe a forma.
            Decisoes: () => <Decisoes items={project.decisions} />,
            Stack: () => <Stack items={project.stack} />,
          }}
        />
      </Container>

      <Gallery project={project} />
    </AccentZone>
  );
}
