import Image from 'next/image';
import { Link } from '@/components/Link';

import { AccentZone } from '@/components/AccentZone';
import { AssetPlaceholder } from '@/components/AssetPlaceholder';
import { isShotPending, type Project } from '@/lib/projects';

/**
 * **Um card por linha, e não dois lado a lado.** O `AccentTracker` elege a zona
 * que cobre 35% da viewport; em `wide` (1080px) dois cards lado a lado dão ~510px
 * cada, o que num monitor de 1512px é no máximo 0,337 da largura — abaixo do
 * limiar em QUALQUER altura. Lado a lado, o acento nunca dispara na tela mais
 * comum. Empilhados a cobertura vai a ~0,5 em desktop e ~0,9 em 360px.
 */
export function ProjectCard({
  project,
  priority = false,
}: {
  project: Project;
  /** Só onde o print de fato nasce acima da dobra — ver a chamada em
   *  app/projetos/page.tsx e a ausência dela em app/page.tsx. */
  priority?: boolean;
}) {
  const shot = project.cardShot;

  return (
    <AccentZone accent={project.slug}>
      {/* `items-center`: a coluna do print tem a altura de um celular inteiro e o
          texto é curto — alinhado ao topo, sobra um vazio de uns 400px à direita. */}
      <article className="grid gap-8 border-t border-rule py-12 sm:grid-cols-[15rem_1fr] sm:items-center sm:gap-10">
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
            // Largura DEFINIDA em CSS, altura em `auto`: a proporção declarada só
            // reserva espaço se um dos eixos for definido. Com os dois em `auto`
            // a imagem mede 0×0 até o byte chegar.
            className="h-auto w-full max-w-[15rem] rounded-md ring-1 ring-rule"
            priority={priority}
            // `lazy` sozinho não segura: a margem do lazy-loading do Chrome é
            // maior que a distância até este print, então ele é buscado no
            // primeiro instante mesmo abaixo da dobra — e são ~145KB disputando
            // banda com as fontes de que o elemento de LCP depende. A prioridade
            // baixa não adia a busca, só a põe atrás delas na fila.
            fetchPriority={priority ? undefined : 'low'}
          />
        )}

        <div>
          <h3 className="font-display text-xl font-bold tracking-tight">{project.name}</h3>
          <p className="prose-measure mt-3 text-ink-2">{project.tagline}</p>

          <ul className="mt-5 flex flex-wrap gap-x-3 gap-y-2 font-mono text-xs text-ink-2">
            {project.stack.map((tech) => (
              <li key={tech.name}>{tech.name}</li>
            ))}
          </ul>

          {/* O nome do projeto entra no rótulo porque dois "Abrir o app" na mesma
              página dariam a dois links o mesmo nome acessível e destinos
              diferentes. */}
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
              href={`/projetos/${project.slug}`}
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
