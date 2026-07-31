import type { Metadata } from 'next';
import { Fragment } from 'react';

import { Container } from '@/components/Container';
import { EndNav } from '@/components/EndNav';
import { Portrait } from '@/components/Portrait';
import { TechLayers } from '@/components/TechLayers';
import { ABOUT_PARAGRAPHS, EDUCATION } from '@/content/about';
import { META } from '@/content/site';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({ meta: META.sobre, path: '/sobre' });

/**
 * Índice 2 = **terceiro** parágrafo, o que diz "já tocava na igreja antes mesmo
 * de programar, inclusive o Asafe veio daqui". É a foto dele tocando na igreja:
 * ali ela deixa de ilustrar e vira prova da frase, e é a dobradiça para o case
 * do Asafe. Depois dos cinco, sozinha, ela lia como apêndice.
 *
 * O índice está aqui, e não como um `if` sobre o texto do parágrafo, porque o
 * texto é dado curado e comparado verbatim em `tests/unit/sobre.test.tsx` —
 * casar por conteúdo amarraria o layout à pontuação. A posição é travada lá, em
 * ordem de DOM, que é o que a faz certa também para leitor de tela.
 */
const PARAGRAFO_DO_RETRATO = 2;

export default function SobrePage() {
  return (
    <>
      <Container className="pt-14">
        <h1 className="font-display text-2xl font-bold tracking-tight">Sobre</h1>
      </Container>

      {/* Só os parágrafos e o retrato: o teste que os conta toma esta seção sem
          `h2` como fronteira, e qualquer outro `<p>` aqui dentro faz a contagem
          mentir. */}
      <Container as="section" className="space-y-6 pt-8">
        {ABOUT_PARAGRAPHS.map((paragraph, indice) => (
          <Fragment key={paragraph.slice(0, 24)}>
            <p className="prose-measure text-ink">{paragraph}</p>
            {indice === PARAGRAFO_DO_RETRATO && (
              // `prose-measure` num bloco sem texto: o que centra a foto é este
              // teto. A caixa do `Container` tem 702px e a coluna de 68ch tem
              // 693, então centrar na caixa jogaria a foto 4,3px à direita do
              // eixo do texto — medido, e é o que o teste de e2e recusa. A régua
              // do leitor é a coluna, não a caixa.
              //
              // E `py` em vez de `my`: o `space-y-6` da seção já escreve o
              // `margin-top` de cada irmão, e uma margem aqui disputaria a mesma
              // declaração. O padding soma, e a foto fica com o mesmo ar dos
              // dois lados.
              <div className="prose-measure flex justify-center py-2">
                <Portrait />
              </div>
            )}
          </Fragment>
        ))}
      </Container>

      <Container>
        <TechLayers />
      </Container>

      {/* `py-16` e não `pt-16`: o `EndNav` logo abaixo não traz margem de cima
          nenhuma, e cada seção paga o próprio ritmo vertical. */}
      <Container as="section" className="py-16">
        <h2 className="font-display text-xl font-bold tracking-tight">Formação</h2>
        <p className="mt-4 font-mono text-xs leading-relaxed text-ink-2">
          <span className="text-ink">{EDUCATION.degree}</span>
          <br />
          {EDUCATION.institution} — {EDUCATION.conclusion}
        </p>
      </Container>

      <EndNav />
    </>
  );
}
