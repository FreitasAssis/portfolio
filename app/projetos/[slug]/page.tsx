import type { Metadata } from 'next';
import Image from 'next/image';
import { MDXRemote } from 'next-mdx-remote/rsc';

import { AccentZone } from '@/components/AccentZone';
import { CaseEndNav } from '@/components/CaseEndNav';
import { Container } from '@/components/Container';
import { AssetPlaceholder } from '@/components/AssetPlaceholder';
import { Decisoes, mdxComponents, Stack } from '@/components/mdx-components';
import { caseTitle } from '@/content/site';
import {
  getAllProjects,
  getProject,
  isShotPending,
  nextProject,
  type Project,
} from '@/lib/projects';
import { pageMetadata } from '@/lib/seo';

/** Sob `output: 'export'`, é esta lista que decide quais HTML saem no `out/`. */
export async function generateStaticParams() {
  return (await getAllProjects()).map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProject(slug);

  return pageMetadata({
    meta: { title: caseTitle(project.name), description: project.description },
    path: `/projetos/${project.slug}`,
  });
}

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
 * Fora da faixa colorida de propósito: sobre o papel o anel de foco
 * (`--accent-text`) tem contraste; sobre o preenchimento do acento ele
 * desapareceria, por ser a mesma cor da faixa no tema claro.
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
 * Um print, ou o buraco tracejado enquanto ele não existe.
 *
 * A largura precisa ser DEFINIDA em CSS (`w-full` numa caixa com `max-w`) e a
 * altura ficar em `auto`. A proporção declarada nos atributos só reserva espaço
 * se um dos eixos for definido: com os dois em `auto`, as imagens abrem em 0×0
 * até o byte chegar.
 */
function Shot({
  shot,
  className = '',
}: {
  readonly shot: Project['cover'];
  /** O teto de largura da caixa. */
  readonly className?: string;
}) {
  return (
    <div className={`w-full ${className}`}>
      {isShotPending(shot) ? (
        <AssetPlaceholder
          label={`print: ${shot.alt}`}
          spec="390–430pt · 2x/3x · WebP"
          aspect="aspect-[390/844]"
          width="max-w-[15rem]"
        />
      ) : (
        <Image
          src={shot.src}
          alt={shot.alt}
          width={shot.width}
          height={shot.height}
          className="h-auto w-full rounded-md ring-1 ring-rule"
        />
      )}
    </div>
  );
}

/**
 * Paisagem pela MEDIDA declarada, nunca pelo slug: é o mesmo dado que o
 * carregador já usa para recusar `cardShot` paisagem, e é o que faz um projeto
 * novo entrar na galeria certa sem tocar neste arquivo. Print ainda pendente cai
 * em retrato, que é a proporção do buraco tracejado.
 */
function ehPaisagem(shot: Project['cover']): boolean {
  return !isShotPending(shot) && shot.width > shot.height;
}

/**
 * Os prints em faixas de mesma orientação, na ordem do frontmatter.
 *
 * Não é `filter` duas vezes de propósito: separar por orientação reordenaria a
 * galeria se um dia um retrato viesse entre dois paisagens, e a ordem dos prints
 * é conteúdo — o primeiro é o que sustenta a primeira decisão.
 */
function faixas(shots: readonly Project['cover'][]) {
  const out: { paisagem: boolean; shots: Project['cover'][] }[] = [];
  for (const shot of shots) {
    const paisagem = ehPaisagem(shot);
    const ultima = out.at(-1);
    if (ultima?.paisagem === paisagem) ultima.shots.push(shot);
    else out.push({ paisagem, shots: [shot] });
  }
  return out;
}

/**
 * A capa tem linha própria porque a proporção dela varia por projeto (a da
 * Ciranda e a do "E aí, fez?" são paisagem, a do Asafe retrato). Numa grade única
 * a linha ganha a altura do print mais alto e o card paisagem flutua no meio dela.
 *
 * O mesmo raciocínio vale para os prints, e desde a Ciranda ele morde: ela é o
 * primeiro case cuja galeria mistura as duas orientações. Um retrato numa coluna
 * de 272px tem 585px de altura e os paisagens ao lado dele têm ~200px — a linha
 * ganha a altura do retrato e os outros dois boiam. Por isso cada faixa de mesma
 * orientação recebe a própria linha, com a trilha larga para paisagem e a
 * estreita para retrato.
 */
