import Image from 'next/image';
import Link from 'next/link';

import { AccentZone } from '@/components/AccentZone';
import { ProjectCardPlaceholder } from '@/components/ProjectCardPlaceholder';
import { isShotPending, type Project } from '@/lib/projects';

/**
 * O card grande de projeto próprio — o mesmo na home (§3.1) e no `/projetos`
 * (§3.2), porque é a mesma oferta: "abra o app; se quiser, leia o case".
 *
 * **Um card por linha, ocupando a largura inteira da quebra de grade.** O §3.1
 * desenha os dois lado a lado; aqui eles empilham, e o motivo é mecânico. O
 * `AccentTracker` elege a zona que cobre pelo menos 35% da viewport. Em `wide`
 * (60rem = 1080px na raiz de 18px), dois cards lado a lado dão ~510px cada; num
 * monitor de 1512px isso é no máximo 510/1512 = 0,337 da largura — abaixo do
 * limiar, **em qualquer altura**. Ou seja: lado a lado, o acento nunca
 * dispararia justamente na tela mais comum de quem avalia. Com um card por linha
 * a cobertura vai a ~0,5 em desktop e ~0,9 em 360px, e a "assinatura" do §6.1
 * passa a existir de fato. Entre o desenho da caixinha e a mecânica que o §6.1
 * chama de assinatura do site, a mecânica vence.
 *
 * A imagem é o `cardShot` e não a `cover`: quem decide isso é o conteúdo, não
 * este componente (ver `lib/projects.ts`). Aqui a caixa é sempre a mesma —
 * retrato de celular, com teto de 15rem — porque o carregador já garante que
 * todo `cardShot` é retrato.
 */
export function ProjectCard({
  project,
  priority = false,
}: {
  project: Project;
  /** Só o primeiro card da página. Ele é o LCP em telas comuns; os demais
   *  entram no lazy-load, senão o preload disputa banda com o que está na
   *  dobra e o §9 (Lighthouse ≥ 95) paga a conta. */
  priority?: boolean;
}) {
  const shot = project.cardShot;

  return (
    <AccentZone accent={project.slug}>
      {/* `items-center`: a coluna do print tem a altura de um celular inteiro e o
          texto do card é curto — alinhado ao topo, o card fica com um vazio de
          uns 400px do lado direito. */}
      <article className="grid gap-8 border-t border-rule py-12 sm:grid-cols-[15rem_1fr] sm:items-center sm:gap-10">
        {isShotPending(shot) ? (
          <ProjectCardPlaceholder label={shot.alt} spec="390–430pt · 2x/3x · WebP (§4.7)" />
        ) : (
          <Image
            src={shot.src}
            alt={shot.alt}
            width={shot.width}
            height={shot.height}
            // A largura precisa ser DEFINIDA em CSS, com a altura em `auto`: a
            // proporção declarada só reserva espaço se um dos eixos for
            // definido. Com os dois em `auto` o navegador mede 0×0 até o byte
            // chegar — o pulo de layout que o §9 manda evitar.
            className="h-auto w-full max-w-[15rem] rounded-md ring-1 ring-rule"
            priority={priority}
          />
        )}

        <div>
          <h3 className="font-display text-xl font-bold tracking-tight">{project.name}</h3>
          <p className="prose-measure mt-3 text-ink-2">{project.tagline}</p>

          {/* §2: a stack é legenda, e está grudada no projeto. Nunca solta. */}
          <ul className="mt-5 flex flex-wrap gap-x-3 gap-y-2 font-mono text-xs text-ink-2">
            {project.stack.map((tech) => (
              <li key={tech.name}>{tech.name}</li>
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
