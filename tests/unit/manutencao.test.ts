import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { ABOUT_PARAGRAPHS, EDUCATION } from '@/content/about';
import { experience } from '@/content/experience';
import { META } from '@/content/site';
import { LAYER_2_CAVEAT } from '@/content/tech';
import { getAllProjects } from '@/lib/projects';

/**
 * §2, **baixa manutenção por design**: "o site tem que continuar verdadeiro
 * daqui a dois anos sem ninguém editar nada. Proibido: 'atualmente estou…',
 * contagem de anos escrita à mão ('nove anos' vira mentira sozinho — calcule a
 * partir de 2017), 'recentemente', datas de última atualização, e qualquer
 * seção que precise de alimentação para não parecer abandonada."
 *
 * ## Por que isto virou teste
 *
 * Porque a falha é **silenciosa e diferida**. Um "nove anos" está correto no dia
 * em que é escrito e erra sozinho num aniversário que ninguém marca no
 * calendário; não quebra build, não some da tela, não gera relato de usuário. O
 * §4.1 dá o nome exato: "número escrito à mão envelhece sozinho e vira mentira
 * sem ninguém perceber". Ele estava em três lugares deste repo ao mesmo tempo —
 * a h1 da home, a description do `/projetos` e o resumo do CV —, o que mostra
 * que a regra sozinha não segura: quem escreve copy volta a escrever a
 * contagem, porque ela é a forma natural de dizer a coisa em português.
 *
 * ## Onde este teste olha, e onde não
 *
 * Aqui: o **texto curado** na origem — o dicionário de metadados, os parágrafos
 * do `/sobre`, o dado da experiência, o conteúdo dos cases e o CV em HTML, que
 * é a fonte do PDF e que o §4.5 obriga a dizer as mesmas palavras que o site.
 *
 * Não aqui: comentário de código. Escrever "a contagem de anos é proibida" num
 * comentário é o oposto da violação, e um teste que varresse o fonte cru faria
 * a documentação da regra derrubar a regra. O texto que chega ao visitante está
 * coberto de ponta a ponta pelo irmão deste teste em `tests/e2e/seo.spec.ts`,
 * que varre o `out/` inteiro — inclusive o HTML dos cases, que aqui só aparece
 * como MDX de origem.
 */

/**
 * Contagem de duração escrita à mão: numeral (algarismo ou por extenso) colado
 * a "ano"/"anos".
 *
 * O que **não** casa, de propósito: "Passei anos organizando repertório"
 * (§4.3), "casa repertórios entre anos" (case do Asafe) e "atravessar anos" —
 * nenhum é contagem, nenhum envelhece. O que envelhece é o número.
 *
 * "meses" fica de fora: "três domínios e três times em sete meses" (§4.5)
 * descreve um intervalo **fechado** no passado, entre duas datas que não se
 * movem. É contagem, mas não é contagem que apodrece.
 */
const CONTAGEM_DE_ANOS =
  /\b(\d+|um|uma|dois|duas|tr[êe]s|quatro|cinco|seis|sete|oito|nove|dez|onze|doze|treze|quinze|vinte)\s+anos?\b/i;

/** As outras proibições do §2, que erram pelo mesmo motivo: âncora no "hoje". */
const ANCORAS_MOVEIS = [
  /\batualmente\b/i,
  /\brecentemente\b/i,
  /última atualização/i,
  /atualizado em/i,
];

/** O texto de todas as fontes curadas, cada uma com o nome de onde veio. */
async function textoCurado(): Promise<{ origem: string; texto: string }[]> {
  const projetos = await getAllProjects();
  return [
    ...Object.entries(META).map(([rota, meta]) => ({
      origem: `META.${rota}`,
      texto: `${meta.title} ${meta.description}`,
    })),
    { origem: 'ABOUT_PARAGRAPHS', texto: ABOUT_PARAGRAPHS.join(' ') },
    { origem: 'EDUCATION', texto: Object.values(EDUCATION).join(' ') },
    { origem: 'LAYER_2_CAVEAT', texto: LAYER_2_CAVEAT },
    ...experience.map((e) => ({ origem: `experience/${e.company}`, texto: JSON.stringify(e) })),
    ...projetos.map((p) => ({ origem: `content/projects/${p.slug}.mdx`, texto: JSON.stringify(p) })),
  ];
}

describe('§2 — nenhuma contagem de anos escrita à mão', () => {
  it('o texto curado ancora no ano, nunca na duração', async () => {
    for (const { origem, texto } of await textoCurado()) {
      const achado = CONTAGEM_DE_ANOS.exec(texto);
      expect(
        achado?.[0],
        `${origem} escreve "${achado?.[0]}" — o §2 proíbe contagem de anos à mão. ` +
          'Reescreva a partir do ano de início ("desde 2017"), que é permanente.',
      ).toBeUndefined();
    }
  });

  it('o texto curado não se ancora no "hoje" de quem escreveu (§2)', async () => {
    for (const { origem, texto } of await textoCurado()) {
      for (const padrao of ANCORAS_MOVEIS) {
        expect(texto, `${origem} × ${padrao}`).not.toMatch(padrao);
      }
    }
  });

  it('a âncora do §4.1 continua escrita onde ela importa', async () => {
    // O oposto do teste acima, e ele existe para que a regra não seja cumprida
    // apagando a informação: o §4.1 quer "desde 2017" na tese, e o §4.3 quer no
    // parágrafo de carreira. Tirar o número inteiro passaria na proibição e
    // perderia o dado.
    expect(ABOUT_PARAGRAPHS[1]).toContain('desde 2017');
    expect(META.projetos.description).toContain('desde 2017');
  });
});

describe('§4.5 — o CV em HTML conta a mesma história que o site', () => {
  /** O texto visível do CV: sem `<style>`, sem tags, sem entidade. */
  function textoDoCv(): string {
    const html = readFileSync(join(process.cwd(), 'docs/cv/luiz-freitas.html'), 'utf8');
    return html
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<!--[\s\S]*?-->/g, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&[a-z]+;/gi, ' ')
      .replace(/\s+/g, ' ');
  }

  it('o CV também não conta anos à mão', () => {
    // O §4.5 é explícito: "o site e o CV contam a mesma história com as mesmas
    // palavras — se um mudar, mude o outro, porque quem lê os dois nota a
    // divergência". Consertar só o site criaria uma divergência nova em vez de
    // resolver a antiga: o resumo dizia "Desenvolvedor full stack há nove anos".
    const achado = CONTAGEM_DE_ANOS.exec(textoDoCv());
    expect(
      achado?.[0],
      `docs/cv/luiz-freitas.html escreve "${achado?.[0]}". O PDF publicado é ` +
        'gerado a partir deste HTML — corrija aqui e regere o PDF.',
    ).toBeUndefined();
  });

  it('o CV abre com a mesma âncora do site', () => {
    expect(textoDoCv()).toContain('desde 2017');
  });
});
