import Link from 'next/link';

import { type Accent, AccentZone } from '@/components/AccentZone';
import { ContactBlock } from '@/components/ContactBlock';
import { Container } from '@/components/Container';
import { Hero } from '@/components/Hero';
import { HowIWork } from '@/components/HowIWork';
import { ProjectCardPlaceholder } from '@/components/ProjectCardPlaceholder';
import { TimelineCondensed } from '@/components/TimelineCondensed';

type Project = {
  accent: Accent;
  name: string;
  tagline: string;
  liveUrl: string;
  caseUrl: string;
  stack: string[];
  shot: { label: string; spec: string };
};

/**
 * Dado local da home, curto de propósito.
 *
 * TODO(Task 7): trocar por `getAllProjects()`. O carregador já existe (Task 5)
 * e traz tudo o que está aqui — `content/projects/*.mdx` é a fonte de verdade
 * desde então, e esta lista é cópia. Não migrou junto porque ler conteúdo torna
 * a home um componente assíncrono, e `tests/unit/home.test.tsx` a renderiza de
 * forma síncrona (o Testing Library não monta Server Component assíncrono):
 * é mudança de teste, não de dado, e cabe na Task 7, que já vai montar o card
 * de projeto de verdade a partir do carregador.
 *
 * Ordem: **o Asafe abre a seção** (§4.6). Não é gosto — é o case que costura
 * com o /sobre (o músico que construiu a ferramenta do próprio ministério), e o
 * fio só funciona com ele em primeiro.
 *
 * Taglines e stacks batem com `docs/cv/luiz-freitas.html`, pela mesma regra do
 * §4.5: quem lê os dois nota a divergência.
 */
const PROJECTS: readonly Project[] = [
  {
    accent: 'asafe',
    name: 'Asafe',
    tagline: 'Organizar a música da Missa sem planilha e caderno.',
    liveUrl: 'https://asafe.mus.br',
    caseUrl: '/projetos/asafe',
    stack: ['Next.js', 'Expo', 'TypeScript', 'Supabase', 'Drizzle ORM', 'Cloudflare Workers'],
    shot: {
      label: 'capa — Repertório montado por momento',
      spec: '390×844 · WebP · tema escuro (§4.7)',
    },
  },
  {
    accent: 'eaifez',
    name: 'E aí, fez?',
    tagline: 'Desafios entre amigos com prenda semanal.',
    liveUrl: 'https://eaifez.com.br',
    caseUrl: '/projetos/eaifez',
    stack: ['Next.js', 'TypeScript', 'Supabase', 'Cloudflare Pages'],
    shot: { label: 'capa — Card compartilhável', spec: '390×844 · WebP (§4.7)' },
  },
];

/**
 * Um card por linha, ocupando a largura inteira da quebra de grade.
 *
 * O §3.1 desenha os dois lado a lado; aqui eles empilham, e o motivo é
 * mecânico. O `AccentTracker` elege a zona que cobre pelo menos 35% da
 * viewport. Em `wide` (60rem = 1080px na raiz de 18px), dois cards lado a lado
 * dão ~510px cada; num monitor de 1512px isso é no máximo 510/1512 = 0,337 da
 * largura — abaixo do limiar, **em qualquer altura**. Ou seja: lado a lado, o
 * acento nunca dispararia justamente na tela mais comum de quem avalia. Com um
 * card por linha a cobertura vai a ~0,54 em desktop e ~0,89 em 360px, e a
 * "assinatura" do §6.1 passa a existir de fato. Entre o desenho da caixinha e a
 * mecânica que o §6.1 chama de assinatura do site, a mecânica vence.
 */
function ProjectCard({ project }: { project: Project }) {
  return (
    <AccentZone accent={project.accent}>
      {/* `items-center`: a coluna do print tem a altura de um celular inteiro e o
          texto do card é curto — alinhado ao topo, o card fica com um vazio de
          uns 400px do lado direito. */}
      <article className="grid gap-8 border-t border-rule py-12 sm:grid-cols-[15rem_1fr] sm:items-center sm:gap-10">
        <ProjectCardPlaceholder label={project.shot.label} spec={project.shot.spec} />

        <div>
          <h3 className="font-display text-xl font-bold tracking-tight">{project.name}</h3>
          <p className="prose-measure mt-3 text-ink-2">{project.tagline}</p>

          {/* §2: a stack é legenda, e está grudada no projeto. Nunca solta. */}
          <ul className="mt-5 flex flex-wrap gap-x-3 gap-y-2 font-mono text-xs text-ink-2">
            {project.stack.map((tech) => (
              <li key={tech}>{tech}</li>
            ))}
          </ul>

          {/* §3.1: o principal leva direto ao app no ar ("o app aberto convence
              em 5 segundos"), com o case como link secundário menor. O nome do
              projeto entra no rótulo porque dois "Abrir o app" na mesma página
              dariam a dois links o mesmo nome acessível e destinos diferentes. */}
          <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3">
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-accent px-5 py-3 font-mono text-sm text-accent-ink hover:opacity-90"
            >
              Abrir o {project.name}
            </a>
            <Link
              href={project.caseUrl}
              className="font-mono text-xs text-accent-text underline underline-offset-4"
            >
              Ler o case do {project.name}
            </Link>
          </div>
        </div>
      </article>
    </AccentZone>
  );
}

/**
 * Home (§3.1), na ordem: hero, projetos próprios, trajetória condensada, como
 * eu trabalho, contato.
 *
 * §2: "a home é autossuficiente. Quem ler só a home já sabe quem é o Luiz, o
 * que ele construiu e como falar com ele. Nada essencial atrás de clique."
 *
 * O `<main>` é do layout — uma landmark por documento.
 */
export default function Page() {
  return (
    <>
      <Hero />

      <Container as="section" width="wide" className="py-4">
        <h2 className="font-display text-xl font-bold tracking-tight">Projetos próprios</h2>
        <div className="mt-8">
          {PROJECTS.map((project) => (
            <ProjectCard key={project.name} project={project} />
          ))}
        </div>
      </Container>

      <TimelineCondensed />
      <HowIWork />
      <ContactBlock />
    </>
  );
}
