import { OG_CONTENT_TYPE, OG_SIZE, ogCard } from '@/lib/og';
import { getAllProjects, getProject } from '@/lib/projects';

/** Sem esta linha o build estático para na rota; o porquê está em `app/robots.ts`. */
export const dynamic = 'force-static';

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export const alt = 'O nome do projeto e a frase que o resume, sobre a cor da marca dele.';

/**
 * A rota de imagem **não** herda o `generateStaticParams` da página ao lado: sem
 * esta lista o export não emite nada para os cases e as duas rotas ficam com um
 * `og:image` apontando para arquivo que não existe.
 */
export async function generateStaticParams() {
  return (await getAllProjects()).map((project) => ({ slug: project.slug }));
}

/**
 * O único card que não é neutro: aqui ele empresta o hex da marca, como a capa
 * do case. O `ink` é `#FAFAFA` fixo, e não derivado do tema — é o mesmo
 * `--accent-ink` que `app/globals.css` fixa por acento, porque o preenchimento
 * é a cor da marca e não vira com o tema.
 */
export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await getProject(slug);

  return ogCard({
    headline: project.name,
    tagline: project.tagline,
    fill: project.accent,
    ink: '#FAFAFA',
  });
}
