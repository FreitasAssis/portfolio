import Image from 'next/image';
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
 * Um print, ou o buraco tracejado enquanto ele não existe (§0).
 *
 * `next/image` mesmo com `images.unoptimized` (§7 exporta estático): aqui ele
 * não serve para otimizar, serve para o que o §9 pede — dimensão declarada,
 * `loading="lazy"` de graça e, principalmente, a reserva de espaço. Sem ela a
 * galeria fica no fim de uma página longa e empurra o rodapé ao carregar.
 *
 * CUIDADO AO EDITAR — a largura precisa ser DEFINIDA em CSS (`w-full` dentro de
 * uma caixa com `max-w`), com a altura em `auto`. A proporção declarada nos
 * atributos só reserva espaço se um dos dois eixos for definido: com
 * `w-auto h-auto`, o navegador não tem de onde partir e a imagem mede 0×0 até
 * o byte chegar — que é exatamente o pulo de layout que o §9 manda evitar.
 * Medido no Chromium: com os dois em `auto`, as quatro imagens abriam em 0×0.
 *
 * Cantos arredondados e um fio de contorno vêm do §4.7 ("sem moldura de
 * celular… cantos arredondados, sombra sutil"). O fio é necessário porque o
 * fundo do próprio print é claro e encostaria no papel do site sem borda
 * visível — o contorno é o que faz a captura ler como objeto.
 */
function Shot({
  shot,
  className = '',
}: {
  readonly shot: Project['cover'];
  /** O teto da caixa. É por chamada porque capa e print têm pesos diferentes. */
  readonly className?: string;
}) {
  return (
    <div className={`w-full ${className}`}>
      {isShotPending(shot) ? (
        <ProjectCardPlaceholder label={shot.alt} spec="390–430pt · 2x/3x · WebP (§4.7)" />
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
 * A galeria do §3.3 — capa e os três prints do §4.7, na quebra de grade, que é
 * onde mora o trabalho (§6.4).
 *
 * CUIDADO AO EDITAR — a capa tem linha própria porque **a proporção dela varia
 * por projeto**. A do "E aí, fez?" é a imagem OG do app, 1200×630, paisagem:
 * o §4.7 a escolhe justamente por ser "o único elemento projetado para ser
 * visto fora do app". A do Asafe é um repertório, retrato de celular. Numa
 * grade de quatro colunas as duas orientações não convivem: a linha ganha a
 * altura do print mais alto (~520px) e o card paisagem (~126px) flutua no meio
 * dela como uma estampa. Em linha própria, cada uma é limitada pelo eixo que
 * lhe cabe — a paisagem pela largura, a retrato pela altura — e as duas saem
 * do mesmo tamanho aparente.
 *
 * Os três prints ficam num strip de três. Em uma coluna no telefone, e não em
 * duas: são três, e duas colunas deixariam o terceiro órfão numa segunda
 * linha, encostado à esquerda.
 */
function Gallery({ project }: { readonly project: Project }) {
  // A orientação sai da medida declarada, não de um `if (slug === 'eaifez')`:
  // é o dado do projeto que decide, e um case novo com capa paisagem acerta
  // sozinho. Print pendente cai em retrato, que é a forma do placeholder.
  const capaPaisagem = !isShotPending(project.cover) && project.cover.width > project.cover.height;

  return (
    <Container as="section" width="wide" className="py-14">
      <h2 className="sr-only">Prints do {project.name}</h2>

      {/* A capa retrato tem teto MAIOR que o dos prints (20rem contra os 17rem
          a que a coluna chega em `lg`), e não o mesmo. Com o teto igual, a capa
          do Asafe — que é retrato, ao contrário da do "E aí, fez?" — sairia
          menor que os três prints que ela encabeça, porque o strip cresce com a
          coluna e ela não. Capa menor que a galeria inverte a hierarquia que o
          §3.3 dá a ela. */}
      <div className="flex justify-center">
        <Shot shot={project.cover} className={capaPaisagem ? 'max-w-[34rem]' : 'max-w-[20rem]'} />
      </div>

      {/* O strip de três só abre em `lg`, e o critério é medido, não estético:
          empilhado, cada print tem 270px. Numa grade de três, a coluna só
          alcança esses 270px a partir de ~874px de viewport — em `sm` daria
          165px e em `md`, 202px. Abrir antes faria a captura ENCOLHER ao
          ganhar espaço de tela, que é o pior dos dois mundos. De `lg` para
          cima o teto sai e o print ocupa a coluna inteira: 290px em 1024,
          306px na largura máxima do contêiner. */}
      <ul className="mt-10 grid justify-items-center gap-8 lg:grid-cols-3">
        {project.shots.map((shot) => (
          <li key={shot.alt} className="w-full max-w-[15rem] lg:max-w-none">
            <Shot shot={shot} />
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
          de 65–75 caracteres do §6.3 mesmo se a coluna crescer um dia.

          O `prose-measure` fica no wrapper interno, e não no `Container`: ele é
          `max-width`, então no contêiner o teto de 68ch valeria para a caixa
          COM padding, e os 45px de cada lado sairiam do texto. Medido no
          Chromium: com a classe no contêiner o corpo do case renderizava a
          59,2 caracteres — abaixo do piso de 65 justamente na página que o
          §6.3 cita por nome ("medida de leitura em 65–75 caracteres nos
          cases"). Por dentro do padding, dá os 68ch exatos. */}
      <Container as="article" width="reading" className="pb-6">
        <div className="prose-measure">
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
        </div>
      </Container>

      <Gallery project={project} />
    </AccentZone>
  );
}
