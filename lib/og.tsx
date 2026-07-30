import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { ImageResponse } from 'next/og';

/** O recorte que LinkedIn, Twitter e Facebook mostram inteiro, sem cortar. */
export const OG_SIZE = { width: 1200, height: 630 } as const;

/**
 * O `contentType` da rota vale só em runtime, e este site não tem runtime: sob
 * `output: 'export'` o Next escreve o PNG em `out/<rota>/opengraph-image`,
 * **sem extensão**, e quem serve o arquivo deduz o tipo do nome. Sem extensão
 * isso vira `application/octet-stream` e o crawler recusa a imagem — card
 * quebrado é pior que card nenhum. É `public/_headers` que fecha o buraco, e
 * `tests/e2e/seo.spec.ts` confere que ele cobre as seis rotas.
 *
 * O `generateImageMetadata`, que poria o `.png` na URL, não serve aqui: dentro
 * de um segmento dinâmico o Next substitui o `generateStaticParams` do arquivo
 * pelo dele, que só enumera o id da imagem, e o build para dizendo que
 * `/projetos/[slug]/opengraph-image/[__metadata_id__]` não tem
 * `generateStaticParams`. Usá-lo só nas quatro rotas fixas daria dois formatos
 * de URL e não dispensaria o `_headers`.
 */
export const OG_CONTENT_TYPE = 'image/png';

/**
 * O card sem projeto na tela. Não é cor nova: é o que `:root` já declara em
 * `app/globals.css` para `--accent` e `--accent-ink` enquanto nenhum projeto
 * emprestou a sua. Os dois cases sobrescrevem com o hex da própria marca.
 */
export const OG_NEUTRAL = { fill: '#14161A', ink: '#FAFAFA' } as const;

/**
 * O menor corpo de texto do card, em pixels.
 *
 * `#FAFAFA` sobre o `#C8506A` do "E aí, fez?" mede 4.18:1 — acima do piso de
 * 3:1 que a WCAG dá a texto grande (24px), abaixo do 4.5:1 do texto normal.
 * Baixar este número reprova o card de um projeto só, e no olho ninguém vê.
 * `tests/unit/og.test.ts` mede os dois lados.
 */
export const OG_MIN_FONT_SIZE = 26;

/**
 * O corpo da manchete, e o comprimento em que ela deixa de caber numa linha.
 * "Projetos e experiência" é a única das seis que quebra em duas.
 */
const HEADLINE_SIZE = { grande: 128, pequena: 96, limite: 14 } as const;

/**
 * O satori não lê CSS nem `next/font`: a fonte precisa chegar como buffer, e
 * WOFF2 — o formato que o `next/font` deixa no `.next/` — não é aceito. Os três
 * arquivos ficam versionados em `assets/fonts/` (WOFF, licença OFL ao lado)
 * porque baixá-los durante o build faria `npm run build` depender de rede.
 */
const FONTS_DIR = join(process.cwd(), 'assets/fonts');

const DISPLAY = 'Bricolage Grotesque';
const BODY = 'Newsreader';
const MONO = 'JetBrains Mono';

function font(name: string, file: string, weight: 400 | 500 | 800) {
  return { name, data: readFileSync(join(FONTS_DIR, file)), weight, style: 'normal' as const };
}

const FONTS = [
  font(DISPLAY, 'BricolageGrotesque-ExtraBold.woff', 800),
  font(BODY, 'Newsreader-Regular.woff', 400),
  font(MONO, 'JetBrainsMono-Medium.woff', 500),
];

export type OgCard = {
  /** A manchete, em display. É o nome do projeto nos cases. */
  readonly headline: string;
  /** A linha de apoio, em corpo serifado. É a tagline nos cases. */
  readonly tagline: string;
  /** O preenchimento: o hex da marca do case, ou `OG_NEUTRAL.fill`. */
  readonly fill?: string;
  readonly ink?: string;
};

export function ogHeadlineSize(headline: string): number {
  return headline.length <= HEADLINE_SIZE.limite ? HEADLINE_SIZE.grande : HEADLINE_SIZE.pequena;
}

/**
 * A hierarquia é a mesma da página: mono de metadado no alto, display grande
 * embaixo, corpo serifado sob ela. Sem imagem e sem gradiente — o card é lido
 * em miniatura num feed, onde só sobrevive a diferença de corpo.
 */
export function ogCard({ headline, tagline, fill = OG_NEUTRAL.fill, ink = OG_NEUTRAL.ink }: OgCard) {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '72px 80px',
          background: fill,
          color: ink,
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              display: 'flex',
              fontFamily: MONO,
              fontSize: OG_MIN_FONT_SIZE,
              letterSpacing: '0.02em',
            }}
          >
            luizfreitas.com.br
          </div>
          <div
            style={{ display: 'flex', marginTop: 22, height: 2, backgroundColor: ink, opacity: 0.3 }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              display: 'flex',
              fontFamily: DISPLAY,
              fontWeight: 800,
              fontSize: ogHeadlineSize(headline),
              letterSpacing: '-0.035em',
              lineHeight: 1.04,
            }}
          >
            {headline}
          </div>
          <div
            style={{
              display: 'flex',
              marginTop: 26,
              maxWidth: 900,
              fontFamily: BODY,
              fontSize: 40,
              lineHeight: 1.3,
              textWrap: 'balance',
            }}
          >
            {tagline}
          </div>
        </div>
      </div>
    ),
    { ...OG_SIZE, fonts: FONTS },
  );
}
