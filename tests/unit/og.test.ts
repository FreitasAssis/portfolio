import { describe, expect, it } from 'vitest';

import { META, OG_CARDS } from '@/content/site';
import { contrastRatio } from '@/lib/contrast';
import { OG_MIN_FONT_SIZE, OG_NEUTRAL, OG_SIZE, ogHeadlineSize } from '@/lib/og';
import { getAllProjects } from '@/lib/projects';

/**
 * O card de OG na origem: o texto e as cores, antes de virarem PNG.
 *
 * Que o PNG saiu, que ele mede 1200×630 e que o pixel do canto carrega o hex do
 * projeto é `tests/e2e/seo.spec.ts` quem mede, no `out/`. Os dois não se
 * substituem: aqui a falha aponta a linha do texto errado; lá, a rota que ficou
 * sem imagem.
 */

const O_TEXTO_ESCAPA = /[’‘“”]/;

describe('texto do card', () => {
  it('cobre as quatro rotas fixas, e só elas', () => {
    expect(Object.keys(OG_CARDS)).toEqual(Object.keys(META));
  });

  it('a manchete é o começo do título da rota', () => {
    // O card e a aba do navegador chegam juntos ao mesmo leitor, no mesmo
    // instante: manchete que não abre o título lê como outra página.
    for (const [rota, { headline }] of Object.entries(OG_CARDS)) {
      const { title } = META[rota as keyof typeof META];
      expect(title.startsWith(headline), `${rota}: "${headline}" não abre "${title}"`).toBe(true);
    }
  });

  it('a linha de apoio é um trecho literal da description da rota', () => {
    // A trava contra copy nova nascer aqui: a description é longa demais para
    // um card lido em miniatura, mas o card não pode prometer outra coisa.
    for (const [rota, { tagline }] of Object.entries(OG_CARDS)) {
      const { description } = META[rota as keyof typeof META];
      expect(
        description.toLowerCase().includes(tagline.toLowerCase()),
        `${rota}: "${tagline}" não aparece na description da rota`,
      ).toBe(true);
    }
  });

  it('nenhuma linha usa aspas ou apóstrofo tipográfico', () => {
    // O satori desenha com a fonte que recebeu, e as três são subconjuntos
    // latinos: um glifo ausente vira retângulo vazio no meio do card, e no
    // `out/` ninguém repara.
    for (const [rota, { headline, tagline }] of Object.entries(OG_CARDS)) {
      expect(O_TEXTO_ESCAPA.test(headline + tagline), `${rota}`).toBe(false);
    }
  });
});

describe('forma do card', () => {
  it('mede 1200×630', () => {
    expect(OG_SIZE).toEqual({ width: 1200, height: 630 });
  });

  it('a manchete longa cai para o corpo menor, e só ela', async () => {
    const manchetes = [
      ...Object.values(OG_CARDS).map((card) => card.headline),
      ...(await getAllProjects()).map((project) => project.name),
    ];
    const menores = manchetes.filter((h) => ogHeadlineSize(h) < ogHeadlineSize('Sobre'));
    expect(menores).toEqual(['Projetos e experiência']);
  });
});

describe('contraste do texto sobre o preenchimento', () => {
  /**
   * O piso da WCAG para texto grande. O card inteiro é texto grande: o menor
   * corpo dele é `OG_MIN_FONT_SIZE`, e a regra chama de grande tudo a partir de
   * 24px. Enquanto o menor corpo respeitar isso, 3:1 é o piso certo.
   */
  const AA_TEXTO_GRANDE = 3;
  const TEXTO_GRANDE_A_PARTIR_DE = 24;

  it('o menor corpo do card ainda conta como texto grande', () => {
    expect(OG_MIN_FONT_SIZE).toBeGreaterThanOrEqual(TEXTO_GRANDE_A_PARTIR_DE);
  });

  it('o card neutro é o par que o :root já declara quando ninguém empresta cor', () => {
    // Não é cor nova: `--accent` cai em `--ink` e `--accent-ink` em `--paper`.
    expect(OG_NEUTRAL).toEqual({ fill: '#14161A', ink: '#FAFAFA' });
    expect(contrastRatio(OG_NEUTRAL.ink, OG_NEUTRAL.fill)).toBeGreaterThanOrEqual(
      AA_TEXTO_GRANDE,
    );
  });

  it('cada acento emprestado sustenta o texto do card', async () => {
    // O `#C8506A` do "E aí, fez?" mede 4.18:1 com `#FAFAFA`: passa aqui e
    // reprovaria em texto de corpo. É o motivo de o card não ter texto pequeno.
    for (const project of await getAllProjects()) {
      const ratio = contrastRatio('#FAFAFA', project.accent);
      expect(ratio, `${project.slug}: ${ratio.toFixed(2)}:1 sobre ${project.accent}`)
        .toBeGreaterThanOrEqual(AA_TEXTO_GRANDE);
    }
  });
});