function Gallery({ project }: { readonly project: Project }) {
  return (
    <Container as="section" width="wide" className="py-14">
      {/* "do projeto X", e não "do X": o artigo tem gênero e o nome do projeto
          vem do frontmatter — "Prints do Ciranda" sai errado, e num título
          sr-only ninguém vê o erro, só quem usa leitor de tela ouve. */}
      <h2 className="sr-only">Prints do projeto {project.name}</h2>

      {/* O teto da capa retrato é maior que o dos prints (20rem contra os 17rem a
          que a coluna chega em `lg`) porque o strip cresce com a coluna e ela
          não: igualando os tetos, a capa sai menor que os prints que encabeça. */}
      <div className="flex justify-center">
        <Shot
          shot={project.cover}
          className={ehPaisagem(project.cover) ? 'max-w-[34rem]' : 'max-w-[20rem]'}
        />
      </div>

      {/* As trilhas só abrem em `lg`: empilhado cada print retrato tem 240px, e
          numa grade de três a coluna só alcança isso a partir de ~874px de
          viewport. Abrir em `sm` (165px) ou `md` (202px) faz a captura ENCOLHER
          ao ganhar tela.

          `auto-fit` com trilha de largura FIXA, e não `grid-cols-3` com `1fr`: a
          faixa de uma imagem só (o retrato da Ciranda, sozinho depois de dois
          paisagens) ocuparia a coluna 1 de três e ficaria encostada na esquerda.
          Com auto-fit as trilhas vazias colapsam e o `justify-center` centraliza
          o que sobrou. Com três retratos as trilhas dão os mesmos 272px de antes,
          então Asafe e "E aí, fez?" não mudam de tamanho.

          O `justify-center` vale só de `lg` pra cima porque abaixo dele a trilha
          é implícita e `auto`: centralizar o conteúdo a faria medir por
          max-content, e a imagem de 2560px estouraria a viewport de 360px em vez
          de caber nela. */}
      <div className="mt-10 space-y-8">
        {faixas(project.shots).map((faixa) => (
          <ul
            key={faixa.shots[0].alt}
            className={`grid justify-items-center gap-8 lg:justify-center ${
              faixa.paisagem
                ? 'lg:grid-cols-[repeat(auto-fit,minmax(0,26rem))]'
                : 'lg:grid-cols-[repeat(auto-fit,minmax(0,17rem))]'
            }`}
          >
            {faixa.shots.map((shot) => (
              <li
                key={shot.alt}
                className={`w-full ${faixa.paisagem ? 'max-w-[34rem] lg:max-w-none' : 'max-w-[15rem] lg:max-w-none'}`}
              >
                <Shot shot={shot} />
              </li>
            ))}
          </ul>
        ))}
      </div>
    </Container>
  );
}

export default async function CasePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await getProject(slug);
  const next = nextProject(await getAllProjects(), slug);

  return (
    <AccentZone accent={project.slug}>
      <Cover project={project} />
      <Actions project={project} />

      {/* O `prose-measure` fica neste wrapper, e não no `Container`: sendo
          `max-width`, no contêiner o teto de 68ch valeria para a caixa COM
          padding e os 45px de cada lado sairiam do texto — o corpo do case caía
          para 59,2 caracteres, abaixo do piso de 65. */}
      <Container as="article" width="reading" className="pb-6">
        <div className="prose-measure">
          <MDXRemote
            source={project.body}
            components={{
              ...mdxComponents,
              Decisoes: () => <Decisoes items={project.decisions} />,
              Stack: () => <Stack items={project.stack} />,
            }}
          />
        </div>
      </Container>

      <Gallery project={project} />

      <CaseEndNav next={next} />
    </AccentZone>
  );
}
